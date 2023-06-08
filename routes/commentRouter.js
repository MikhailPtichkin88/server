const Router = require('express');
const router = new Router();
const commentController = require('../controller/commentController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, commentController.create);
router.get('/', commentController.getAll);
router.patch('/', authMiddleware, commentController.update);
router.delete('/', authMiddleware, commentController.delete);

module.exports = router;
