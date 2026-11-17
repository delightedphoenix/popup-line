// Step 2: Join page. Saves a guest's first name to the Firestore "guests"
// collection and remembers the new document id in localStorage.
// Step 3: "My place" view. Shows the guest's live place in line with
// onSnapshot listeners (their own doc, plus all waiting guests), turns into
// a big "You're up!" when they are called, and keeps their place across
// page reloads via the stored id.
// Static page, Firebase JS SDK (modular) from the CDN. No build step.

import { initializeApp } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-app.js";
import {
  addDoc,
  collection,
  doc,
  getFirestore,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const guestsRef = collection(db, "guests");

const form = document.getElementById("join-form");
const nameInput = document.getElementById("first-name");
const joinButton = form.querySelector(".join-btn");
const messageEl = document.getElementById("form-message");

const myPlace = document.getElementById("my-place");
const upGreeting = document.getElementById("mp-up-greeting");
const upName = document.getElementById("mp-up-name");
const upBig = document.getElementById("mp-up");
const waitingLine = document.getElementById("mp-waiting");
const waitingName = document.getElementById("mp-waiting-name");
const placeNumberEl = document.getElementById("mp-number");
const findingLine = document.getElementById("mp-finding");
const findingName = document.getElementById("mp-finding-name");
const doneLine = document.getElementById("mp-done");
const doneName = document.getElementById("mp-done-name");
const errorLine = document.getElementById("mp-error");

const MAX_NAME_LENGTH = 30;
const STORAGE_KEY = "popupLineGuestId";

let myPlaceActive = false;
let guestId = null;
let guestFirstName = null;
let guestStatus = null;
let guestJoinedAtMs = null;
let waitingGuests = null; // null until the waiting-queue snapshot has loaded
const unsubscribers = [];

// One visible block at a time inside the my-place view.
const myPlaceBlocks = {
  up: [upGreeting, upBig],
  waiting: [waitingLine],
  finding: [findingLine],
  done: [doneLine],
  error: [errorLine],
};

function showBlock(key) {
  for (const [blockName, els] of Object.entries(myPlaceBlocks)) {
    const hide = blockName !== key;
    for (const el of els) {
      el.hidden = hide;
    }
  }
}

function setMessage(text) {
  messageEl.textContent = text;
}

// Place in line = 1 + the number of waiting guests whose joinedAt is
// earlier than this guest's. Ties (same millisecond, or timestamps not
// known yet) are broken by document id so two guests never show the
// same number.
function placeInLine() {
  if (!guestId || waitingGuests === null) return null;
  let earlier = 0;
  for (const other of waitingGuests) {
    let isEarlier;
    if (guestJoinedAtMs !== null && other.joinedAtMs !== null) {
      isEarlier =
        other.joinedAtMs < guestJoinedAtMs ||
        (other.joinedAtMs === guestJoinedAtMs && other.id < guestId);
    } else {
      isEarlier = other.id < guestId;
    }
    if (isEarlier) {
      earlier += 1;
    }
  }
  return earlier + 1;
}

function renderMyPlace() {
  if (guestStatus === null) return; // own doc snapshot has not arrived yet

  if (guestStatus === "waiting") {
    const place = placeInLine();
    if (place === null) {
      findingName.textContent = guestFirstName || "";
      showBlock("finding");
    } else {
      waitingName.textContent = guestFirstName || "";
      placeNumberEl.textContent = "#" + place;
      showBlock("waiting");
    }
  } else if (guestStatus === "called") {
    upName.textContent = guestFirstName || "";
    showBlock("up");
  } else {
    // "done", "noshow", or any other status: the guest's turn is over.
    doneName.textContent = guestFirstName || "";
    showBlock("done");
  }
}

function showMyPlaceError() {
  if (!myPlaceActive) return;
  showBlock("error");
}

function stopMyPlaceView() {
  myPlaceActive = false;
  guestId = null;
  guestFirstName = null;
  guestStatus = null;
  guestJoinedAtMs = null;
  waitingGuests = null;
  showBlock(null); // hides every block
  while (unsubscribers.length > 0) {
    const unsubscribe = unsubscribers.pop();
    try {
      unsubscribe();
    } catch (_err) {
      // Listener already detached; nothing left to clean up.
    }
  }
  myPlace.hidden = true;
}

function startMyPlaceView(id) {
  stopMyPlaceView();
  myPlaceActive = true;
  guestId = id;
  myPlace.hidden = false;
  form.hidden = true;

  // Listener 1: the guest's own document.
  unsubscribers.push(
    onSnapshot(
      doc(db, "guests", id),
      (snapshot) => {
        if (!snapshot.exists()) {
          // Only the server can say the guest is gone. A "missing" answer
          // from the local cache (for example with no signal) is ignored,
          // so a guest never loses their place because of a bad connection.
          if (snapshot.metadata.fromCache) return;

          // This guest is no longer in the line: forget the id and offer
          // to join again.
          try {
            localStorage.removeItem(STORAGE_KEY);
          } catch (_err) {
            // Best-effort cleanup; the form still gets shown below.
          }
          stopMyPlaceView();
          nameInput.value = "";
          joinButton.disabled = false;
          form.hidden = false;
          return;
        }

        const data = snapshot.data({ serverTimestamps: "estimate" });
        guestFirstName = data.firstName;
        guestStatus = data.status;
        guestJoinedAtMs = data.joinedAt ? data.joinedAt.toMillis() : null;
        renderMyPlace();
      },
      showMyPlaceError
    )
  );

  // Listener 2: everyone waiting, to work out the place in line.
  const waitingQuery = query(guestsRef, where("status", "==", "waiting"));
  unsubscribers.push(
    onSnapshot(
      waitingQuery,
      (snapshot) => {
        waitingGuests = snapshot.docs.map((guestDoc) => {
          const data = guestDoc.data({ serverTimestamps: "estimate" });
          return {
            id: guestDoc.id,
            joinedAtMs: data.joinedAt ? data.joinedAt.toMillis() : null,
          };
        });
        renderMyPlace();
      },
      showMyPlaceError
    )
  );
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const firstName = nameInput.value.trim();

  if (firstName.length === 0) {
    setMessage("Please type your first name.");
    nameInput.focus();
    return;
  }

  if (firstName.length > MAX_NAME_LENGTH) {
    setMessage("Please use 30 characters or fewer.");
    nameInput.focus();
    return;
  }

  joinButton.disabled = true;
  setMessage("");

  try {
    const docRef = await addDoc(guestsRef, {
      firstName,
      joinedAt: serverTimestamp(),
      status: "waiting",
    });

    try {
      localStorage.setItem(STORAGE_KEY, docRef.id);
    } catch (_storageErr) {
      // Remembering the id is best-effort; the guest was already saved above.
    }

    startMyPlaceView(docRef.id);
  } catch (_err) {
    setMessage("Something went wrong. Please try again.");
    joinButton.disabled = false;
  }
});

// If this browser has already joined, reopen the guest's live my-place
// view instead of the join form.
let storedGuestId = null;
try {
  storedGuestId = localStorage.getItem(STORAGE_KEY);
} catch (_err) {
  // Storage unavailable (for example private browsing): join as new.
}
if (storedGuestId) {
  startMyPlaceView(storedGuestId);
}
