import { Router } from 'express';

const router = Router();

router.route('/meet').get(function (req, res) {
  res.render('meet');
});

router.route('/lounge').get(function (req, res) {
  res.render('lounge');
});
export default router;
