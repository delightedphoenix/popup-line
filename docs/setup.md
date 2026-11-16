# Setup

## Done so far

- **Firebase project** created.
- **Web app** registered in that Firebase project, with **Firebase Hosting** turned on.
- **Cloud Firestore** database created in **test mode**, in a US location.
- **GitHub repository** created (this one).

## Firebase web config

The Firebase web config (the small block of settings Firebase shows when you register a web app) is kept by Lexie. It is **not** in this repository yet.

Lexie's coding agent should add it when building step 1 (the live page), using the values Lexie provides. Don't invent or guess any of these values.

## Still to do before a real event

- **Lock down Firestore.** Test mode leaves the database open to anyone and expires after 30 days. Replace it with proper security rules (see the "Passcode" note in the build brief) before the app is used at a real pop-up.
- Run the final test from the build brief: a dry run with three or four friends.
