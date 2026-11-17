// Step 5: Dashboard with Next and No-show buttons. A light lock for Lexie
// only: the page checks the passcode she stored in Firestore
// (settings/dashboard) and then shows the line of waiting guests (first
// names only, live with onSnapshot), the guest who is up now, and two
// buttons: Next calls the oldest waiting guest (and marks any called guest
// done), No-show removes a called guest. Both actions run as Firestore
// transactions. Static page, Firebase JS SDK (modular) from the CDN. No build step.

import { initializeApp } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-app.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  runTransaction,
  where,
  writeBatch,
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const UNLOCK_FLAG = "popupLineDashboardUnlocked";

const signInForm = document.getElementById("sign-in-form");
const passcodeInput = document.getElementById("passcode");
const openButton = signInForm.querySelector(".join-btn");
const signInMessage = document.getElementById("sign-in-message");

const lineView = document.getElementById("line-view");
const lineHeading = document.getElementById("line-heading");
const lineList = document.getElementById("line-list");
const lineError = document.getElementById("line-error");
const nowUpName = document.getElementById("now-up-name");
const nextBtn = document.getElementById("next-btn");
const noshowBtn = document.getElementById("noshow-btn");
const endBtn = document.getElementById("end-btn");
const actionMessage = document.getElementById("action-message");
const endMessage = document.getElementById("end-message");

let lineListenerStarted = false;

// Latest snapshots, kept sorted (oldest joinedAt first). Module variables
// so the buttons always act on the most recent data the page has seen.
let waitingGuests = [];
let calledGuests = [];
let actionRunning = false;

function setSignInMessage(text) {
  signInMessage.textContent = text;
}

// Map a snapshot's docs to plain guest records.
function mapDocsToGuests(docs) {
  return docs.map((guestDoc) => {
    const data = guestDoc.data({ serverTimestamps: "estimate" });
    return {
      id: guestDoc.id,
      firstName: data.firstName,
      joinedAtMs: data.joinedAt ? data.joinedAt.toMillis() : null,
    };
  });
}

// Same order rule as join.js: joinedAt first, ties broken by document id.
// Timestamps that are not known yet (null) sort to the end.
function compareGuests(a, b) {
  const aMissing = a.joinedAtMs === null;
  const bMissing = b.joinedAtMs === null;
  if (aMissing || bMissing) {
    if (aMissing && bMissing) {
      return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    }
    return aMissing ? 1 : -1;
  }
  if (a.joinedAtMs !== b.joinedAtMs) {
    return a.joinedAtMs - b.joinedAtMs;
  }
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

// Who is up now: the called guest with the earliest joinedAt, or "No one
// yet" when nobody is called. Names go in as text only.
function refreshNowUp() {
  const up = calledGuests.length > 0 ? calledGuests[0] : null;
  nowUpName.textContent = up && up.firstName ? up.firstName : "No one yet";
}

// Button states, refreshed after every snapshot and after every action.
function refreshButtonStates() {
  const hasWaiting = waitingGuests.length > 0;
  const hasCalled = calledGuests.length > 0;

  // Next is only useful when there is a waiting guest to call or a called
  // guest to clear. No-show needs a called guest to remove.
  nextBtn.disabled = actionRunning || (!hasWaiting && !hasCalled);
  noshowBtn.disabled = actionRunning || !hasCalled;
  // End event is always available (it also clears an empty line); it is
  // disabled only while one of the actions is running.
  endBtn.disabled = actionRunning;
}

function renderLine(docs) {
  waitingGuests = mapDocsToGuests(docs).sort(compareGuests);

  // Re-render the whole list on each snapshot; names go in as text only.
  lineList.textContent = "";
  for (const guest of waitingGuests) {
    const item = document.createElement("li");
    item.textContent = guest.firstName || "";
    lineList.appendChild(item);
  }

  lineHeading.textContent =
    waitingGuests.length === 0
      ? "No one is waiting yet."
      : `${waitingGuests.length} guest${waitingGuests.length === 1 ? "" : "s"} waiting`;

  lineError.hidden = true;

  refreshNowUp();
  refreshButtonStates();
}

function renderCalled(docs) {
  calledGuests = mapDocsToGuests(docs).sort(compareGuests);
  lineError.hidden = true;
  refreshNowUp();
  refreshButtonStates();
}

function showActionError() {
  actionMessage.textContent = "That didn't go through. Please try again.";
}

function clearActionMessage() {
  actionMessage.textContent = "";
}

// NEXT: in one transaction, mark any still-called guest done and call the
// oldest waiting guest. Firestore web transactions can't run queries, so
// the ids come from the latest snapshots.
async function handleNext() {
  if (actionRunning) return;
  actionRunning = true;
  clearActionMessage();
  refreshButtonStates();

  try {
    const calledIds = calledGuests.map((guest) => guest.id);
    const firstWaitingId =
      waitingGuests.length > 0 ? waitingGuests[0].id : null;

    await runTransaction(db, async (tx) => {
      const calledRefs = calledIds.map((id) => doc(db, "guests", id));
      let waitingRef = null;
      if (firstWaitingId) {
        waitingRef = doc(db, "guests", firstWaitingId);
      }

      // Read every doc we will touch first.
      const calledSnapshots = await Promise.all(
        calledRefs.map((ref) => tx.get(ref))
      );
      const waitingSnapshot = waitingRef
        ? await tx.get(waitingRef)
        : null;

      // Each still-called guest becomes done.
      for (const snapshot of calledSnapshots) {
        if (snapshot.exists() && snapshot.data().status === "called") {
          tx.update(snapshot.ref, { status: "done" });
        }
      }

      // The oldest waiting guest becomes called. If the state changed
      // underneath us, throw so the whole transaction rolls back.
      if (waitingRef) {
        if (
          !waitingSnapshot.exists() ||
          waitingSnapshot.data().status !== "waiting"
        ) {
          throw new Error("Waiting guest changed before the update.");
        }
        tx.update(waitingSnapshot.ref, { status: "called" });
      }
    });

    clearActionMessage();
  } catch (_err) {
    showActionError();
  } finally {
    actionRunning = false;
    refreshButtonStates();
  }
}

// NO-SHOW: in one transaction, mark every still-called guest as a no-show.
// It does not call the next guest; Lexie taps Next for that.
async function handleNoShow() {
  if (actionRunning) return;
  actionRunning = true;
  clearActionMessage();
  refreshButtonStates();

  try {
    const calledIds = calledGuests.map((guest) => guest.id);

    await runTransaction(db, async (tx) => {
      const calledRefs = calledIds.map((id) => doc(db, "guests", id));
      const calledSnapshots = await Promise.all(
        calledRefs.map((ref) => tx.get(ref))
      );

      for (const snapshot of calledSnapshots) {
        if (snapshot.exists() && snapshot.data().status === "called") {
          tx.update(snapshot.ref, { status: "noshow" });
        }
      }
    });

    clearActionMessage();
  } catch (_err) {
    showActionError();
  } finally {
    actionRunning = false;
    refreshButtonStates();
  }
}

// END EVENT: after an "Are you sure?" check, delete every doc in `guests`
// (all statuses) with writeBatch, in batches of at most 400, committing each
// batch. This is a destructive, one-way action.
async function handleEndEvent() {
  if (actionRunning) return;

  const sure = window.confirm(
    "End the event? This removes everyone from the line and cannot be undone."
  );
  if (!sure) {
    return;
  }

  actionRunning = true;
  endMessage.textContent = "";
  refreshButtonStates();

  try {
    const snapshot = await getDocs(collection(db, "guests"));
    const refs = snapshot.docs.map((guestDoc) => guestDoc.ref);

    const BATCH_SIZE = 400;
    for (let i = 0; i < refs.length; i += BATCH_SIZE) {
      const batch = writeBatch(db);
      for (let j = i; j < i + BATCH_SIZE && j < refs.length; j++) {
        batch.delete(refs[j]);
      }
      await batch.commit();
    }

    endMessage.textContent = "The line is empty.";
  } catch (_err) {
    endMessage.textContent = "That didn't go through. Please try again.";
  } finally {
    actionRunning = false;
    refreshButtonStates();
  }
}

function startLineListener() {
  if (lineListenerStarted) return;
  lineListenerStarted = true;

  const waitingQuery = query(
    collection(db, "guests"),
    where("status", "==", "waiting")
  );
  onSnapshot(
    waitingQuery,
    (snapshot) => {
      renderLine(snapshot.docs);
    },
    () => {
      lineError.hidden = false;
    }
  );

  const calledQuery = query(
    collection(db, "guests"),
    where("status", "==", "called")
  );
  onSnapshot(
    calledQuery,
    (snapshot) => {
      renderCalled(snapshot.docs);
    },
    () => {
      lineError.hidden = false;
    }
  );
}

function unlock() {
  openButton.disabled = false;
  signInForm.hidden = true;
  lineView.hidden = false;
  startLineListener();
}

nextBtn.addEventListener("click", handleNext);
noshowBtn.addEventListener("click", handleNoShow);
endBtn.addEventListener("click", handleEndEvent);

signInForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const typed = passcodeInput.value.trim();

  if (typed.length === 0) {
    setSignInMessage("Please type the passcode.");
    passcodeInput.focus();
    return;
  }

  openButton.disabled = true;
  setSignInMessage("");

  try {
    // v1: light lock only, checked in the page. Slice 2 should move dashboard actions behind Firebase Auth.
    const snapshot = await getDoc(doc(db, "settings", "dashboard"));
    const storedPasscode = snapshot.exists() ? snapshot.data().passcode : null;

    if (typeof storedPasscode !== "string" || storedPasscode.length === 0) {
      setSignInMessage("The passcode hasn't been set up yet.");
      openButton.disabled = false;
      return;
    }

    if (typed !== storedPasscode) {
      setSignInMessage("That passcode isn't right.");
      passcodeInput.value = "";
      openButton.disabled = false;
      return;
    }

    try {
      sessionStorage.setItem(UNLOCK_FLAG, "1");
    } catch (_storageErr) {
      // Best effort; this tab still unlocks below.
    }

    unlock();
  } catch (_err) {
    setSignInMessage("Something went wrong. Please try again.");
    openButton.disabled = false;
  }
});

// A reload in the same tab stays unlocked.
try {
  if (sessionStorage.getItem(UNLOCK_FLAG) === "1") {
    unlock();
  }
} catch (_storageErr) {
  // Storage unavailable (for example private browsing): stay locked.
}
