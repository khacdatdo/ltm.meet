import { Router } from 'express';

const router = Router();

router.route('/meet').get(function (req, res) {
  res.render('meet');
});

export default router;
