# Step 4: Dashboard with passcode

**Labels:** slice-1, priority: high · **Milestone:** Slice 1: working line (top priority) · **Depends on:** Step 3

## Goal
Lexie can open a dashboard on her phone and see the line in order.

## What to build
- Dashboard sign-in screen with one passcode box, nothing else.
- Dashboard listing waiting guests in order, first names only, live with `onSnapshot`.
- v1 passcode is a light lock checked on the page only. Add a code comment that slice 2 should move dashboard actions behind Firebase Auth.
- Don't put the real passcode in the repo; agree with Lexie how it's set.

## Done when
- [ ] A wrong passcode is turned away.
- [ ] The right passcode shows the line in order.

## Out of scope
Next, No-show and End event buttons (next steps).

See the full brief: [docs/build-brief-slice-1.md](../build-brief-slice-1.md).
