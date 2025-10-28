# Tournament.js Refactoring TODO

- [x] Create `backend/src/routes/tournamentHelpers.js` for shared helper functions (`formatProfilePhoto`, `formatMatch`)
- [x] Create `backend/src/routes/tournamentUsers.js` for the `/users` endpoint
- [x] Create `backend/src/routes/tournamentLifecycle.js` for lifecycle endpoints: `/latest`, `/create`, `/apply`, `/close`, `/start`, `/reset`
- [x] Create `backend/src/routes/tournamentMatches.js` for matches-related endpoints: `/:tournamentId/matches`, `/matches/:matchId`, `/:tournamentId/next-round`
- [x] Update `backend/src/routes/tournament.js` to import and combine the sub-routers
- [ ] Verify refactoring by running the backend server and checking for errors
