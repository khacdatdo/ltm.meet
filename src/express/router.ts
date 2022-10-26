import { Router } from 'express';

const router = Router();

router.route('/meet/1').get(function (req, res) {
  res.render('meet');
});

export default router;
