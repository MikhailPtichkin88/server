const Router = require('express');
const router = new Router();

const userRouter = require('./userRouter');
const typeRouter = require('./typeRouter');
const brandRouter = require('./brandRouter');
const deviceRouter = require('./deviceRouter');
const basketDeviceRouter = require('./basketDeviceRouter');
const ratingRouter = require('./ratingRouter');
const commentRouter = require('./commentRouter');
const favoriteDeviceRouter = require('./favoriteDeviceRouter');

router.use('/user', userRouter);
router.use('/type', typeRouter);
router.use('/brand', brandRouter);
router.use('/device', deviceRouter);
router.use('/basket', basketDeviceRouter);
router.use('/rating', ratingRouter);
router.use('/comment', commentRouter);
router.use('/favorite', favoriteDeviceRouter);

module.exports = router;
