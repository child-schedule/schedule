# Build Progress

## Completed
- Layer 1: Project scaffold — root folder, git init, server/ and client/ folder structures created, server deps installed (express, mongoose, cors, dotenv, uuid, nodemon), client deps installed (Vite React template + react-router-dom, axios, dayjs), .env files created for both server and client, root .gitignore created. Committed: `chore: project scaffold`.
- Layer 2: Backend MongoDB connection — `server/src/config/db.js` (mongoose.connect) + `server/server.js` (Express app, connects to MongoDB before listening). Verified by running `node server.js` directly: logs `MongoDB connected` then `Server running on port 5000` against local mongod. Committed: `feat: mongodb connection`.

- Layer 3: Mongoose models — `Teacher` (name, createdAt), `Classroom` (name, createdAt), `Schedule` (date string unique, nested rows[] with teacherId/classroomId/rowLabel, each row's blocks[] with startTime/endTime/status enum green|yellow|orange). Verified with a live create/read/cleanup of all three models against local MongoDB (not just schema-shape check). Committed: `feat: mongoose models`.

- Layer 4: API routes/controllers + conflict detection middleware + global error handler. Teacher/Classroom: GET all, POST one-or-many (`{name}` or `{names:[]}`). Schedule: GET by date, POST create, POST copy (clones previous day's rows/blocks with fresh ids), POST add row (dedupes existing teacher+classroom pairing), PUT add-or-update block (conflict-checked), DELETE block, DELETE row. `conflictCheck` middleware blocks overlapping green/yellow blocks for the same teacher across rows (409 with teacher/classroom/time in the message), exempts orange entirely. Moved Express setup out of `server.js` into `src/app.js` (server.js is now just the entry point) to match the spec's folder structure. Verified every endpoint manually with curl against a live server + MongoDB, including the conflict 409, the orange exemption, edit-in-place, delete, and copy-previous-day — all test data cleaned up after. Committed: `feat: api routes and controllers`.

## Current Step
- Starting Layer 5: Frontend scaffold and routing — clean up Vite boilerplate, set up React Router with `/` (calendar) and `/schedule/:date` (schedule page), empty placeholder page components.

## Next Steps
- Layer 5: Frontend scaffold and routing.
- Layer 6: TeachersContext / ClassroomsContext.
- Layers 7–13: Calendar page, schedule page shell + copy modal, schedule grid, drag-to-select, assignment dropdown/inline-add, edit/delete blocks, conflict error handling.
- Layer 14: Final verification against Phase 1 checklist.

## Blockers
- MongoDB was not installed in WSL initially (Ubuntu 26.04 "resolute" too new for official MongoDB apt repo). Resolved: installed using the 24.04 "noble" package repo as a workaround. mongod also failed to fork initially because /var/log wasn't writable by the user — resolved by using a logpath under the user's home directory (~/mongodb-logs/mongod.log). MongoDB 8.0.26 confirmed running via `mongosh --eval "db.version()"`.
- Project lives under `/mnt/c/...` (Windows drive mounted into WSL via drvfs). `require('mongoose')` alone can take ~15-20s the first call because drvfs is slow for the many small file reads under `node_modules`. Not a code bug — budget extra time (~30s) when verifying server startup; a short timeout looking like a hang is not necessarily a failure.
- Process note: Layer 2's code (`server.js`, `db.js`) had been written in a prior session but left untested and uncommitted, and this file wasn't updated to reflect it. Caught and corrected this session: verified the connection works, then committed. Going forward, commit immediately after each layer is verified — don't let code sit uncommitted across sessions.

## Notes for future sessions
- See `../SUMMARY.md` (one level up, in the `child care` folder) for which spec/harness files govern this project — `childcare-scheduling-project-plan.md` + `HARNESSS.md` (NOT the CLAUDE.md/HARNESS.md pair, which is a different, unrelated project).
- mongod is started manually (no systemd in WSL): `mongod --dbpath /data/db --logpath ~/mongodb-logs/mongod.log --fork`. It must be running before `npm run dev` in server/ will connect successfully.
