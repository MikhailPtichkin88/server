const Router = require('express');
const router = new Router();
const favoriteDeviceController = require('../controller/favoriteDeviceController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, favoriteDeviceController.create);
router.get('/', authMiddleware, favoriteDeviceController.getAll);
router.delete('/:id', authMiddleware, favoriteDeviceController.delete);

module.exports = router;
