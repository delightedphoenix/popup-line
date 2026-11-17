# Step 7: Session times and photo log

**Labels:** slice-1.5 · **Depends on:** Step 6, and the Slice 1 dry run passing

## Goal
Lexie can match each guest to their photos by time. The app records when each guest's turn starts and ends, and Lexie can save that list before the line is cleared.

## What to build
- **Record start and end times.** When Next calls a guest (`waiting` to `called`), save `calledAt` as the server time. When that guest becomes `done` or `noshow`, save `endedAt` as the server time. Do both inside the existing Next and No-show transactions in `public/dashboard.js`.
- **End the last guest's turn.** Tapping Next when no one is waiting still ends the current guest's turn and records `endedAt`. Add a small **Finish** button that only shows then, so the last session can be closed without calling anyone.
- **Session log on the dashboard.** A list of everyone who has been called today: first name, start time, end time and how many minutes. Times are in Phoenix time, with seconds (for example 2:14:05 PM). No-shows are marked.
- **Download the log.** A **Download log** button saves the list as a CSV file (`first name, start, end, minutes, no-show`). The file name includes the date, for example `popup-log-2026-11-21.csv`.
- **Protect the log before End event.** The End event "Are you sure?" check says the log will be deleted and offers **Download log first**. End event only runs after Lexie confirms.
- **Clock check for the camera.** The top of the dashboard shows the phone's current time with seconds, so Lexie can set her camera clock to match before the event starts. Add one line under it: "Set your camera to this time before you start."
- **Update the Firestore rules.** Today only `status` can change. Also allow `calledAt` and `endedAt` to be set once, only to `request.time`, and only with a matching status change. Guests still can't set these fields when they join.

## Done when
- [ ] Call three guests in a row: each gets a start time, and the one before gets an end time.
- [ ] A no-show gets an end time and is marked in the log.
- [ ] The last guest's turn can be finished without anyone waiting.
- [ ] Download log saves a CSV that opens on Lexie's phone, with times that match the dashboard.
- [ ] End event warns about the log and offers the download first.
- [ ] Take a few test photos while calling guests, and check that the photo timestamps fall inside each guest's start and end times.

## Notes
- The start time is when the guest is called, so it includes their walk to the booth. That's fine for matching photos, because no photos are taken in that gap.
- Use server time (`serverTimestamp()`), not the phone's clock, so the times don't depend on whose phone tapped Next.
- Store nothing new about the guest: still only their first name.

## Out of scope
Matching photos to guests automatically, galleries, texts, user accounts.

See the full brief: [docs/build-brief-slice-1.md](../build-brief-slice-1.md).
