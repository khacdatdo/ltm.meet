import { Router } from 'express';
import { v4 } from 'uuid';
import { validateMeetInfo } from './validators';

const router = Router();

router.route('/').get(function (req, res) {
  res.redirect(v4());
});
router.route('/end').get(function (req, res) {
  res.render('end');
});

router.route('/:roomId').get(validateMeetInfo, function (req, res) {
  res.render('meet', { roomId: req.params.roomId, displayName: req.cookies.display_name });
});

router.route('/lounge/:roomId').get(function (req, res) {
  res.render('lounge', { roomId: req.params.roomId });
});

export default router;
