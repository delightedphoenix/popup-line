// Step 4: Dashboard with passcode. A light lock for Lexie only: the page
// checks the passcode she stored in Firestore (settings/dashboard) and then
// shows the line of waiting guests, first names only, live with onSnapshot.
// Static page, Firebase JS SDK (modular) from the CDN. No build step.

import { initializeApp } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-app.js";
import {
  collection,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  query,
  where,
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

let lineListenerStarted = false;

function setSignInMessage(text) {
  signInMessage.textContent = text;
}

function renderLine(docs) {
  const guests = docs.map((guestDoc) => {
    const data = guestDoc.data({ serverTimestamps: "estimate" });
    return {
      id: guestDoc.id,
      firstName: data.firstName,
      joinedAtMs: data.joinedAt ? data.joinedAt.toMillis() : null,
    };
  });

  // Same order rule as join.js: joinedAt first, ties broken by document id.
  // Timestamps that are not known yet (null) sort to the end.
  guests.sort((a, b) => {
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
  });

  // Re-render the whole list on each snapshot; names go in as text only.
  lineList.textContent = "";
  for (const guest of guests) {
    const item = document.createElement("li");
    item.textContent = guest.firstName || "";
    lineList.appendChild(item);
  }

  lineHeading.textContent =
    guests.length === 0
      ? "No one is waiting yet."
      : guests.length + " waiting";
  lineError.hidden = true;
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
}

function unlock() {
  openButton.disabled = false;
  signInForm.hidden = true;
  lineView.hidden = false;
  startLineListener();
}

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
