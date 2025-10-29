# Tournament Implementation TODO

## Backend Changes

- [ ] Update Prisma schema: Add Rounds model, update Match with round_id and score
- [ ] Run Prisma migration
- [ ] Modify tournament start logic: Create 3 rounds with random pairings for all participants
- [ ] Update next-round logic: Mark current round completed, start next round if not last
- [ ] Update match update: Allow setting winner and score
- [ ] Add endpoints for rounds if needed

## Frontend Changes

- [ ] Update Home.jsx: Change rules to reflect 3 chances, no elimination
- [ ] Create Rounds.jsx page: Show collapsible rounds with matches
- [ ] Update Header.jsx: Add Rounds link
- [ ] Update BracketDisplay.jsx: Display rounds as collapsible cards
- [ ] Update AdminPanel.jsx: Show rounds and controls
- [ ] Update UserDashboard.jsx: Show current round matches

## Testing

- [ ] Test backend endpoints
- [ ] Test frontend navigation and display
- [ ] Verify tournament flow: start, rounds, completion
