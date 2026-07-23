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

## Session 2026-06-29 — Classroom View + Teachers View enhancements

### Teachers View enhancements

**Grid text visibility fix:**
- Root cause: `repeat(22, 1fr)` columns shrank below readable width. Fixed with `min-width: 1426px` on `.tv-grid` — forces horizontal scroll rather than clipping.
- Added `CELL_LABELS` map in `TeacherScheduleRow.jsx` with short labels for grid display (`Not in`, `In ctr`, `Break`, `Left`). Full labels preserved in `title` tooltip and print tables.

**Print / Download as PDF (single-day result page):**
- Print button on `TeacherResultPage` calls `window.print()`.
- `@media print` CSS: hides header/back-link/screen grid, shows `.tv-print-only` section.
- Print section has a clean time table: Time | Status | Location, with `groupSlotsForPrint()` merging consecutive same-state+same-label slots into single rows.

**Overall View + In-between Dates (`TeacherSummaryPage`):**
- `TeachersViewPage.jsx` updated with 3 mode buttons: Specific Day / Overall View / In-between Dates.
- New backend endpoint: `GET /api/teacher/:teacherId/schedule?start=&end=` in `teacherViewRoutes.js` — returns `{ teacherName, days: [{ date, blocks[] }] }`, only days where teacher has at least one block.
- New component: `TeacherSummaryPage.jsx` at `/teachers-view/:teacherId/summary` — fetches multi-day data, shows clickable summary table (Date | Day | Arrived | Left | Classroom(s) | Break). Each row navigates to single-day result. Print shows per-day timeline tables with `page-break-inside: avoid`.
- Route specificity: `/summary` route placed before `/:date` in `App.jsx` so React Router resolves it correctly.

**AppHeader + Landing:**
- AppHeader logo (mark + name) wrapped in `<Link to="/">` — clicking navigates home.
- Landing page emoji icons removed for professional appearance.

### Classroom View — full implementation

**Backend** (`server/src/routes/classroomViewRoutes.js` — new, mounted in `app.js`):
- `GET /api/schedule/:date/classroom/:classroomId` — teachers with green blocks for that classroom on that date. Yellow/orange excluded (break = not present in classroom). Returns `{ classroomName, date, teachers: [{ teacherName, blocks[] }] }`.
- `GET /api/classroom/:classroomId/schedule?start=&end=` — all dates with any green coverage. Returns `{ classroomName, days: [{ date, teacherNames[], teachers[] }] }`. Date range optional; both dates validate YYYY-MM-DD format.
- Both use `validateObjectId` and `validateDateParam` middleware already in the project.

**Utilities** (`client/src/utils/classroomScheduleSlots.js` — new):
- `buildClassroomSlots(teachers)` — 22-slot array (7:00–18:00), each slot has `teacherNames[]` based on who has a green block covering that slot.
- `groupClassroomSlots(slots)` — merges consecutive slots with identical teacher sets into one group. A teacher joining or leaving = new group. Used for both screen and print.
- `SLOT_LABELS` — 23 labels (7:00 AM → 6:00 PM, inclusive), 23rd is the closing boundary marker.
- `GROUP_COLORS` / `ABSENT_COLOR` — shared color palette imported by both result and summary pages.

**Frontend:**

`ClassroomViewPage.jsx` (replaced "Coming soon"):
- Classroom dropdown (fetches `/api/classrooms`), 3 mode buttons (Specific Day / Overall View / In-between Dates), date pickers conditional on mode.
- Navigates to result page (specific day) or summary page (overall/range).

`ClassroomResultPage.jsx` (new, `/classroom-view/:classroomId/:date`):
- Horizontal group grid: one classroom row, columns = merged time-range blocks.
- Each block's width = proportional to slot count via CSS Grid `span N`.
- Colors cycle through green shades per teacher-present group; no-teacher = `#c4c9d4` (darker gray).
- 23rd header column = "6:00 PM" boundary marker; last data cell spans +1 to fill it.
- Cells grow taller with text (no overflow/clip); CSS Grid auto-matches all cells in the row.
- Print: `groupClassroomSlots` output as compact table (Time | Teachers Present).

`ClassroomSummaryPage.jsx` (new, `/classroom-view/:classroomId/summary`):
- Multi-day horizontal group grid: one row per day, date label ("Mon, Jun 23") as row header.
- Same colored block layout as result page; rows are clickable → navigates to that day's detail.
- Print: Option B — full per-day slot tables, one section per day, `page-break-inside: avoid`.

`ClassroomView.css` (new):
- All classroom view styles: form, mode selector, grid, summary table, print styles.

**App.jsx routes added:**
- `/classroom-view/:classroomId/summary` → ClassroomSummaryPage (before `/:date`)
- `/classroom-view/:classroomId/:date` → ClassroomResultPage

**Verified:**
- Both backend endpoints tested with curl against real Atlas data. Edge cases: empty schedule → `teachers: []`, invalid ObjectId → 404, bad date format → 400 with message.
- `groupClassroomSlots` logic verified: total span = 22 slots PASS, correct merging on teacher-set changes.
- SLOT_LABELS: 23 labels, first = "7:00 AM", last = "6:00 PM" PASS.
- Frontend production build clean (zero errors, 126 modules).

### Git state (end of 2026-06-29 session)
- Commit `ae1d7d3 feat: Classroom View + Teachers View enhancements` — 18 files, 1818 insertions, 40 deletions.
- Pushed to `github.com/child-schedule/schedule.git` master — covered 6 previously unpushed Phase 2 commits + today's commit.
- GitHub is now current at `ae1d7d3`. Working tree clean.
- PAT used for push should be revoked on GitHub (Settings → Developer Settings → Personal Access Tokens).

## Session 2026-07-09 — Phase 3 Slice 1: Login gate + navigation restructure

Phase 3 (`childcare-scheduling-phase3-plan.md`, §1 + §2) replaces the Phase 2 landing-page navigation model with a login gate in front of the whole app, with the calendar as the new home route. Sections 3–5 of the Phase 3 plan (in-schedule click-through popup, new print button, row-delete confirmation) are separate slices, not built in this session.

### Login gate
- `client/src/context/AuthContext.jsx` (new) — `AuthProvider`/`useAuth`. `isAuthenticated` initialized from `localStorage['cc_authenticated']` so it survives browser restarts (not sessionStorage). `login(username, password)` does a literal string comparison against hardcoded `class`/`classroom` — no backend auth endpoint, fully client-side per the confirmed spec. `logout()` clears the flag.
- `client/src/components/Auth/LoginPage.jsx` + `LoginPage.css` (new) — two fields, inline error on wrong credentials (generic "Incorrect username or password.", no hint about expected values), redirects to `/` on success. If already authenticated (e.g. manual nav to `/login`), redirects straight to `/`.
- `client/src/components/Auth/ProtectedRoute.jsx` (new) — wraps protected routes, `<Navigate to="/login" />` when `isAuthenticated` is false.
- `client/src/components/common/AppHeader.jsx` — added a Logout button (`.app-header__logout`, styled in `index.css`) that clears the auth flag and navigates to `/login`.

### Navigation restructure
- `client/src/App.jsx` rewritten: `/login` → `LoginPage` (public); `/` → `CalendarPage` wrapped in `ProtectedRoute`; `/schedule/:date` → `SchedulePage` wrapped in `ProtectedRoute`. The old `/dashboard` route was dropped (nothing referenced it once `LandingPage` — its only linker — was removed); `/` now serves the calendar directly, matching the plan's "this becomes the effective home route" intent.
- Archived, not deleted: `client/src/_archive/phase2-landing-and-views.archive.jsx` — full original source of `LandingPage.jsx`/`.css`, `TeachersViewPage.jsx`, `TeacherResultPage.jsx`, `TeacherSummaryPage.jsx`, `TeacherScheduleGrid.jsx`, `TeacherScheduleRow.jsx`, `TeacherSearchInput.jsx`, `DatePickerInput.jsx`, `TeachersView.css`, `ClassroomViewPage.jsx`, `ClassroomResultPage.jsx`, `ClassroomSummaryPage.jsx`, `ClassroomView.css`, each under a header comment showing its original path. Commented out (not live code) so it isn't bundled or linted as active source.
- Deleted from their live locations (now empty, also removed): `components/Landing/`, `components/TeachersView/`, `components/ClassroomView/`.
- **Left untouched, as instructed:** `client/src/utils/teacherScheduleStates.js` and `client/src/utils/classroomScheduleSlots.js` (pure logic, reused live by the Slice 4 popup) and the backend route files `server/src/routes/teacherViewRoutes.js` / `classroomViewRoutes.js` (backend out of scope for this slice).
- `AppHeader`'s logo `<Link to="/">` needed no change — `/` now resolves to the calendar, so "go home" still means the right thing.

### Verified
- `npm run lint` and `npm run build` both clean (114 modules, zero errors).
- Real Playwright browser run (recipe below) against the live dev stack: unauthenticated `/` → redirects to `/login`; wrong credentials → inline error, stays on `/login`, no auth flag set; `class`/`classroom` → lands on `/` with the calendar rendered, `localStorage['cc_authenticated'] === 'true'`; page reload stays logged in; Logout → back to `/login`, flag cleared, and a subsequent visit to `/` redirects to `/login` again; `/teachers-view` and `/classroom-view` no longer render any page content (routes removed). Zero console errors other than the pre-existing, already-documented calendar day-existence-probe 404s (see "Known, accepted gaps" below).
- Real user data (teachers `jenifer`/`isha`/`ashvini`/`lilly`, classrooms `infant`/`infant 2`/`pre-kg`, schedules for `2026-06-23` and `2026-06-28`) confirmed unchanged via direct API reads before/after — this session made no write calls (login is client-only; the browser test only drove GET-based navigation). Note: the teacher `kumar` mentioned in the task brief was not present in the live database at the start of this session either — pre-existing state, not something this session touched or removed.

---

## Current Step

**All four Phase 3 slices are complete as of 2026-07-09** (login gate + navigation restructure, row-delete confirmation, schedule-page print button, in-schedule teacher/classroom click-through popup). Everything is built and browser-verified but **left uncommitted in the working tree**, awaiting the user's own review before any `git commit` is made.

### All completed features
1. ✅ Phase 1 — full schedule grid, drag-to-select, conflict detection, draft/Apply save model
2. ✅ Phase 3 Slice 1 — login gate (hardcoded `class`/`classroom`, persisted, Logout control) + navigation restructure (landing page and Teachers/Classroom View archived and removed; `/` is now the calendar, gated by login)
3. ✅ Phase 3 Slice 2 — row-delete confirmation modal in front of the existing `×` delete control
4. ✅ Phase 3 Slice 3 — new schedule-page Print button (real HTML/CSS grid rendering + color legend, gated on `isPublished`)
5. ✅ Phase 3 Slice 4 — in-schedule teacher/classroom click-through popup (`DayDetailModal`), aggregating live `draftRows` across every matching row, independent of which row was clicked
6. ✅ Backend endpoints for both old Teachers View and Classroom View (still live, untouched — their route files were the reference for §4's response shapes, not called by the new popup, which reads `draftRows` client-side instead)
7. ✅ GitHub pushed and current (as of 2026-06-29; all four Phase 3 slices not yet committed — left uncommitted per instructions)

**Known, accepted gaps (carried forward, not fixing):**
- Renaming a teacher/classroom doesn't retroactively relabel rows created before the rename (the stored `rowLabel` string goes stale). Note: Slice 4's popup title/grid labels are *not* affected by this — they resolve names live via `TeachersContext`/`ClassroomsContext` lookups by id, not from `rowLabel`. Only the row's own on-grid label text (`ScheduleRow`'s fallback path) can go stale, and only when a name lookup fails entirely (e.g. a deleted teacher/classroom still referenced by an old row).
- Calendar page generates ~30 console 404s per month view (per-day existence probes, all handled).

## Next Steps

All four Phase 3 plan items (`childcare-scheduling-phase3-plan.md` §1–5, excluding the explicitly-deferred date-range/"Overall View" lookup inside the new popup — see §3's "Explicitly deferred" note) are built. Nothing further is queued from that plan. Suggested next actions are for the user to decide: review the four uncommitted slices together, then either request a single commit (or a few logically-grouped commits) covering all of them, or ask for further changes first.

**Critical constraint that stayed true throughout:** all four slices were additive — reused existing utilities/components (`teacherScheduleStates.js`, `classroomScheduleSlots.js`, the archived Phase 2 rendering logic, the shared `Modal` component) rather than rebuilding, and none of them touched the core scheduling grid, drag-to-select, conflict detection, or draft/Apply save mechanics.

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

**Note on which DB is live:** `server/.env`'s `MONGODB_URI` points at a MongoDB Atlas cluster (`cluster0.npx0bbe.mongodb.net/childcare_scheduler`) — that's what the running server actually reads/writes, confirmed by matching API responses. The local `mongod --dbpath /data/db` process (see "Restarting the stack" above) is a separate, unrelated local instance with its own leftover test docs from early sessions — querying it directly with a bare `mongosh` will *not* show real (or current test) data and can't be used for cleanup. Always clean up test data either through the API, or via `mongosh "$(grep MONGODB_URI server/.env | cut -d= -f2-)"` if a direct DB write is unavoidable.

## Session 2026-07-09 — Phase 3 Slice 2: Row delete confirmation

Phase 3 plan §5: the row × button (`ScheduleRow`'s `schedule-row__delete`) previously called `deleteRow` immediately with no confirmation. Added a confirmation gate in front of the same existing delete call — no change to what gets deleted or how.

- New file: `client/src/components/Schedule/DeleteRowModal.jsx` — stateless confirmation modal following the exact `CopyPreviousModal`/`SaveConfirmModal` pattern (built on shared `Modal.jsx`, `modal-actions` button row). Title "Remove this row?", body "Are you sure you want to remove [rowLabel]? This will delete all of its scheduled blocks.", Cancel / "Yes — Remove" (label becomes "Removing…" mid-request, both buttons disabled, matching `BlockContextMenu`'s `isDeleting` pattern since this component owns the async call itself).
- `client/src/components/Schedule/ScheduleGrid.jsx`: added `pendingDeleteRow` (`{ rowId, rowLabel }` | `null`) and `isDeletingRow` state. `onDeleteRow` on each `ScheduleRow` now calls `handleRequestDeleteRow` (opens the modal) instead of hitting the API directly; the former `handleDeleteRow` was split into `handleRequestDeleteRow` (sets pending state) and `handleConfirmDeleteRow` (the actual `deleteRow(date, rowId)` call + `onScheduleUpdate`, only reachable from the modal's confirm button). Cancel just clears `pendingDeleteRow`.
- No changes to `ScheduleRow.jsx` (the × button's `onDeleteRow` prop contract is unchanged) or to the `deleteRow` API function — this is purely a client-side gate in front of the existing mechanism.

**Verified:** `npm run build` (client) — zero errors. Real Playwright browser run against the live stack (logged in via `class`/`classroom`, throwaway date `2026-08-17`): created a `ZZTEST_Teacher_<ts>`/`ZZTEST_Classroom_<ts>` row via the placeholder row → clicking × opened the confirmation modal (verified exact wording, including the row label) instead of deleting immediately → Cancel closed the modal and the row was still present → clicking × again and confirming actually removed the row from the grid. Zero console errors throughout. Cleaned up afterward: deleted the row via the UI itself (part of the test), then the `ZZTEST_...` teacher/classroom entities via `DELETE /api/teachers/:id` and `/api/classrooms/:id`, then the now-empty `2026-08-17` schedule document directly in the Atlas DB (see DB note above — this doc doesn't get removed by any API endpoint, only its rows do). Confirmed via direct API reads before/after: real teachers (`jenifer`/`isha`/`ashvini`/`lilly`), classrooms (`infant`/`infant 2`/`pre-kg`), and schedules for `2026-06-23`/`2026-06-28` all unchanged.

Phase 3 Slice 2 complete as of 2026-07-09. Slices 3–4 (print button, in-schedule click-through popup) remain queued for separate sessions.

## Session 2026-07-09 — Phase 3 Slice 3: Schedule page print button

Phase 3 plan §4: a new, separate print feature on the schedule page (`/schedule/:date`) — distinct from the archived Teachers View / Classroom View print features (§2). Real HTML/CSS print rendering of the grid itself, not a table summary and not a screenshot.

- New file: `client/src/components/Schedule/SchedulePrintView.jsx` — print-only component reusing `generateTimeSlots`/`formatDisplayTime`/`findBlockForSlot` from `utils/timeSlots.js` and `getStatusLabel` from `utils/colorMap.js` (no new logic duplicated). Renders a CSS-Grid version of the on-screen grid: header row (corner + 22 half-hour slot labels + closing-boundary end-cap, same AM/PM-abbreviation rule as `ScheduleGrid`), then one row per schedule row (label + 22 per-slot colored cells + end-cap), using a `Fragment` per row so every cell is a direct child of the single grid container (matches the archived `TeacherScheduleGrid`/`TeacherScheduleRow` alignment pattern — nesting a wrapper div per row would break shared column tracks). Includes a center-name/date header and a 3-item color legend (green/yellow/orange → `getStatusLabel`'s "Active Shift"/"Break"/"Meet Front Office", pulled from `colorMap.js` rather than hardcoded). Hidden on screen (`.schedule-print-only { display: none }`), revealed only under `@media print`.
- New file: `client/src/components/Schedule/SchedulePrintView.css` — follows the exact `@media print` convention already used by the archived Teachers/Classroom View print sections (`_archive/phase2-landing-and-views.archive.jsx`'s `.tv-print-only`/`.cv-print-only` blocks): hides `.app-header`, `.back-link`, `.schedule-page__heading`, `.schedule-card` (all screen-only chrome) and reveals `.schedule-print-only` via `display: block !important`; `@page { size: A4 landscape; margin: 1cm; }` — landscape because the grid has 24 columns (label + 22 half-hour slots + end-cap) and needs the width portrait can't give it (the archived pages used portrait, but those were narrow two/three-column tables, not a 24-column grid). Block colors hardcoded to match `ScheduleGrid.css`'s `.time-block--*` values exactly (`#4caf6f` green, `#f0c14b` yellow, `#d64545` orange/red) since the print markup uses its own class namespace, not the screen grid's classes.
- `client/src/components/Schedule/SchedulePage.jsx`: added a third button ("Print") next to Copy Previous Day / Save Schedule, `disabled={!isPublished}` (per the task brief's explicit instruction — gated on `isPublished` alone, not combined with `isDirty`; this matches how Save's own disabled state already works independently). `onClick={() => window.print()}`, same mechanism as the archived print features. Renders `<SchedulePrintView dateLabel={formatLongDate(date)} rows={schedule.rows} />` unconditionally once loaded (it's invisible on screen regardless).

**Design decision — draft vs. published data:** Printed from `schedule.rows` (published), not `schedule.draftRows`. Reasoning: the Print button is gated on `isPublished`, and the whole point of that gate (per the task brief) is "printing is only available once the schedule has actually been saved at least once" — i.e., print is meant to produce a record of what's actually confirmed/saved, not of in-progress edits the admin hasn't committed yet. If it printed `draftRows` instead, the gate on `isPublished` would be meaningless whenever `isDirty` is also true (the printed page would show unsaved changes while the button's own disabled state implies "nothing to print yet"). This is the opposite design choice from Slice 4's in-schedule click-through popup (queued next), which intentionally prints/shows live draft data for a different reason (a quick-glance tool while actively building the schedule) — the two features have different purposes and this was called out explicitly in the task brief as the expected read.

**Verified:** `npm run build` (client) — zero errors, 117 modules. Real Playwright browser run against the live stack (logged in via `class`/`classroom`, throwaway date `2026-08-23`, teacher/classroom `ZZTEST_Teacher_<ts>`/`ZZTEST_Classroom_<ts>`): Print button disabled on a brand-new date with no schedule at all; created a row + a green block via the placeholder-row flow (draft only, not yet saved) → Print still disabled; clicked Save Schedule → Print became enabled; inspected the `.schedule-print-only` DOM section directly — contains the correct row label, a `schedule-print__block--green` cell, and all three legend labels ("Active Shift"/"Break"/"Meet Front Office"); confirmed the print date header renders "Sunday, August 23, 2026" via the same `formatLongDate` used in the on-screen heading; used `page.emulateMedia({ media: 'print' })` and read computed `display` styles — `.schedule-card` and `.app-header` both compute to `none`, `.schedule-print-only` computes to `block`; took a full-page screenshot under print-media emulation confirming visually correct rendering (header, legend swatches in the right colors, 22 time-column grid with the green block in the first slot, generated-at footer). Zero unexpected console errors — the only console output was the pre-existing, already-documented existence-probe 404s (`fetchSchedule` checking a brand-new date + its previous day, same accepted pattern noted in earlier sessions), not anything new from this feature.
- Cleanup: deleted `ZZTEST_Teacher_<ts>`/`ZZTEST_Classroom_<ts>` via `DELETE /api/teachers/:id` / `/api/classrooms/:id`. Discovered (and confirmed against `getSchedule`'s existing code, not new behavior) that `DELETE /api/schedule/:date/row/:rowId` only clears `draftRows` — the next `GET` re-syncs `draftRows` from a non-empty published `rows` (pre-existing backward-compat logic for documents "created before draftRows existed"), so the row reappeared in the draft after being "deleted." Same result the Slice 2 session hit for the same reason: deleted the leftover `2026-08-23` schedule document directly via `mongosh "$(grep MONGODB_URI server/.env | cut -d= -f2-)" --eval 'db.schedules.deleteOne({ date: "2026-08-23" })'`. Confirmed via direct API reads before/after: real teachers (`jenifer`/`isha`/`ashvini`/`lilly`), classrooms (`infant`/`infant 2`/`pre-kg`), and schedules for `2026-06-23` (4 rows) / `2026-06-28` (5 rows) all unchanged.

Phase 3 Slice 3 complete as of 2026-07-09. Slice 4 (in-schedule teacher/classroom click-through popup) remains queued for a separate session.

## Session 2026-07-09 — Phase 3 Slice 4: In-schedule teacher/classroom click-through popup

Phase 3 plan §3: teacher and classroom names inside the schedule grid become clickable, opening a read-only popup that shows that teacher's/classroom's aggregated day — built live from `schedule.draftRows` (the working draft), not published data, and independent of which row was clicked. Replaces the old separate Teachers View / Classroom View pages (archived in Slice 1) with an in-place quick-glance tool.

**New files:**
- `client/src/components/Schedule/DayDetailModal.jsx` — the popup itself, built on the shared `Modal` component (`className="modal--wide day-detail-modal"`). Takes `target` (`{ type: 'teacher'|'classroom', id }` or `null`), the current `rows` (i.e. `schedule.draftRows`), and `dateLabel`. Computes aggregation with `useMemo`:
  - **Teacher**: filters `rows` for every row where `row.teacherId === target.id` (not just the clicked row), flat-maps all of that row's blocks, attaches `classroomName` (looked up from `ClassroomsContext` by `row.classroomId`) only on `status === 'green'` blocks — mirroring the old `GET /api/schedule/:date/teacher/:teacherId` shape exactly — sorts by `startTime`, then runs through the existing `buildSlots()` (`utils/teacherScheduleStates.js`, untouched).
  - **Classroom**: filters `rows` for every row where `row.classroomId === target.id`, maps each to `{ teacherName, blocks }` keeping only `status === 'green'` blocks (yellow/orange excluded — a teacher on break or at the front office isn't "present"), drops rows with zero green blocks, then runs through the existing `buildClassroomSlots()` + `groupClassroomSlots()` (`utils/classroomScheduleSlots.js`, untouched).
  - Title/teacher-classroom names are resolved by id via `TeachersContext`/`ClassroomsContext` lookups (not by splitting `rowLabel` strings) — ties the popup's identity directly to the same ids used for aggregation, and stays correct even if `rowLabel` (baked in at row-creation time) has gone stale relative to a later rename.
- `client/src/components/Schedule/TeacherDayGrid.jsx` — read-only 22-slot vertical grid for one teacher. Adapted from the archived `TeacherScheduleGrid`/`TeacherScheduleRow` (`client/src/_archive/phase2-landing-and-views.archive.jsx`): same `STATE_COLORS`/`CELL_LABELS` conventions, same consecutive-slot merging, simplified for a modal instead of a full page (no sticky corner, no page chrome). Shows "No schedule for [name] today." when `slots` is empty.
- `client/src/components/Schedule/ClassroomDayGrid.jsx` — read-only horizontal grid for one classroom. Adapted from the archived `ClassroomResultPage`'s `cv-hgrid`: same grouped-segment rendering via `SLOT_LABELS`/`GROUP_COLORS`/`ABSENT_COLOR`. Shows "No teachers assigned to [name] today." when every group is empty.
- `client/src/components/Schedule/DayDetailModal.css` — `day-detail__*` wrapper/header/close-button classes, plus `tdg-*`/`cdg-*` grid classes (scaled-down versions of the archived `.tv-grid`/`.cv-hgrid` CSS, reusing the same `var(--color-*)` tokens already used elsewhere in the app).

**Edited files:**
- `client/src/utils/dateHelpers.js` — added `formatLongDate(dateKey)`, extracted from the inline copy already living in `SchedulePage.jsx` (left that file untouched, out of scope for this slice) so `ScheduleGrid`/`DayDetailModal` could reuse the exact same "Thursday, July 9, 2026" formatting without duplicating it or reaching into another slice's component.
- `client/src/components/Schedule/ScheduleRow.jsx` — now takes `teacherId`/`classroomId`/`onTeacherClick`/`onClassroomClick` props. Looks up the teacher's and classroom's *current* display names via `TeachersContext`/`ClassroomsContext` by id; if both resolve, renders the row label as two independently clickable `<button>` spans (`.schedule-row__name-link`) joined by `" - "` instead of one static string. Falls back to the plain, non-clickable `rowLabel` text when either lookup fails (the placeholder "+ Add" row, or the rare case of a stale/deleted id) — this is a deliberate deviation from the brief's "split rowLabel on ' - '" fallback suggestion: id-based lookup was used as the *primary* path (not just a fallback) since the click handlers need the ids anyway for aggregation, and it avoids any risk of a classroom/teacher name that itself contains the literal substring `" - "` being split incorrectly.
- `client/src/components/Schedule/ScheduleGrid.jsx` — added `activeDetail` state (`{ type, id } | null`), passes `teacherId`/`classroomId`/`onTeacherClick`/`onClassroomClick` to every real `ScheduleRow` (the click handlers just set `activeDetail`), and renders `<DayDetailModal target={activeDetail} rows={rows} dateLabel={formatLongDate(date)} onClose={...} />` alongside the existing `AssignmentDropdown`/`BlockContextMenu`/`DeleteRowModal`. `rows` here is `schedule.draftRows` (already the case pre-existing in this file — see line `const rows = schedule.draftRows`) so the modal is guaranteed to see live, unsaved edits with zero extra plumbing.
- `client/src/components/Schedule/ScheduleGrid.css` — added `.schedule-row__name-link` (invisible button reset, `text-decoration: underline` + `color: var(--color-accent)` on hover/focus).

**No backend changes** — `schedule.draftRows` was already returned on every `GET /api/schedule/:date` response and kept in sync after every mutation (confirmed by reading `useSchedule.js`/`scheduleController.js` before starting), so no new endpoint was needed. The old `teacherViewRoutes.js`/`classroomViewRoutes.js` backend routes remain untouched and unused by this feature (they only ever served published `rows`, not `draftRows`, which is exactly why this slice couldn't reuse them for the "live draft" requirement).

**Verified:** `npm run lint` and `npm run build` (client) both clean, zero errors/warnings, 123 modules. Real Playwright browser run against the live stack (logged in via `class`/`classroom`, throwaway date `2026-09-14`, teacher `ZZTEST_Teacher_<ts>` assigned to two different throwaway classrooms `ZZTEST_ClassroomA_<ts>` / `ZZTEST_ClassroomB_<ts>` with non-overlapping time blocks, all still unsaved/draft-only):
- Clicking the teacher's name from the **classroom-A row** opened the popup titled with the teacher's name, and its body contained **both** `ZZTEST_ClassroomA_<ts>` and `ZZTEST_ClassroomB_<ts>` — confirming cross-row aggregation from unsaved draft data.
- Closing and instead clicking the teacher's name from the **classroom-B row** produced the **identical** aggregated popup (both classroom labels present again) — confirming the view is independent of which row triggered it.
- Clicking the classroom name from the classroom-A row opened a classroom popup whose body contained the teacher's name — confirming classroom-side aggregation.
- After all of the above, both test rows were still present exactly once each and the page still read "Unsaved changes" — confirming the popup is read-only and never mutates the draft.
- Zero console errors throughout the entire run.
- Cleanup: deleted the three `ZZTEST_Teacher_*` and six `ZZTEST_Classroom{A,B}_*` entities accumulated across this session's debugging iterations via `DELETE /api/teachers/:id` / `/api/classrooms/:id`, then removed the leftover `2026-09-14` schedule document directly via `mongosh "$(grep MONGODB_URI server/.env | cut -d= -f2-)" --eval 'db.schedules.deleteOne({ date: "2026-09-14" })'` (same known gap as prior slices — row-delete alone only clears `draftRows`, not the document itself). Confirmed via direct API reads afterward: real teachers (`jenifer`/`isha`/`ashvini`/`lilly`), classrooms (`infant`/`infant 2`/`pre-kg`) unchanged; `2026-06-23` still has 4 rows/4 draftRows, `2026-06-28` still has 5 rows/4 draftRows (both match the counts recorded in the previous session); `2026-09-14` confirmed fully gone (0 rows).

Phase 3 Slice 4 complete as of 2026-07-09. **All four Phase 3 slices (login gate, row-delete confirmation, print button, in-schedule click-through popup) are now built and browser-verified.** Nothing has been committed — all four slices' changes sit uncommitted in the working tree together, per instructions, awaiting the user's review before any `git commit`.

## Session 2026-07-09 — Hardening fix: stale rowLabel fallback for deleted teacher/classroom references

A real production data bug was found and fixed directly in the DB: a schedule row's `rowLabel` ("pre-kg - jenifer") was frozen at creation time, but its `classroomId` pointed at a since-deleted classroom document — so the live id lookup silently failed. That specific row's `classroomId` has now been repointed to the real `pre-kg` classroom. This session hardens Slice 4's click-through popup (and `ScheduleRow`'s split-label rendering) so this class of bug — an old row outliving a later-deleted/renamed teacher or classroom — degrades gracefully instead of silently breaking clickability and showing "Unknown", since it can plausibly recur (e.g. someone deletes a classroom that old rows still reference).

**New file:** `client/src/utils/rowLabel.js` — `parseRowLabel(rowLabel)`, a small shared helper that splits a row's frozen `rowLabel` string (built server-side in `scheduleController.js`'s `addRow` as `` `${classroom.name} - ${teacher.name}` ``, confirmed by reading the actual source) on the first `" - "` occurrence — classroom name before, teacher name after. Returns `null` if the label is empty or doesn't contain the separator, or if either resulting half is blank after trimming.

**Edited files:**
- `client/src/components/Schedule/ScheduleRow.jsx` — previously, `canSplitLabel` required *both* `teachers.find(...)` and `classrooms.find(...)` to resolve live, and fell back to the plain non-clickable `rowLabel` span otherwise (this is what made the real `pre-kg - jenifer` row unclickable before the DB repair). Now tries the live lookup first for each half independently, and only falls back to `parseRowLabel(rowLabel)` for whichever half didn't resolve live. The row still renders as two independently clickable buttons wired to the row's real stored `teacherId`/`classroomId` (unchanged — the click always passes the actual id through, only the *displayed text* falls back), so `DayDetailModal`'s aggregation-by-id keeps working even when the label shown is a stale, rowLabel-derived one. Only the placeholder "+ Add" row, or a row whose `rowLabel` itself is empty/malformed, still falls all the way back to a plain span.
- `client/src/components/Schedule/DayDetailModal.jsx` — `nameOf(list, id)` had no fallback path at all (`?? 'Unknown'`). Changed signature to `nameOf(list, id, type)` (`type` is `'teacher'|'classroom'`, used only to pick which half of a matching row's `rowLabel` to read on the fallback path) and wrapped in `useCallback` (keyed on `rows`) to keep `react-hooks/exhaustive-deps` clean. Live lookup is always tried first — it's authoritative, since it reflects a live rename that `rowLabel` wouldn't. Only when the live lookup truly fails does it search `rows` for any row referencing that id and parse a name out of `rowLabel`. Applied at all three call sites: the popup title (both teacher and classroom), the per-block `classroomName` attached during teacher-slot aggregation (flows into `teacherScheduleStates.js`'s `buildSlots` as the green-block cell label), and the `teacherName` used during classroom-group aggregation.

**Verified:**
- `cd client && npm run build` — zero errors, 124 modules. `npm run lint` — zero errors, zero warnings (the `useCallback` wrap on `nameOf` was needed specifically to avoid a new `react-hooks/exhaustive-deps` warning once it started closing over `rows`).
- Real Playwright browser run (same recipe as prior sessions) against the live stack, in two parts:
  1. **Constructed broken-reference case** (throwaway date `2026-11-19`): created a normal row via the UI (`ZZTEST_Classroom_<ts>` / `ZZTEST_Teacher_<ts>`, placeholder-row → Teacher+Classroom → Confirm flow) so its `rowLabel` froze correctly, fetched its real ids via the API, then mutated only that row's `classroomId` directly in Mongo (`mongosh`, `$set` on the matching `draftRows` array element) to a bogus-but-valid ObjectId (`000000000000000000000001`), simulating a deleted classroom. Reloaded the page and confirmed: the classroom half of the row label still rendered as visible text *and* as a clickable `.schedule-row__name-link` button (not a plain span); clicking it opened `DayDetailModal` with title `ZZTEST_Classroom_<ts>` (rowLabel-derived, not "Unknown"); clicking the teacher half (still live-resolving, untouched) opened the teacher popup, which correctly showed `ZZTEST_Classroom_<ts>` as the green block's classroom label instead of "Unknown", proving the per-block fallback in the teacher-aggregation path also works. Both confirmed visually via screenshot.
  2. **Real, now-repaired `pre-kg - jenifer` row** on `2026-06-23` (read-only check, not modified): both classroom (`pre-kg`) and teacher (`jenifer`) halves render as live-resolving clickable buttons; clicking each opens the correct popup with the correct live title and correct aggregated content (jenifer's popup correctly showed both `pre-kg` and `infant` blocks with a `Break` and `Left` state in between) — confirmed via screenshot, no fallback needed since both ids now resolve live.
- Zero console errors on both the constructed test page and the real `2026-06-23` page (confirmed in a separate clean run against `2026-06-23` alone).
- Cleanup: deleted the `2026-11-19` test row via `DELETE /api/schedule/:date/row/:rowId`, the `ZZTEST_Teacher_<ts>`/`ZZTEST_Classroom_<ts>` entities via `DELETE /api/teachers/:id` / `/api/classrooms/:id`, then the leftover `2026-11-19` schedule document directly via `mongosh` (same known gap as every prior session — row-delete alone only clears `draftRows`, not the document itself). Confirmed via direct API reads afterward: real teachers (`jenifer`/`isha`/`ashvini`/`lilly`), classrooms (`infant`/`infant 2`/`pre-kg`) unchanged; `2026-06-23` still 4 rows/4 draftRows (including the now-correctly-resolving `pre-kg - jenifer`); `2026-06-28` still 5 rows/4 draftRows; `2026-11-19` confirmed fully gone (404 on `GET /api/schedule/2026-11-19`).

**Deviation from the brief:** none of substance. One small addition beyond the brief's literal wording: wrapped `nameOf` in `useCallback` (not mentioned in the brief) purely to satisfy `react-hooks/exhaustive-deps` once it started reading `rows` from closure — without it, `npm run lint` produced two new warnings on the `teacherSlots`/`classroomGroups` `useMemo` hooks. No behavior change, just keeps lint clean the way every prior slice in this project has.

This hardening fix is complete as of 2026-07-09. Left uncommitted, alongside the four Phase 3 slices, per instructions.

## Session 2026-07-09 — Fix 3: explicit "Meet Front Office" state in the teacher-day popup

`TeacherDayGrid`'s per-teacher popup (Slice 4) previously filtered orange (Meet Front Office) blocks out entirely before running any state logic (`activeBlocks = blocks.filter(b => b.status !== 'orange')`), so time an orange block covered just fell through to whatever the surrounding gap logic decided — generic "In center"/"Left center", or "Not in center" before the first real block. There was no way for this view to ever show "Meet Front Office" as its own label, even when a teacher was genuinely idle (at the front office, not scheduled anywhere).

**New behavior — per-slot priority in `buildSlots`:**
1. A green or yellow block covering the slot always wins (states 2/3, unchanged).
2. Otherwise, an orange block covering the slot wins — **new state 4**, label `"Front Office"`, fullLabel `"Meet Front Office"`.
3. Otherwise, fall back to the existing gap/boundary logic (states 1/5/6), which is still defined purely from green/yellow block boundaries (`firstStart`/`lastEnd`) — orange blocks never move those boundaries, they only claim priority over the gap label for the specific slots they cover.

**Edited files:**
- `client/src/utils/teacherScheduleStates.js` — `buildSlots` now splits `blocks` into `activeBlocks` (green/yellow only, still used for both slot-fill and the `firstStart`/`lastEnd` boundaries) and a separate `orangeBlocks` array checked only when no green/yellow block covers the slot. Handled the edge case of a teacher with zero green/yellow blocks at all (`firstStart`/`lastEnd` both `null`) by falling back to state 1 ("Not in center") for every non-orange-covered slot, rather than crashing on `slotStart < null`. Added `4: 'Meet Front Office'` to `STATE_LABELS`. Updated the file's header comment (states list + a new "per-slot priority" section) to match.
- `client/src/components/Schedule/TeacherDayGrid.jsx` — added `4: { bg: '#dc2626', color: '#ffffff' }` to `STATE_COLORS` (the documented red = Meet Front Office spec value, matching the hue already used for orange blocks elsewhere in the app — `ScheduleGrid.css`'s `.time-block--orange` uses a close-but-not-identical `#d64545`; used the exact spec value per the task brief) and `4: 'Front Office'` to `CELL_LABELS` (short cell text; the tooltip/`aria-label` already reads `fullLabel` from `buildSlots`, unaffected).

**Verified:**
- `cd client && npm run build` — zero errors, 124 modules. `npm run lint` — zero errors, zero warnings.
- Real Playwright browser run (same recipe as prior sessions) against the live stack, two cases:
  1. **Real `jenifer`/`2026-06-23` case (read-only, not modified):** opened the teacher popup for `jenifer` from the `infant - jenifer` row. `jenifer` has an orange block `07:00–11:30` on that row *and* a green block `07:00–11:30` on the separate `pre-kg - jenifer` row (the row repaired in the prior hardening-fix session). Confirmed the popup's `07:00–11:30` cell reads `aria-label="7 AM–11:30 AM: pre-kg"` (green) — proving the green block from the other row correctly wins over the orange block at the same time, per priority rule 1. The rest of the day showed `infant` (11:30 AM–1:30 PM), `Break` (1:30–3 PM), `Left center` (3–6 PM), matching the pre-existing, already-verified aggregation.
  2. **Constructed genuinely-idle case** (throwaway date `2027-01-15`, `ZZTEST_Teacher_<ts>`/`ZZTEST_Classroom_<ts>` created via the real REST API — `POST /api/teachers`, `POST /api/classrooms`, `POST /api/schedule/:date/row`, `PUT .../block` — not a direct DB write): one row with a green block `07:00–08:00` and a non-overlapping orange block `09:00–10:00` (deliberately chosen so the orange block sits inside what would have been the old "Left center" gap, since `lastEnd` from the single green block is `08:00`). Opened the teacher popup and read each `.tdg-cell`'s `aria-label` and computed `background-color`: `07 AM–8 AM: ZZTEST_Classroom_<ts>` (green, `rgb(22,163,74)`), `8 AM–9 AM: Left center` (gray, unchanged gap logic), **`9 AM–10 AM: Meet Front Office` (red, `rgb(220,38,38)` = `#dc2626`)**, `10 AM–6 PM: Left center` (gray) — proving state 4 now fires exactly for the orange-covered slot without disturbing the gap logic on either side.
- Zero unexpected console errors in both runs — only the pre-existing, already-documented calendar/schedule existence-probe 404s noted in "Known, accepted gaps" above.
- Cleanup (case 2): deleted the test row (`DELETE /api/schedule/:date/row/:rowId`), the `ZZTEST_Teacher_<ts>`/`ZZTEST_Classroom_<ts>` entities (`DELETE /api/teachers/:id` / `/api/classrooms/:id`), then the leftover `2027-01-15` schedule document directly via `mongosh` (same known gap as every prior session — row-delete alone only clears `draftRows`, not the document itself; confirmed via `GET /api/schedule/2027-01-15` → 404 afterward). Confirmed via direct API reads before/after: real teachers (`jenifer`/`isha`/`ashvini`/`lilly`), classrooms (`infant`/`infant 2`/`pre-kg`) unchanged; `2026-06-23` still 4 rows/4 draftRows; `2026-06-28` still 5 rows/4 draftRows.

**Deviation from the brief:** none of substance. The brief's case (b) said "a throwaway teacher with ONLY an orange block ... (no green/yellow at all overlapping it)" — read literally as "no green/yellow overlapping the orange block's own time," not "zero green/yellow blocks anywhere that day," since a row can only be created via the Teacher+Classroom flow, which always seeds a green block first (there's no UI path to a row with literally zero green/yellow blocks without a follow-up block-delete step). Used a non-overlapping green block at a different time instead, which is also the more meaningful test: it specifically proves state 4 now wins over what used to be the generic "Left center" gap fallback at that exact slot, matching the brief's own description of the bug ("falls through to whatever the surrounding gap logic decides").

This fix is complete as of 2026-07-09. Left uncommitted, per instructions.

## Session 2026-07-09 — Fix 4: print colors missing (`print-color-adjust`)

The Print button's HTML/CSS print view (`SchedulePrintView.jsx` / `SchedulePrintView.css`, from an earlier slice) renders colored blocks (green/yellow/orange) and a matching legend, but printed completely bland — no colors at all. Root cause: browsers strip background colors when printing by default unless the page explicitly opts in with `print-color-adjust: exact` (and the `-webkit-` prefixed version for Chromium/older browsers); the file never set either property anywhere. Read every rule in the existing `@media print` block first to confirm this really was the only thing missing — `.schedule-print__swatch--green/yellow/orange`, `.schedule-print__block--green/yellow/orange/white`, `.schedule-print__corner`, `.schedule-print__row-label`, `.schedule-print__slot-label`, `.schedule-print__end-cap--label`, and `body` all set a `background`/`background-color` but none had the opt-in property. Confirmed — no CSS or structural changes beyond that were needed.

**Edited file:**
- `client/src/components/Schedule/SchedulePrintView.css` — added one rule directly inside the existing `@media print` block, right after `.schedule-print-only { display: block !important; }`:
  ```css
  .schedule-print-only,
  .schedule-print-only * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  ```
  Scoped to `.schedule-print-only` (the print view's root) and all its descendants rather than listing individual color-bearing selectors, so any future colored element added under the print view is covered automatically without needing to remember to add the property again.

**Verified:**
- `cd client && npm run build` — zero errors, 124 modules.
- Real Playwright browser run (same recipe as prior sessions) against the live stack, real data only (`2026-06-23`, read-only, nothing created or mutated): logged in, navigated to `/schedule/2026-06-23`, used `page.emulateMedia({ media: 'print' })`, then read computed styles directly. All six checked elements (`.schedule-print__swatch--green/yellow/orange` and `.schedule-print__block--green/yellow/orange`) resolved to real, non-transparent `background-color` values under print emulation — `rgb(76, 175, 111)` (green), `rgb(240, 193, 75)` (yellow), `rgb(214, 69, 69)` (orange) — each with computed `print-color-adjust: exact` / `-webkit-print-color-adjust: exact`. Also took a full-page screenshot under print-media emulation: header ("Childcare Scheduler" / "Tuesday, June 23, 2026"), legend swatches in the correct three colors, and the grid itself all rendered with correct colors (green/red/yellow blocks matching the real `infant`/`pre-kg` rows for `isha`/`jenifer`). Zero console errors.
- Confirmed no data was touched: this check only read the existing `2026-06-23` document, no writes were made, no throwaway `ZZTEST_` entities were needed for this fix.

**Deviation from the brief:** none.

This fix is complete as of 2026-07-09. Left uncommitted, per instructions.

## Session 2026-07-09 — Fix 5: print end-cap column not merging with the row

After Fix 4 made print colors visible, the user reported the rightmost "6 PM" end-cap column looked like a separate, disconnected box in every row instead of blending in — visually shorter than the rest of the row, with a gap above and below it.

**Root cause:** in `SchedulePrintView.jsx`, every regular time-slot cell gets two classes — the base `schedule-print__block` (carries `height: 22px` in `SchedulePrintView.css`) plus a color modifier `schedule-print__block--{status}`. The end-cap cell's `className` only included the color modifier (`schedule-print__block--${status}`) and was missing the base `schedule-print__block` class, so it never got the height rule and rendered shrunk relative to its neighbors — confirmed visually via a zoomed Playwright screenshot under print-media emulation before making any change, and via bounding-box geometry (`schedule-print__row-label` cell measured 27.4px tall vs `schedule-print__block` cells at a fixed 22px, with the end-cap's un-classed box falling somewhere in between and visibly not flush).

**Fix:** one-line change to the end-cap `div`'s `className` in `SchedulePrintView.jsx`, adding the missing base class:
```diff
- className={`schedule-print__cell schedule-print__end-cap schedule-print__block--${...}`}
+ className={`schedule-print__cell schedule-print__end-cap schedule-print__block schedule-print__block--${...}`}
```

**Verified:** `npm run build`/`npm run lint` clean. Real Playwright screenshot under `page.emulateMedia({ media: 'print' })`, zoomed on the grid's right edge (real `2026-06-23` data, read-only) — before: visible gap above/below the end-cap cell in every row; after: the end-cap column fills the full row height flush with the rest of the row, no visible seam. No data touched (read-only verification against real data, no throwaway entities needed for a one-line CSS-class fix).

This fix is complete as of 2026-07-09. Left uncommitted, per instructions.

---

**This was the last queued fix from the user's bug report round.** All five reported/found issues — (1) dead/stale data-reference fix, (2) click-through hardening against future dead references, (3) explicit "Meet Front Office" state instead of falling through to a generic gap label, (4) missing print colors, and (5) the print end-cap column not merging with its row — are now built, browser-verified against real data, and awaiting the user's review. Still uncommitted, per instructions (no `git commit` run this round).

## Session 2026-07-09 — Deployment + login password change

**App deployed live**, on top of the Phase 3 build + bug-fix round above:
- Frontend on Vercel (`client/`) at `https://schedule-nine-zeta.vercel.app`.
- Backend on Render (`server/`) at `https://childcare-scheduler-backend.onrender.com`.
- Database unchanged — same MongoDB Atlas cluster.
- Both `VITE_API_BASE_URL` and `CLIENT_URL` (CORS origin) were already environment-variable-driven in the existing code, so no code changes were needed to split frontend/backend across hosts.
- Fixed a real SPA-routing bug found during live verification: direct navigation to any client-side route (e.g. `/schedule/2026-06-23`) 404'd on Vercel's static host since only `index.html` exists on disk. Fixed with `client/vercel.json` (rewrite-all-to-`index.html`) — commit `c1e4077`.
- GitHub repo `child-schedule/schedule` was switched from private to public — Vercel's free Hobby plan blocks git-triggered auto-deploys on private repos unless the committer is a recognized project collaborator, which Hobby plan doesn't support adding for private repos. **The source code is now publicly visible on GitHub** (no secrets exposed — `.env` was never committed — but this was a deliberate tradeoff, not incidental).
- Full detail and setup steps in `../DEPLOYMENT_SETUP.md`.

**Login password changed:** `class`/`classroom` → `class`/`classroom2026`. The word "classroom" alone is a common dictionary string that appears in leaked-password compilations Chrome/Google Password Manager checks against, triggering a "found in a data breach" warning on every login (a browser-level check against a public breach corpus, unrelated to any actual breach of this app). Changed in `client/src/context/AuthContext.jsx`'s `VALID_PASSWORD` constant (only place it was defined) — commit `b4c320c`. Verified live: old password now rejected, new password accepted.

**Show/hide password toggle added to the login form** — an eye-icon button inside the password field (`LoginPage.jsx`/`LoginPage.css`) toggles the input between `type="password"` and `type="text"` so the user can verify what they typed before submitting. Inline SVG icons (not emoji, matching this project's existing "no emoji, professional look" convention — see the 2026-06-29 Landing Page note above). Verified: toggling switches the input type and reveals/hides the typed value correctly both directions, and submitting still logs in correctly afterward.

## Session 2026-07-12 — Lesson Planning, range-style time labels, duplicate-name guard, deferred picker flow

Committed as `59b3590` and pushed to GitHub master (`8181b7d..59b3590`). Full interview + plan-mode process (two separate plan-mode rounds, both approved by the user before any code was written); plan files are ephemeral (`~/.claude/plans/`), not part of this repo.

### Lesson Planning — new 4th block status
- **Backend**: `server/src/models/Schedule.js` block schema enum extended `['green','yellow','orange']` → `[..., 'blue']`. `scheduleController.js`'s `addOrUpdateBlock` whitelist updated to match.
- **Conflict detection — reversed mid-session after user correction**: first built exempt (like Meet Front Office), per an explicit "yes, same as meet front office" answer during the interview. User later tested it live and reported it should actually **conflict-block** a teacher from being double-booked elsewhere — Lesson Planning represents the teacher being occupied, not away. Reverted in both `server/src/middleware/conflictCheck.js` and `client/src/hooks/useConflictCheck.js`: only `'orange'` stays exempt now; `'blue'` participates in conflict checks exactly like green/yellow. Re-verified via direct backend curl calls (not just the frontend pre-check) after this reversal, since the running backend process needed an explicit restart to pick up the code change (see "Backend has no hot-reload" gotcha below) — the first round of automated tests passed for the wrong reason (frontend pre-check caught it; the stale backend would have silently allowed it if that pre-check had ever been bypassed).
- **Teachers View**: `teacherScheduleStates.js`'s `buildSlots` gained a 7th state (`"Lesson Planning"`, priority tier just below orange, above the gap/boundary fallback) so it shows as its own label, not lumped into "Meet Front Office". `TeacherDayGrid.jsx` got matching `STATE_COLORS[7]`/`CELL_LABELS[7]` (`#2563eb` blue).
- **Classroom View**: needed **zero code changes** — `DayDetailModal.jsx`'s classroom aggregation was already a `status === 'green'`-only allowlist (not an "excludes yellow/orange" denylist), so blue is excluded automatically, correctly, by construction.
- **Dropdown/print**: `colorMap.js` label, `AssignmentDropdown.jsx` 4th button, `ScheduleGrid.css`'s `.time-block--blue`, `SchedulePrintView.jsx`/`.css` legend entry + block color.

### Grid range-style time labels
- Every 22-slot header (main grid, Teachers/Classroom View popups, print) changed from a single point-in-time label ("7:30") to a start-end range ("7-7:30"). Shared helpers added to `client/src/utils/timeSlots.js`: `formatSlotTimeLabel`/`formatSlotRangeLabel`, full AM/PM only at `07:00`/`12:00`/`18:00` (day start, noon, day close) — replaces three near-identical local `formatSlotLabel(time, index)` copies that existed in `ScheduleGrid.jsx`, `TeacherDayGrid.jsx`, `SchedulePrintView.jsx`.
- Main grid: two-line stacked label, no horizontal scroll (row height `52px`→`44px` to make room) — dragging must stay easy, confirmed explicitly with the user.
- Popups: single-line, horizontal scroll allowed (columns widened to `84px`/`80px` min after a first pass at `64px`/`60px` clipped the worst case, "11:30-12 PM" — caught and fixed via a real Playwright screenshot, not assumed).
- `ClassroomDayGrid.jsx` structurally rebuilt from 23 boundary-tick labels (`classroomScheduleSlots.js`'s old `SLOT_LABELS` export, now removed — confirmed via grep it had exactly one consumer) to 22 per-slot range-label columns, matching the other two grids.
- **End-cap columns removed entirely, not just relabeled** — first pass left the trailing boundary column in place with a blank header (since the last real column already reads its own end time), but the user reported it as a confusing unlabeled stray block after "5:30-6 PM" on the live grid. Removed the column and its supporting code entirely from all three surfaces: `ScheduleGrid.jsx`/`ScheduleRow.jsx` (the end-cap was a duplicate drag hit-target for the same last slot index, no functional loss), `TeacherDayGrid.jsx` (dropped the `lastColors` color-continuation cell), `SchedulePrintView.jsx` (dropped the `lastBlock` color-continuation cell). Verified via Playwright screenshots on real data (`2026-06-23`) at all three surfaces post-removal — clean flush right edge, no stray column.

### Duplicate teacher name guard
- Root cause of a real production bug: two separate `Teacher` documents both named "Isabel" existed in the live database (also two both named "Jennifer"), invisible to every picker in the app since they render identically by name. A user picked the "wrong" Isabel while testing Lesson Planning's conflict-blocking, which correctly found no conflict — because to the system, by teacherId, they're unrelated people. Not a logic bug; a data-quality gap with no prior guard against it.
- `server/src/controllers/teacherController.js`: `createTeachers` and `updateTeacher` (rename) both now reject a case-insensitive, trimmed duplicate name with a 409 and a message suggesting a distinguishing addition (e.g. a last name) — no new "last name" field, purely a naming-uniqueness check on the existing single `name` field, per explicit instruction. `AddEntityForm.jsx` and `TeacherSelector.jsx`'s inline rename now surface the real backend message (`err.response?.data?.error`) instead of a generic "Could not add/rename" string — the rename path previously had **no error handling at all** (an unhandled rejection).
- **Not done, pending user decision**: a database-level unique index (would need `collation` for case-insensitivity, and can't be created while the existing duplicate "Jennifer" pair remains — Mongo refuses to build a unique index over pre-existing duplicates). The app-level check above is what's live; the DB-level backstop is a follow-up the user hasn't yet decided how to sequence (which Jennifer to rename first).
- **Existing real duplicates**: as of this session, "Jennifer" still appears twice in the live `teachers` collection (not resolved). The duplicate "Isabel" was resolved during this session — but by whoever clicked delete on it (not by me; audited every write command run this session, none could have matched a non-`ZZTEST_`-prefixed name) — leaving the real `2's - Isabel` row on `2026-07-13` referencing a now-deleted teacher id. The existing rowLabel-fallback hardening from the 2026-07-09 session already covers this gracefully (shows the frozen label, stays clickable), so nothing broke, but the row is effectively orphaned from a live teacher identity.

### Deferred teacher/classroom picker for Break/Meet Front Office/Lesson Planning on a brand-new row
- Previously, dragging on the grid's trailing placeholder row (no teacher/classroom yet) showed Break/Meet Front Office/Lesson Planning as disabled with an "Assign a teacher and classroom first" tooltip — only "Teacher + Classroom" was clickable. Reported as feeling restrictive.
- `AssignmentDropdown.jsx`: all 4 buttons are now always enabled. A new `pendingStatus` state (defaults `'green'`) + `handleOptionClick(status)` — if `selection.rowId` already exists, behavior is unchanged (`submitDirectBlock(status)`, saves immediately); if not, it sets `pendingStatus` and opens the same teacher+classroom picker `Teacher + Classroom` already used, deferring the save. `handleConfirmTeacherClassroom`'s two previously-hardcoded `status: 'green'` (in the conflict check and the save call) both became `status: pendingStatus` — this is the one correctness-critical line; it's what makes Meet Front Office stay exempt and Lesson Planning still conflict-block when created through this new path, reusing the exact conflict logic above unchanged. Confirmation summary gets a clarifying line ("**Break** will be added for X in Y") when `pendingStatus !== 'green'`, using `colorMap.js`'s existing `getStatusLabel`.
- No backend changes — `saveBlock`/conflict middleware already accept all 4 statuses regardless of which frontend flow produced the call.

### Backend has no hot-reload — a real gotcha hit twice this session
`server` is started via plain `node server.js` in every local-dev session recipe in this file (see "Restarting the stack" below) — **not** `npm run dev` (nodemon). Editing backend files while the server is already running does nothing until it's explicitly killed and restarted. This caused the conflict-detection reversal above to appear "not fixed" in the user's own browser after the code was already correct on disk, because the already-running process still had the old logic in memory. **Any future backend-logic session-in-progress: restart the backend after every backend file edit, not just at session start**, or verify via a fresh `node -e` / curl call that hits the actual running port, not just `node -c` (syntax-only) or a passing frontend-only Playwright run (which can pass for the wrong reason if a client-side pre-check masks a stale backend).

### Verified
Both `client` `npm run lint`/`npm run build` clean throughout. Real Playwright browser runs (same recipe as prior sessions) at every stage, throwaway `ZZTEST_...` data on dates `2027-03-15`, `2027-04-20` through `2027-04-24`, `2027-05-10` — all cleaned up afterward via the API + `mongosh` (schedule *documents* left over from row-delete-only-clears-draftRows, same known gap as every prior session). Real-data regression checks (read-only) against `2026-06-23` (4 rows), `2026-06-28` (5 rows), `2026-07-13` (9 rows) confirmed unchanged after every round. Direct backend curl tests (bypassing the frontend entirely) used specifically to verify the conflict-detection reversal after the hot-reload gotcha above.

### Real user data has changed significantly since the last documented session
The actual live teacher/classroom names are no longer `jenifer`/`isha`/`ashvini`/`lilly` and `infant`/`infant 2`/`pre-kg` as recorded in the 2026-06-29 session note — the user has since populated the app with the center's real roster. As of this session: teachers `Jennifer` (×2, unresolved duplicate), `Heaven`, `Kiran`, `May`, `Ayyana`, `Alyssa`, `Jyoti`, `Kim`, `Isabel`; classrooms `Infants`, `3's`, `Young Todds`, `2's`, `Infant`; known real schedule dates include `2026-06-23`, `2026-06-28`, `2026-07-13` (not necessarily exhaustive — always check `/api/teachers`, `/api/classrooms`, and the calendar's dot indicators before assuming a name or date is fake). **Update this note again the next time real data is inspected — it will keep drifting as the center actually uses the app.**

## Session 2026-07-23 — Grid alignment fix, print readability, Notes, print-only relabel

Reported by the user via a real example: on `2026-07-23`, rows with a long teacher/classroom name had their time columns visibly shifted right relative to the header and other rows.

### Grid alignment — root cause + shrink-then-wrap
- Root cause: `ScheduleGrid.css`'s `.schedule-row__label` is a flex item with `flex: 0 0 180px` but no `min-width: 0`. Flex items default to `min-width: auto`, which for non-wrapping content resolves to the content's own width — a long name silently grew the box past 180px, pushing that row's time-block columns out of alignment with the header and every other row. The pre-existing `.schedule-row__label-text` ellipsis rule never actually engaged because it lived on a child span, not the flex item itself.
- Fix: `min-width: 0` on `.schedule-row__label` (the actual bug). Interviewed the user on the desired behavior for long names before building — truncation was explicitly rejected (admin needs to see who's actually assigned, not a clipped name).
- New `client/src/hooks/useShrinkToFit.js`: steps a label's font-size down through `['0.9rem', '0.82rem', '0.75rem', '0.68rem', '0.62rem']` (measuring `scrollWidth` vs `clientWidth` via `useLayoutEffect`, no flash) until it fits on one line; only if it still doesn't fit at the smallest step does it allow wrapping. Wired into `ScheduleRow.jsx`'s label span (both the clickable teacher/classroom-link case and the plain-label fallback case).
- `.schedule-row__label-text` also gained `overflow-wrap: anywhere; word-break: break-word;` as a hard backstop — even a single unbroken long word can't push past the column, independent of whether the JS shrink logic runs correctly. No text is ever truncated or hidden.
- `.time-block`: `height: 44px` → `min-height: 44px`, so a row can grow taller when its label wraps (via the existing `align-items: stretch` on `.schedule-row`) without affecting any other row's height.
- Verified: real Playwright browser run, throwaway date `2027-08-15`, one row with an intentionally extreme long name (~90 combined characters) and one normal row — first-column x-diff and last-column right-edge-diff both measured **0.00px** against the header, label column width stayed exactly 180px even under the extreme case (wrapped to 4 lines at the smallest font step). Then re-verified read-only against the actual real `2026-07-23` schedule (20 rows, real data) the user reported the bug on — all rows confirmed pixel-aligned via screenshot.

### Print time-label readability
- `SchedulePrintView.jsx`/`.css`: the "7-7:30" header cell was one line at `0.4rem`, unreadably cramped. Changed to two stacked lines ("7-" / "7:30"), matching the pattern the on-screen grid (`ScheduleGrid.jsx`) already uses, at `0.55rem`. Verified via print-media-emulated screenshot.

### Notes feature (new)
- `server/src/models/Schedule.js`: added `notes: { type: String, default: '' }` — one overwritable note per date, independent of the draft/apply workflow.
- `server/src/controllers/scheduleController.js` / `routes/scheduleRoutes.js`: new `PATCH /api/schedule/:date/notes` (`updateNotes`), validates `notes` is a string, trims, 404s if the schedule doesn't exist.
- `client/src/api/scheduleApi.js`: `updateNotes(date, notes)`.
- New `client/src/components/Schedule/NotesModal.jsx`: textarea pre-filled with the current note, Cancel/OK — remounted via a `key` on open (not a setState-in-effect) so the draft resyncs to the saved note each time it opens without an eslint `react-hooks/set-state-in-effect` violation.
- `SchedulePage.jsx`: new "Notes" button next to Print, same `disabled={!isPublished}` gate (confirmed with the user — the note's only destination is the print page, itself gated the same way).
- `SchedulePrintView.jsx`/`.css`: notes render right-aligned below the grid, above the "Generated at" footer, only when non-empty.
- Verified: saved a note via the UI, confirmed it round-trips (persists in Mongo, survives reload) and appears correctly positioned in a print-media-emulated screenshot.

### Print-only relabel: "Active Shift" → "Supervision"
- Scoped to print only per the user's explicit choice — `colorMap.js`'s `getStatusLabel` (shared by the on-screen dropdown, block context menu, and tooltips) is untouched. `SchedulePrintView.jsx` gained a local `PRINT_LABEL_OVERRIDES = { green: 'Supervision' }` / `printStatusLabel()` used only in the print legend. Verified: print legend shows "Supervision", on-screen block context menu still shows "Active Shift" for the same block.

### Verified
`npm run lint` / `npm run build` (client) both clean. Real Playwright browser runs (same recipe as every prior session) against the live local stack — throwaway `ZZTEST_...` teacher/classroom on date `2027-08-15`, all cleaned up afterward via the API + the leftover schedule *document* removed via `mongosh` (same known gap as every prior session — row-delete only clears `draftRows`). Real-data regression check (read-only) confirmed unchanged: current real roster is significantly larger than previously documented — teachers now include `Jennifer` (×2, still unresolved), `Heaven`, `Kiran`, `May`, `Ayyana`, `Alyssa`, `Jyoti`, `Kim`, `Isabel`, `sumi`, `marie`, `sierra`, `celeste`, `jilian`, `brianna`; classrooms now include `Infants`, `3's`, `Young Todds`, `2's`, `Toddler A`, `Toddler B`, `pre-kg`, `school-age`, `kitchen`, `morning-check`, `midday-check`, `closing-check`. **Update this note again next time real data is inspected.**

## Known, accepted, not-yet-addressed

- A schedule document dated the literal string `"garbage-date"` was found sitting in the database during the Fix-1 data scan — almost certainly a pre-existing leftover from testing the `validateDateParam` middleware (see the Phase-1 "independent review" session above) from before that validation existed. Harmless (never reachable through the UI, which only ever requests valid `YYYY-MM-DD` dates), not touched since it wasn't part of what was being fixed — flagged to the user, left in place pending their call.
- Two teachers both named "Jennifer" still exist in the live database (2026-07-12) — the app-level duplicate-name guard (see session above) prevents new duplicates but doesn't retroactively fix this pair. A database-level unique index is a planned follow-up once the user decides which one to rename.
