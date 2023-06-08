const Router = require('express');
const router = new Router();
const BasketDeviceController = require('../controller/basketDeviceController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, BasketDeviceController.create);
router.get('/', authMiddleware, BasketDeviceController.getAll);
router.delete('/', authMiddleware, BasketDeviceController.delete);
module.exports = router;
