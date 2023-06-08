const { BasketDevice, Device } = require('../models/models');
const { Basket } = require('../models/models');

class BasketDeviceController {
  async create(req, res) {
    try {
      const { deviceId } = req.body;
      const { id } = req.user;
      if (!id || !deviceId) {
        return res.status(400).json({ message: 'not enough data' });
      }
      const basket = await Basket.findOne({ where: { userId: id } });
      if (!basket) {
        return res.status(404).json({ message: 'user basket not found' });
      }
      const device = await Device.findOne({ where: { id: deviceId } });
      if (!device) {
        return res.status(404).json({ message: 'device not found' });
      }
      await BasketDevice.create({ deviceId, basketId: basket.id });
      const basketDevices = await BasketDevice.findAndCountAll({
        where: { basketId: basket.id },
        attributes: ['deviceId'],
        group: ['deviceId'],
      });
      const devices = await Promise.all(
        basketDevices?.count?.map(async basketDevice => {
          const device = await Device.findOne({ where: { id: basketDevice?.deviceId } });
          if (device) {
            return {
              ...basketDevice,
              name: device.dataValues.name,
              price: device.dataValues.price,
              rating: device.dataValues.rating || 0,
              img: device.dataValues.img || null,
            };
          }
        })
      );
      return res.json(devices);
    } catch (error) {
      return res
        .status(400)
        .json({ message: 'Error while creating basket device', info: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const { id } = req.user;
      let { limit, page } = req.query;
      page = page || 1;
      limit = limit || 3;
      let offset = page * limit - limit;
      const basket = await Basket.findOne({ where: { userId: id } });
      if (!basket) {
        return res.status(404).json({ message: 'user basket not found' });
      }
      const basketDevices = await BasketDevice.findAndCountAll({
        where: { basketId: basket.id },
        limit,
        offset,
        attributes: ['deviceId'],
        group: ['deviceId'],
      });
      if (!basketDevices) {
        return res.status(404).json({ message: 'user basket devices not found' });
      }
      const devices = await Promise.all(
        basketDevices.count.map(async basketDevice => {
          const device = await Device.findOne({ where: { id: basketDevice.deviceId } });
          if (device) {
            return {
              ...basketDevice,
              name: device.dataValues.name,
              price: device.dataValues.price,
              rating: device.dataValues.rating || 0,
              img: device.dataValues.img || null,
            };
          }
        })
      );
      return res.json(devices);
    } catch (error) {
      return res
        .status(400)
        .json({ message: 'Error while getting all basket devices', info: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { deviceId, deleteAll = false } = req.query;
      const { id } = req.user;
      const basket = await Basket.findOne({ where: { userId: id } });
      if (!basket) {
        return res.status(404).json({ message: 'Basket not found' });
      }
      if (deleteAll) {
        const basketDevices = await BasketDevice.findAll({ where: { basketId: basket.id } });
        await Promise.all(basketDevices.map(async basketDevice => await basketDevice.destroy()));
        return res.json({ message: 'Basket devices deleted successfully' });
      }
      const basketDevice = await BasketDevice.findOne({ where: { deviceId, basketId: basket.id } });
      if (!basketDevice) {
        return res.status(404).json({ message: 'Basket device not found' });
      }
      await basketDevice.destroy();
      return res.json({ message: 'Basket device deleted successfully' });
    } catch (error) {
      return res
        .status(400)
        .json({ message: 'Error while deleting basket device', info: error.message });
    }
  }
}
module.exports = new BasketDeviceController();
