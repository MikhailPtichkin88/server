const Router = require('express');
const router = new Router();
const ratingController = require('../controller/ratingController');
const authMiddleware = require('../middleware/authMiddleware');
router.post('/', authMiddleware, ratingController.create);
router.get('/', ratingController.get);

module.exports = router;
