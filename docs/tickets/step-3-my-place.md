# Step 3: "My place in line" page

**Labels:** slice-1, priority: high · **Milestone:** Slice 1: working line (top priority) · **Depends on:** Step 2

## Goal
After joining, a guest sees their live place in line without refreshing.

## What to build
- My place page: "Hi {name}, you're #N in line."
- Place in line = count of `waiting` guests with an earlier `joinedAt`, plus one, kept live with Firestore `onSnapshot`.
- If the guest's status is `called`, show a big "You're up!"
- If the guest closes and reopens the page, use the id in `localStorage` so they keep their place.

## Done when
- [ ] Join from two phones (or two browser tabs): they show #1 and #2.
- [ ] Delete the first guest in the Firebase console: the second moves to #1 on its own.
- [ ] Close and reopen the page: the guest still sees their place.

## Out of scope
The dashboard and the Next button.

See the full brief: [docs/build-brief-slice-1.md](../build-brief-slice-1.md).
