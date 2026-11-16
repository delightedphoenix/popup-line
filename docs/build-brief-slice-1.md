# Pop-Up Line App: Slice 1 Build Brief

2026-11-16 · For Lexie Wilcox Photography

## Goal

Let guests at a free portrait pop-up join a line from their phone and see when it's their turn, so nobody has to stand and wait.

## Who uses it

- **Guests:** scan a QR code at the booth, type their first name, and watch their place in line.
- **Lexie:** keeps a dashboard open on her phone and taps Next when she's ready for the next person.

## The four screens

1. **Join page** (where the QR code lands): the pop-up name (placeholder: "Lexie Wilcox Photography pop-up"), one box for first name, and a Join button.
2. **My place page:** "Hi Maya, you're #3 in line." It updates on its own, with no refreshing. When Lexie calls them, it changes to a big "You're up!" If the guest closes and reopens the page, they keep their place.
3. **Dashboard sign-in:** one passcode box. Nothing else.
4. **Dashboard:** the line in order (first names only), a big Next button that calls the next guest, a No-show button for someone who doesn't come up, and an End event button that clears everything.

The look should be Lexie's own: simple, warm, easy to read in sunlight. No copying another photographer's name, wording or design.

## What it keeps

Only a guest's first name, when they joined, and whether they're waiting, called or done. No phone numbers, emails or photos. End event deletes it all.

## Tools (one pick)

**Firebase**, Google's free starter plan (called Spark). It gives you a free public web address, a database that pushes changes to phones instantly (that's how "your place in line" updates by itself), and no server to run. Your agents write plain web pages; no app store needed. You'll need a Google account to make the Firebase project yourself, since agents can't click through sign-ups for you.

## Build order

Do these one at a time. Each step ends with something you can try on your phone.

1. **Live page:** a blank "Coming soon" page at your public address. Done when it opens on your phone.
2. **Join:** the Join page saves a first name. Done when you type a name on your phone and see it appear in the Firebase console.
3. **My place:** the place-in-line page. Done when you join from two phones (or two browser tabs) and they show #1 and #2, and the second moves to #1 when you delete the first in the console.
4. **Dashboard:** passcode screen plus the list. Done when the wrong passcode is turned away and the right one shows the line in order.
5. **Next:** done when you tap Next and, within a few seconds, the guest's phone says "You're up!" and everyone else moves up one.
6. **End event and QR code:** End event empties the line; a print page shows a QR code for the Join page. Done when you print the QR, scan it, and land on Join.

Final test: a dry run with three or four friends in your living room.

## Working with your agents

- Make a new, empty GitHub repository for this project yourself, then give agents access to it.
- Hand over one build step at a time. Ask the agent to explain its plan in plain words before it writes code.
- Ask for small saves (commits) with a short note on each, so you can always go back.
- After each step, test on your phone before moving on. If something's wrong, describe what you saw, not what you think the fix is.
- If you use more than one agent, let one build and a second one review, rather than both editing at once.
- Never let an agent put passwords or private keys in the repository.

## Coming next

- **Slice 2:** a text alert when a guest is two spots away (needs their phone number and their OK to be texted).
- **Slice 3:** a private gallery link sent to each guest after the event.

## For the coding agents (technical notes)

- **Stack:** static HTML/CSS/vanilla JS (no framework, no build step), Firebase Hosting, Cloud Firestore on the Spark plan, Firebase JS SDK (modular) loaded from the CDN. Deploy with the Firebase CLI.
- **Data:** one collection `guests` with fields `firstName` (string, trimmed, 1 to 30 chars), `joinedAt` (server timestamp), `status` (`waiting` | `called` | `done` | `noshow`). Place in line = count of `waiting` docs with earlier `joinedAt`, plus one.
- **Live updates:** use Firestore `onSnapshot` on both the guest page and the dashboard. Store the guest's doc id in `localStorage` so a reload keeps their place.
- **Next:** set the oldest `waiting` guest to `called` and any currently `called` guest to `done`, in one transaction.
- **Passcode:** v1 checks a passcode on the dashboard page only. Treat it as a light lock, not real security; acceptable because the only data is first names. Write Firestore rules so guests can create a doc with only `firstName` and the required fields, and can read the queue. Flag in a code comment that slice 2 should move dashboard actions behind Firebase Auth.
- **End event:** batch-delete all docs in `guests`.
- **QR page:** generate client-side from the Join page URL with a small QR library; printable at letter size.
- **Mobile first:** large tap targets, high contrast, works on iPhone Safari and Android Chrome.
- **Out of scope:** SMS, email, galleries, payments, tips, user accounts, photo upload.
- **Commits:** one build step per branch or small series of commits, with a README that explains how to deploy in plain steps.
