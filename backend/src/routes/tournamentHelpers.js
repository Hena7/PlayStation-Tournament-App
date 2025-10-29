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
  round: match.round?.round_number || match.round,
});
