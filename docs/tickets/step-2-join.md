# Step 2: Join page saves a first name

**Labels:** slice-1, priority: high · **Milestone:** Slice 1: working line (top priority) · **Depends on:** Step 1

## Goal
A guest can type their first name and join the line.

## What to build
- Join page: the pop-up name (placeholder "Lexie Wilcox Photography pop-up"), one first-name box, a Join button.
- On Join, create a doc in the Firestore collection `guests` with `firstName` (trimmed, 1 to 30 characters), `joinedAt` (server timestamp) and `status: "waiting"`.
- Store the new doc id in `localStorage`.
- Large tap targets, high contrast, easy to read in sunlight.

## Done when
- [ ] Lexie types a name on her phone, taps Join, and sees it appear in the Firebase console.
- [ ] An empty name, or one over 30 characters, is not saved.

## Out of scope
Phone numbers, emails, photos, accounts.

See the full brief: [docs/build-brief-slice-1.md](../build-brief-slice-1.md).
