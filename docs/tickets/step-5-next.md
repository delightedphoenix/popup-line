# Step 5: Next and No-show buttons

**Labels:** slice-1, priority: high · **Milestone:** Slice 1: working line (top priority) · **Depends on:** Step 4

## Goal
Lexie taps Next to call the next guest, and their phone tells them it's their turn.

## What to build
- A big Next button: in one Firestore transaction, set any currently `called` guest to `done` and the oldest `waiting` guest to `called`.
- A No-show button that sets the called guest to `noshow`.

## Done when
- [ ] Lexie taps Next and, within a few seconds, the guest's phone says "You're up!"
- [ ] Everyone else in line moves up one.
- [ ] No-show takes the called guest out of the line.

## Out of scope
Text alerts (slice 2).

See the full brief: [docs/build-brief-slice-1.md](../build-brief-slice-1.md).
