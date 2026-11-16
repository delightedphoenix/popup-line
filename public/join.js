// Step 2: Join page. Saves a guest's first name to the Firestore "guests"
// collection and remembers the new document id in localStorage.
// Static page, Firebase JS SDK (modular) from the CDN. No build step.

import { initializeApp } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-app.js";
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const guestsRef = collection(db, "guests");

const form = document.getElementById("join-form");
const nameInput = document.getElementById("first-name");
const joinButton = form.querySelector(".join-btn");
const messageEl = document.getElementById("form-message");
const confirmation = document.getElementById("confirmation");
const confirmName = document.getElementById("confirm-name");

const MAX_NAME_LENGTH = 30;

function setMessage(text) {
  messageEl.textContent = text;
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
      localStorage.setItem("popupLineGuestId", docRef.id);
    } catch (_storageErr) {
      // Remembering the id is best-effort; the guest was already saved above.
    }

    confirmName.textContent = firstName;
    form.hidden = true;
    confirmation.hidden = false;
  } catch (_err) {
    setMessage("Something went wrong. Please try again.");
    joinButton.disabled = false;
  }
});
