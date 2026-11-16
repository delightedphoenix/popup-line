# Pop-Up Line

A simple check-in and virtual line for the free portrait pop-up booths run by **Lexie Wilcox Photography**.

Guests scan a QR code at the booth, type their first name, and watch their place in line on their own phone, so nobody has to stand and wait. Lexie keeps a dashboard open on her phone and taps **Next** when she's ready for the next person.

## Status

**Slice 1 is not built yet.** This repository currently holds the plan and the decisions behind it. The code will be added one build step at a time, following the build brief.

## How the docs are laid out

| File | What's in it |
| --- | --- |
| [docs/build-brief-slice-1.md](docs/build-brief-slice-1.md) | The full build brief for slice 1: screens, data, build order, and technical notes for the coding agents. **Start here.** |
| [docs/decisions.md](docs/decisions.md) | Decisions made so far, and why. |
| [docs/setup.md](docs/setup.md) | What has already been set up (Firebase, GitHub) and what is still to do. |
| [docs/roadmap.md](docs/roadmap.md) | What comes after slice 1. |
| [docs/tickets/](docs/tickets/) | One ticket per build step for slice 1, for the coding agents. |

## Tickets for the coding agents

**Top priority is Slice 1, a working line you can try on a phone.** Work the Slice 1 tickets in order, one at a time, and test each on a phone before starting the next. **Nothing else gets built until Slice 1 works on a phone.**

The work is grouped into three chunks (GitHub milestones):

- **Slice 1: working line (top priority).** Six tickets below, labeled `slice-1` and `priority: high`.
- **Slice 2: text alerts.** One placeholder, labeled `later`: [docs/tickets/later/slice-2-text-alerts.md](docs/tickets/later/slice-2-text-alerts.md).
- **Slice 3: photo galleries.** One placeholder, labeled `later`: [docs/tickets/later/slice-3-photo-galleries.md](docs/tickets/later/slice-3-photo-galleries.md).

### Slice 1 tickets, in order

1. [Step 1: Live "Coming soon" page](docs/tickets/step-1-live-page.md)
2. [Step 2: Join page saves a first name](docs/tickets/step-2-join.md)
3. [Step 3: "My place in line" page](docs/tickets/step-3-my-place.md)
4. [Step 4: Dashboard with passcode](docs/tickets/step-4-dashboard.md)
5. [Step 5: Next and No-show buttons](docs/tickets/step-5-next.md)
6. [Step 6: End event, QR code page and lock-down](docs/tickets/step-6-end-event-qr.md)

## Rules for anyone working in this repo

- Work one build step at a time, and explain the plan in plain words before writing code.
- Make small commits with a short note on each.
- Never commit passwords, private keys, or other secrets.
- The look is Lexie's own. Don't copy another photographer's name, wording, or design.
