const uuid = require('uuid');
const path = require('path');
const { Device, DeviceInfo, Rating, Comment } = require('../models/models');
const ApiError = require('../error/ApiError');
const fs = require('fs');

class DeviceController {
  async create(req, res, next) {
    try {
      let { name, price, brandId, typeId, img, info } = req.body;
      if ((!name, !price, !brandId, !typeId, !img)) {
        return res
          .status(400)
          .json({ message: 'need to enter name, price, brandId, typeId, img link' });
      }

      const device = await Device.create({ name, price, brandId, typeId, img });

      if (info) {
        info = JSON.parse(info);
        info.forEach(i =>
          DeviceInfo.create({
            title: i.title,
            description: i.description,
            deviceId: device.id,
          })
        );
      }
      return res.json(device);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }

  async getAll(req, res) {
    try {
      let { brandId, typeId, limit, page } = req.query;
      page = page || 1;
      limit = limit || 9;
      let offset = page * limit - limit;
      let devices;
      if (!brandId && !typeId) {
        devices = await Device.findAndCountAll({ limit, offset });
        let ratings = await Promise.all(
          devices.rows.map(device => Rating.findAll({ where: { deviceId: device.id } }))
        );
        devices.rows = devices.rows.map((device, index) => {
          let arr = ratings[index].map(r => r.rate);
          let sum = 0;
          for (var i = 0; i < arr.length; i++) {
            sum += arr[i];
          }
          let avg = sum / arr.length;
          return {
            ...device.dataValues,
            rating: avg,
          };
        });
      }
      if (brandId && !typeId) {
        devices = await Device.findAndCountAll({ where: { brandId }, limit, offset });
      }
      if (!brandId && typeId) {
        devices = await Device.findAndCountAll({ where: { typeId }, limit, offset });
      }
      if (brandId && typeId) {
        devices = await Device.findAndCountAll({ where: { typeId, brandId }, limit, offset });
      }
      return res.json(devices);
    } catch (error) {
      return res.status(400).json({ message: 'Error while fetching devices', info: error.message });
    }
  }

  async getOne(req, res) {
    try {
      const { id } = req.params;
      let device = await Device.findOne({
        where: { id },
        include: [
          { model: DeviceInfo, as: 'info' },
          { model: Comment, as: 'comments' },
        ],
      });
      let ratings = (await Rating.findAll({ where: { deviceId: device.id } })).map(r => r.rate);
      if (ratings.length) {
        let sum = 0;
        for (let i = 0; i < ratings.length; i++) {
          sum += ratings[i];
        }

        let avg = sum / ratings.length;
        device.rating = avg;
      } else {
        device.rating = 0;
      }
      await device.save();
      return res.json(device);
    } catch (error) {
      return res.status(400).json({ message: 'Error while fetching device', info: error.message });
    }
  }

  async updateDevice(req, res) {
    try {
      const { id } = req.params;

      let { name, price, brandId, typeId, img, info } = req.body;

      const device = await Device.findOne({
        where: { id },
        include: [{ model: DeviceInfo, as: 'info' }],
      });

      if (device) {
        if (img) {
          device.img = img;
        }
        if (name && name !== 'undefined') {
          device.name = name;
        }
        if (price && price !== 'undefined') {
          device.price = price;
        }
        if (brandId && brandId !== 'undefined') {
          device.brandId = brandId;
        }
        if (typeId && typeId !== 'undefined') {
          device.typeId = typeId;
        }
        if (info) {
          info = JSON.parse(info);
          // Получаем список существующих характеристик товара
          const existingDeviceInfo = await DeviceInfo.findAll({
            where: { deviceId: id },
          });

          // Удаляем старые характеристики
          const deletedDeviceInfo = existingDeviceInfo.filter(
            infoItem => !info.some(i => i.id === infoItem.id)
          );
          await DeviceInfo.destroy({
            where: { id: deletedDeviceInfo.map(infoItem => infoItem.id) },
          });

          // Обновляем существующие характеристики
          const updatedDeviceInfo = existingDeviceInfo.filter(infoItem =>
            info.some(i => i.id === infoItem.id)
          );
          await Promise.all(
            updatedDeviceInfo.map(infoItem =>
              DeviceInfo.update(
                { title: infoItem.title, description: infoItem.description },
                { where: { id: infoItem.id } }
              )
            )
          );

          // Добавляем новые характеристики
          const newDeviceInfo = info.filter(
            infoItem => !existingDeviceInfo.some(i => i.id === infoItem.id)
          );
          await Promise.all(
            newDeviceInfo.map(infoItem =>
              DeviceInfo.create({
                deviceId: id,
                title: infoItem.title,
                description: infoItem.description,
              })
            )
          );
        }
        await device.save();
        const updatedDevice = await Device.findOne({
          where: { id },
          include: [{ model: DeviceInfo, as: 'info' }],
        });
        return res.json(updatedDevice);
      } else {
        return res.status(404).send('Device not found');
      }
    } catch (error) {
      return res.status(400).json({ message: 'Error while updating device', info: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(404).json({ message: 'not enough data' });
      }
      let { limit, page } = req.query;
      page = page || 1;
      limit = limit || 9;
      let offset = page * limit - limit;
      await Device.destroy({ where: { id } });
      const devices = await Device.findAndCountAll({ limit, offset });
      return res.json({ data: devices, message: 'Brand deleted successfully' });
    } catch (error) {
      return res.status(400).json({ message: 'Error while deleting device', info: error.message });
    }
  }
}
module.exports = new DeviceController();
