export function validateMeetInfo(req, res, next) {
  const { display_name } = req.cookies;
  const { roomId } = req.params;
  if (!display_name) {
    return res.redirect('/lounge/' + roomId);
  }
  next();
}
