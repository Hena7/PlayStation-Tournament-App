# TODO: Implement Bye Handling for Odd Number of Players

## Backend Changes

- [x] Add `bye_count` field to Participant model in schema.prisma
- [x] Run Prisma migration for the new field
- [x] Update tournament start logic in tournamentLifecycle.js to select bye fairly
- [x] Update next-round logic in tournamentMatches.js to select bye fairly
- [x] Update ranking.js to count byes in gamesPlayed and wins

## Frontend Changes

- [x] Update Leaderboard.jsx to display "X + Y bye" format for games played and wins
- [x] Update Rounds.jsx to show "Bye" for bye matches instead of "vs"

## Testing

- [x] Test bye selection logic
- [x] Test leaderboard display
- [x] Test rounds display
