# Build Progress

## Completed
- Layer 1: Project scaffold — root folder, git init, server/ and client/ folder structures created, server deps installed (express, mongoose, cors, dotenv, uuid, nodemon), client deps installed (Vite React template + react-router-dom, axios, dayjs), .env files created for both server and client, root .gitignore created.

## Current Step
- About to commit Layer 1, then start Layer 2: Backend MongoDB connection (server/src/config/db.js + server.js).

## Next Steps
- Layer 2: MongoDB connection logic + server.js entry point, verify server starts and connects.
- Layer 3: Mongoose models (Teacher, Classroom, Schedule).
- Layer 4: API routes/controllers + conflict detection middleware.
- Layers 5–13: Frontend (routing, context, calendar, schedule grid, drag-select, dropdown/inline-add, edit/delete, conflict UI).
- Layer 14: Final verification against Phase 1 checklist.

## Blockers
- MongoDB was not installed in WSL initially (Ubuntu 26.04 "resolute" too new for official MongoDB apt repo). Resolved: installed using the 24.04 "noble" package repo as a workaround. mongod also failed to fork initially because /var/log wasn't writable by the user — resolved by using a logpath under the user's home directory (~/mongodb-logs/mongod.log). MongoDB 8.0.26 confirmed running via `mongosh --eval "db.version()"`.

## Notes for future sessions
- See `../SUMMARY.md` (one level up, in the `child care` folder) for which spec/harness files govern this project — `childcare-scheduling-project-plan.md` + `HARNESSS.md` (NOT the CLAUDE.md/HARNESS.md pair, which is a different, unrelated project).
- mongod is started manually (no systemd in WSL): `mongod --dbpath /data/db --logpath ~/mongodb-logs/mongod.log --fork`. It must be running before `npm run dev` in server/ will connect successfully.
