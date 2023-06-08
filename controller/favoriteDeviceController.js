const { FavoriteDevice, FavoritesBasket, Device } = require('../models/models');

class FavoriteDeviceController {
  async create(req, res) {
    try {
      const { deviceId } = req.body;
      const { id } = req.user;
      if (!deviceId || !id) {
        return res.status(404).json({ message: 'not enough data' });
      }
      const favoritesBasket = await FavoritesBasket.findOne({ where: { userId: id } });
      const alreadyFavorite = await FavoriteDevice.findOne({
        where: {
          favoriteBasketId: favoritesBasket?.dataValues?.id,
          deviceId,
        },
      });
      if (alreadyFavorite) {
        return res.status(409).json({ message: 'Device already favorited' });
      }
      const favoriteDevice = await FavoriteDevice.create({
        deviceId,
        favoriteBasketId: favoritesBasket.id,
      });
      return res.json(favoriteDevice);
    } catch (error) {
      return res
        .status(400)
        .json({ message: 'Error while creating favorite device', info: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const { id } = req.user;
      if (!id) {
        return res.status(404).json({ message: 'not enough data' });
      }
      let { limit, page } = req.query;
      page = page || 1;
      limit = limit || 3;
      let offset = page * limit - limit;
      const favoritesBasket = await FavoritesBasket.findOne({ where: { userId: id } });
      const favoriteDevices = await FavoriteDevice.findAndCountAll({
        where: { favoriteBasketId: favoritesBasket?.dataValues?.id },
        limit,
        offset,
      });
      const devices = await Promise.all(
        favoriteDevices.rows.map(async favoriteDevice => {
          const device = await Device.findOne({ where: { id: favoriteDevice.deviceId } });
          return {
            ...favoriteDevice.dataValues,
            name: device.name,
            price: device.price,
            rating: device.rating || 0,
            img: device.img || null,
          };
        })
      );
      return res.json(devices);
    } catch (error) {
      return res
        .status(400)
        .json({ message: 'Error while getting favorite devices', info: error.message });
    }
  }

  async delete(req, res) {
    const { id: userId } = req.user;
    const { id } = req.params;
    if (!id) {
      return res.status(404).json({ message: 'not enough data' });
    }
    const favoritesBasket = await FavoritesBasket.findOne({ where: { userId } });
    const favoriteDevice = await FavoriteDevice.findOne({
      where: { id, favoriteBasketId: favoritesBasket?.id },
    });
    if (!favoriteDevice) {
      return res.status(404).json({ message: 'favorite device not found' });
    }
    await FavoriteDevice.destroy({ where: { id } });

    return res.json({ message: 'Favorite device deleted successfully' });
  }
}

module.exports = new FavoriteDeviceController();
