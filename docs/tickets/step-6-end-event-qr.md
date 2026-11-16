# Step 6: End event, QR code page and lock-down

**Labels:** slice-1, priority: high · **Milestone:** Slice 1: working line (top priority) · **Depends on:** Step 5

## Goal
Lexie can clear the line after an event and print a QR code guests scan to join.

## What to build
- End event button on the dashboard: batch-delete every doc in `guests`, after an "Are you sure?" check.
- A print page that makes a QR code for the Join page URL in the browser, with a small QR library, printable at letter size.
- Replace Firestore test-mode rules: guests may create a doc with only `firstName` and the required fields, and may read the queue.

## Done when
- [ ] End event empties the line.
- [ ] Lexie prints the QR, scans it with her phone, and lands on the Join page.
- [ ] Firestore is no longer in test mode.
- [ ] Final test: a dry run with three or four friends in the living room.

## Out of scope
SMS, email, galleries, payments, tips, user accounts, photo upload.

See the full brief: [docs/build-brief-slice-1.md](../build-brief-slice-1.md).
