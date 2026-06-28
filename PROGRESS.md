# Build Progress

## Completed

**Layers 1–4 (backend):** Project scaffold (git init, `server/`/`client/` structure, deps, `.env` files). MongoDB connection (`config/db.js`, `server.js`). Mongoose models — `Teacher` (name), `Classroom` (name), `Schedule` (date string unique, nested `rows[]` with `teacherId`/`classroomId`/`rowLabel`, each row's `blocks[]` with `startTime`/`endTime`/`status` enum `green|yellow|orange`). Full REST API: Teacher/Classroom GET-all + POST-one-or-many, Schedule GET-by-date/POST-create/POST-copy/POST-row/PUT-block/DELETE-block/DELETE-row. `conflictCheck` middleware (409 on overlapping green/yellow for the same teacher across rows, orange exempt). Global error handler. Every endpoint verified by curl against a live server + real MongoDB.

**Layers 5–10 (frontend foundation):** React Router (`/` → `CalendarPage`, `/schedule/:date` → `SchedulePage`). `TeachersContext`/`ClassroomsContext` (fetch-once + add). Calendar page (month grid, prev/next nav, dot indicator on scheduled dates — checks each day individually since no list-by-month endpoint exists). Schedule page shell (`useSchedule` hook, copy-previous-day modal via a reusable `Modal`). Schedule grid (22 half-hour columns × row, colored via CSS classes, no inline styles). Drag-to-select (`useDragSelect`: mousedown/mouseenter/mouseup, normalized range) — **confirmed working directly by the user in their browser**, the first layer to get real interactive confirmation.

**Layer 11 (assignment dropdown):** `AssignmentDropdown` two-step flow — "choose" (Teacher + Classroom / Break / Meet Front Office) then "teacherClassroom" (two independent selector panels). `TeacherSelector`/`ClassroomSelector` (scrollable list, inline "+ Add new" form, auto-select on add). `AddEntityForm` (reusable: `Add` saves+closes, `Add another <entity>` saves+stays open). Confirmation summary with the spec's exact wording. On confirm: reuses an existing teacher+classroom pairing's row if one exists, else creates it then adds the block. Break/Meet Front Office post directly to the dragged row, no panels.
- **Design decision not in the original spec:** the grid starts with zero rows and rows are only ever created via this dropdown — so a virtual, non-persisted "+ Add new row" placeholder row was added as the only way to ever bootstrap the first assignment on a date. Dragging it opens the dropdown with `rowId: null`; only Teacher + Classroom is enabled there (Break/Meet Front Office need an existing row identity).

**Layer 12 (pulled forward — block edit/delete):** `BlockContextMenu` (`components/Block/`) — clicking an existing colored block opens Edit/Delete instead of starting a new drag selection. Edit reopens `AssignmentDropdown` pre-filled (including `blockId`, so the backend updates in place rather than duplicating); editing a green block's pairing to a genuinely different teacher+classroom deletes the block from the old row before creating it on the new one. Delete calls the existing block-delete endpoint.

**Layer 13 (client-side conflict pre-check + ErrorToast):** `useConflictCheck` (`hooks/`) mirrors the backend's conflict middleware exactly, run before every submit so an obvious conflict is caught without a round trip. `ErrorToast` (`components/common/`) — floating, auto-dismissing (5s) notification; both the local pre-check and any backend error flow through it in `AssignmentDropdown`.

**Layer 14 (final Phase-1 verification):** Went through all 37 items in `childcare-scheduling-project-plan.md`'s Phase 1 checklist — all checked off, backend verified end-to-end against the live server, frontend verified by reading the actual wiring plus lint/build clean. **Phase 1 was complete as of this commit.**

**Mid-build fixes and additions (each at the user's direct request while testing):**
- WSL/drvfs file-watch gap: Vite's watcher doesn't reliably see fs changes across the `/mnt/c/...` boundary, so edits were invisible to the running dev server. Fixed with `server.watch.usePolling: true` in `vite.config.js`.
- Visual design pass: wider grid cells with hover states, every half-hour slot labeled in 12-hour format (full "7 AM"/"12 PM" only at the first slot and the noon flip), shared `AppHeader` + CSS design tokens, card-based page layout, formatted date heading.
- Removed the grid's horizontal scroll (flexible `flex: 1 1 0` columns instead of fixed-width) since it made dragging difficult.
- Added the "6 PM" closing-boundary label via an end-cap cell after the last column — then fixed it again when the end-cap turned out to have no drag handlers (dead space at the end of every row).
- Row delete (hover × on the row label) and teacher/classroom rename (pencil icon, inline edit) — both explicitly requested; confirmed with the user first that rename/delete-in-place stays within Phase 1 scope (the project plan only excludes a *dedicated management page*, not in-place controls).
- Meet Front Office color changed from orange to **red** (internal status value unchanged, still `"orange"` to match the DB enum and existing data).

## Post-Phase-1 — draft/Apply save model

User asked for a different save model: instead of every action persisting immediately, edits should accumulate in a temporary state (so navigating away and back doesn't lose anything) with an explicit "Apply"/Save action, and a confirmation before a later re-save overwrites a previously-saved day. Confirmed two design questions with the user first (draft storage = server-side; confirmation = once on save, not per-edit), since this is a real architecture change.

- **Schedule model**: added `draftRows` alongside `rows`. `rows` is strictly *published*; `draftRows` is the working copy every edit applies to. Nothing reaches `rows` until `POST /api/schedule/:date/apply`.
- **Migration safety**: `getSchedule` backfills `draftRows = rows` the first time it reads a pre-existing document, then persists that backfill. Verified against the user's own real in-progress data — confirmed no data loss.
- **Backend**: `addRow`, `addOrUpdateBlock` (via conflict middleware), `deleteBlock`, `deleteRow` all target `draftRows`. `applyDraft` copies `draftRows` → `rows`, preserving row/block ids (not regenerating them). `copySchedule` copies the previous day's *published* `rows` into the new date's `draftRows`, and requires the previous day to actually have published content.
- **Frontend**: `useSchedule` exposes `isPublished`, `isDirty`, `applyAndSave()`. `ScheduleGrid` renders/edits `draftRows` only. `SchedulePage` has a status indicator + "Save Schedule" button; first save applies directly, a re-save (when published content already differs from the draft) shows `SaveConfirmModal` first.
- Calendar's dot indicator and the copy-eligibility check both switched from "schedule document exists" to "schedule has been published" (`rows.length > 0`).

## Post-Phase-1 — independent review (using-agent-skills)

Used the `using-agent-skills` meta-skill to pick a verification approach. `browser-testing-with-devtools` was initially marked unusable (no MCP server configured, Chromium's binary failed on a missing shared lib) — see below, this was later overturned. Fell back to `test-driven-development` (live-backend E2E scripting) + `code-review-and-quality`'s multi-model pattern: spawned an independent `general-purpose` agent with no memory of writing this code to do its own five-axis review and its own E2E suite, targeting the draft/Apply rework specifically.

**Verdict: Approve**, plus two minor pre-existing gaps found and fixed:
- Malformed ids on teacher/classroom routes threw an uncaught Mongoose `CastError` → raw 500 with an internal message. Fixed with `validateObjectId` middleware via `router.param('id', ...)`. `addRow`'s `teacherId`/`classroomId` (request body, not a route param) got their own inline guard.
- `POST /api/schedule/:date` accepted any string as a date with no format check. Fixed with `validateDateParam` middleware via `router.param('date', ...)`.

## Post-Phase-1 — real browser testing became possible, two real bugs found

The standing "no browser available" blocker turned out to be workable without `sudo`. **Reuse this in future sessions:**
```
# One-time per session (or check if /tmp/localdeps already has these from earlier):
cd /tmp && apt-get download libnspr4 libnss3 libasound2t64   # download-only, no root needed
mkdir -p /tmp/localdeps && cd /tmp/localdeps
dpkg-deb -x /tmp/libnspr4_*.deb . && dpkg-deb -x /tmp/libnss3_*.deb . && dpkg-deb -x /tmp/libasound2t64_*.deb .
# Then launch Chromium with:
LD_LIBRARY_PATH=/tmp/localdeps/usr/lib/x86_64-linux-gnu node your-playwright-script.js
```
Playwright itself doesn't need installing — it's already cached at `~/.npm/_npx/<hash>/node_modules/playwright` from earlier in this project (`require()` it by that path). Point `chromium.launch({ executablePath: ... })` at `~/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome` (full Chrome build, supports screenshots) with the same `LD_LIBRARY_PATH`. This gives real navigation, clicking, dragging (`page.mouse`), screenshots, and console/error capture — no more "I can't test this in a browser."

Used this to click through the app for the first time: calendar, the real `2026-06-23` data (read-only), then full interactive flows on throwaway dates (cleaned up after). Found and fixed two real bugs that API-level scripting alone never caught, because both were specifically about the *frontend* reading the *response shape* of the draft/Apply rework:

1. **`AssignmentDropdown.handleConfirmTeacherClassroom` read `updatedAfterRow.rows.find(...)` after calling `addRow`, instead of `.draftRows`.** Since the new row lands in `draftRows`, `.rows` was always empty for a brand-new pairing → `.find()` returned `undefined` → `newRow.rowId` threw → shown as a generic "Something went wrong" toast. **This broke creating the very first assignment on any date** (the placeholder-row bootstrap flow) — one of the most fundamental paths in the app. Fixed by reading `.draftRows`.
2. **`useSchedule`'s `isDirty` compared `JSON.stringify(draftRows) !== JSON.stringify(rows)` directly.** The server serializes the two with different key orders even when content is identical, so the comparison never matched once anything had been saved — "Unsaved changes" never cleared. (This exact key-ordering quirk had already surfaced once earlier in an E2E test assertion and was wrongly dismissed as a test artifact — it had a real client-side consequence.) Fixed with a `canonicalizeRows` helper that fixes key order before comparing.

Both verified in the real browser: create row+block → Unsaved changes → first save → All changes saved → delete the block → Unsaved changes again → Save → **re-save confirmation modal correctly appears** → confirm → All changes saved. Zero console errors throughout (aside from expected 404s from the existence-check pattern). Visually confirmed via screenshots: calendar today-highlight + dot, the real `2026-06-23` data rendering correctly (green shift + **red** Meet Front Office, confirming the color fix), 12-hour labels, the "6 PM" end-cap, disabled Save button when not dirty, both selector panels with working inline add/auto-select, the exact spec wording for the confirmation summary, and the block context menu.

## Post-Phase-2 — Teachers View fixes (session 2026-06-28)

Three user-reported issues fixed and browser-verified (Playwright, 0.00px alignment diff):

### Fix 1 — Orange blocks filtered in Teachers View
`client/src/utils/teacherScheduleStates.js`: orange (Meet Front Office) blocks are filtered out before state logic runs — Teachers View only, not system-wide. Reduced from 6 states to 5: Not in center (1), In classroom (2), Break (3), In center (5), Left center (6). Orange time slots resolve naturally via gap/boundary logic: if a later green/yellow block exists the slot shows as In center; otherwise Left center.

### Fix 2 — Merged cells with internal slot dividers
`TeacherScheduleRow.jsx`: consecutive same-state slots are now grouped into one merged visual block with no internal dividers. Each block spans proportional width via `gridColumn: span N`. A CSS `repeating-linear-gradient` (using `--slot-count` CSS custom property) draws subtle white dividers inside each merged block at every 30-min slot boundary — so column lines from the header extend visually into the coloured row.

### Fix 3 — Results on a new page; no-schedule stays on selection page
- New file: `client/src/components/TeachersView/TeacherResultPage.jsx` — route `/teachers-view/:teacherId/:date`. Fetches the API independently on mount (bookmarkable URL). Layout: soft gradient page background, grid in a `surface-card`. Back link → `/teachers-view`.
- `TeachersViewPage.jsx` updated: on Show Schedule click, if `blocks.length > 0` → `navigate(...)` to result page. If `blocks.length === 0` → show "No schedule found for [Name] on [Date]" inline, stay on selection page.
- `App.jsx`: added `/teachers-view/:teacherId/:date` route.

### Fix 4 — Grid alignment (CSS Grid refactor)
Root cause of the 11:00–11:30 misalignment: header slots and data cells were in **separate** flex containers whose widths diverged by ~8px (each header cell has a right border; the merged data cell has only one, so 8 fewer pixels of border width = 8px drift). Fix: moved both header and data cells into a **single CSS Grid** (`grid-template-columns: 180px repeat(22, 1fr) 36px`). All cells are now direct children of one grid; column widths are shared by definition.

Browser-verified alignment: right-edge diff for all 4 data cells = **0.00px** vs corresponding header column boundaries.

## Current Step

**Phase 2 complete (all steps 1–9 + post-Phase-2 fixes). Waiting for Classroom View spec from user.**

### Phase 2 completed steps
1. ✅ `server/src/routes/teacherViewRoutes.js` — `GET /api/schedule/:date/teacher/:teacherId`, mounted in `app.js`
2. ✅ `App.jsx` routes — `/` → LandingPage, `/dashboard` → CalendarPage, `/teachers-view`, `/teachers-view/:teacherId/:date`, `/classroom-view`
3. ✅ `LandingPage.jsx` + `LandingPage.css` — 3-box landing with hover effects, uses `<Link>` (accessible)
4. ✅ `teacherScheduleStates.js` — `buildSlots(blocks)`, 5 states (orange filtered), boundary rules verified
5. ✅ `TeacherSearchInput.jsx` — typeahead, real-time filter, keyboard nav (↑↓ Enter Escape)
6. ✅ `DatePickerInput.jsx` — text input + mini calendar overlay, both sync to same state
7. ✅ `TeachersViewPage.jsx` — form card, disabled button, navigate on success, no-schedule inline
8. ✅ `TeacherScheduleGrid.jsx` + `TeacherScheduleRow.jsx` — CSS Grid, merged cells, gradient dividers, pixel-perfect alignment
9. ✅ `TeacherResultPage.jsx` — result page at `/teachers-view/:teacherId/:date`, gradient bg, surface-card
10. ✅ `ClassroomViewPage.jsx` — "Coming soon" placeholder

All verified in real Playwright/Chromium browser. Zero Phase 1 regressions.

**Known, accepted gaps (carried from Phase 1, not fixed):**
- Renaming a teacher/classroom doesn't retroactively relabel rows created before the rename.
- Calendar page generates ~30 console 404s per month view (per-day existence probes, all handled).

## Next Steps

**Classroom View** — user must provide the full spec before any implementation. Placeholder at `/classroom-view` is sufficient until then.

**Critical constraint remains:** No alterations to any Phase 1 file. Phase 2 is purely additive.

## Blockers (historical, mostly resolved)

- MongoDB wasn't in the official apt repo for this Ubuntu version — resolved using the 24.04 "noble" package repo. mongod needed a writable logpath under `$HOME` (not `/var/log`).
- Project lives under `/mnt/c/...` (Windows drive via drvfs in WSL2) — two consequences, both now worked around: (a) `require('mongoose')` can take 15–20s on first call (budget extra time, a slow start isn't a hang); (b) Vite's file watcher doesn't see fs changes across this boundary without `usePolling: true` (already set in `vite.config.js`).
- Backgrounding a long-running process (`node server.js`, `npm run dev`) with plain `&`/`disown` doesn't reliably survive between separate shell tool calls in this harness — use `setsid nohup <cmd> > /tmp/x.log 2>&1 < /dev/null & disown` as a single-line command, then `sleep 20` before checking `pgrep`/curling, since first connection is slow (see above).
- Headless browser testing was long believed impossible here (missing `libnspr4.so`, no `sudo`) — **this was wrong**, see the recipe above. Don't re-conclude "no browser available" in a future session without trying that first.

## Restarting the stack

```
pgrep -af mongod                                    # check first
mongod --dbpath /data/db --logpath ~/mongodb-logs/mongod.log --fork

cd server && setsid nohup node server.js > /tmp/backend.log 2>&1 < /dev/null & disown
sleep 20   # drvfs is slow on first require — a short wait looking like a hang isn't failure
cat /tmp/backend.log   # expect "MongoDB connected" then "Server running on port 5000"

cd client && setsid nohup npm run dev -- --port 5173 --host > /tmp/frontend.log 2>&1 < /dev/null & disown
sleep 6
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5173/   # expect 200
```
Frontend: `http://localhost:5173/`. Backend: `http://localhost:5000/api/...`.

## Verification approach used throughout

`npm run lint` + `npm run build` on every frontend change. Manual curl/Node-script exercises against the live backend for every endpoint and every piece of real logic (date math, slot mapping, conflict decisions) — real execution against the real database, not mocks. An independent fresh-context review agent for the highest-risk rework. Real Playwright-driven browser testing (see recipe above) for anything where correctness depends on actual rendering or interaction, not just data flow — this should be the default now, not a fallback.

Real user data must never be touched by any of the above: as of this writing, teachers `jenifer`/`isha`, classrooms `infant`/`infant 2`, and the schedule for `2026-06-23` (row "infant - jenifer", a green shift block + a red Meet Front Office block) are the user's actual data — confirmed untouched after every verification pass in this session. Always use clearly-prefixed throwaway names (e.g. `ZZTEST_...`) and unused dates for any test data, and clean up afterward.
