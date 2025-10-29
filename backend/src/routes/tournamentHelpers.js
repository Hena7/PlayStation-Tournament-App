// Helper function to format user profile photo URL
export const formatProfilePhoto = (user, req) => ({
  ...user,
  profile_photo_url: user.profile_photo_url
    ? `${req.protocol}://${req.get("host")}${user.profile_photo_url}`
    : null,
});

// Helper function to format match with avatars
export const formatMatch = (match, req) => ({
  ...match,
  player1_username: match.player1?.username,
  player2_username: match.player2?.username,
  winner_username: match.winner?.username,
  player1_avatar_url: match.player1?.profile_photo_url
    ? `${req.protocol}://${req.get("host")}${match.player1.profile_photo_url}`
    : null,
  player2_avatar_url: match.player2?.profile_photo_url
    ? `${req.protocol}://${req.get("host")}${match.player2.profile_photo_url}`
    : null,
  // `match.round` may be a relation (object) when included, or not present
  // so fall back to the foreign key `round_id` if needed. This prevents
  // undefined/NaN round numbers in the frontend when the round relation
  // wasn't included in the query.
  round: match.round?.round_number || match.round_id || match.round,
});
