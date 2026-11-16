# Decisions so far

Decisions made while planning the app, with the reason where there was one.

## What the app is for

- **Used at pop-ups.** The app is for Lexie Wilcox Photography's free portrait pop-up booths.
- **First priority: managing the line.** Before anything else, the app has to let guests join a line and see when it's their turn.

## Slice 1 (the first small version)

Slice 1 is a small, complete version that proves the idea:

1. A guest scans a QR code at the booth.
2. The guest enters their first name.
3. The guest sees their live place in line, updating on its own.
4. Lexie has a dashboard on her phone with a **Next** button that calls the next guest.

The full details are in [build-brief-slice-1.md](build-brief-slice-1.md).

## Left out of slice 1 on purpose

- **No text messages in v1.** Text alerts come later (slice 2).
- **No galleries yet.** Sending photos to guests comes later.

## Where it runs

- **Firebase, free plan (Spark).** It gives a free public web address, a database that pushes changes to phones instantly, and no server to run.
- **Firestore started in test mode.** Test mode is open to anyone and expires after 30 days. **The database rules must be locked down before the app is used at a real event.**

## How it gets built

- Built by Lexie's own coding agents (Hermes stack with Qwen coding agents), one build step at a time.
- Each step is tested on Lexie's phone before moving on to the next.
