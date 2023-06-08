const { Rating } = require('../models/models');

class RatingController {
  async create(req, res) {
    const { id: userId } = req.user;
    const { deviceId, rate } = req.body;
    if (!deviceId || !rate) {
      return res.status(404).json({ message: 'not enough data' });
    }
    if (rate > 5 || rate < 1) {
      return res.status(403).json({ message: 'not correct rating' });
    }
    try {
      const isAlready = await Rating.findOne({ where: { userId, deviceId } });
      if (isAlready) {
        return res.json('Rating has been already set');
      }
      await Rating.create({ userId, deviceId, rate });
      const rating = await Rating.findAll({ where: { deviceId } });
      const ratingArr = rating.map(rate => rate.rate);
      let avg;
      if (ratingArr.length) {
        let sum = 0;
        for (let i = 0; i < ratingArr.length; i++) {
          sum += ratingArr[i];
        }
        avg = sum / ratingArr.length;
      } else {
        avg = null;
      }

      return res.json(avg);
    } catch (err) {
      return res.status(400).json({ message: 'Error while setting rating', info: err.message });
    }
  }

  async get(req, res) {
    const { deviceId } = req.query;
    if (!deviceId) {
      return res.status(404).json({ message: 'not enough data' });
    }
    try {
      const rating = await Rating.findAll({ where: { deviceId } });
      const ratingArr = rating.map(rate => rate.rate);
      let avg;
      if (ratingArr.length) {
        let sum = 0;
        for (let i = 0; i < ratingArr.length; i++) {
          sum += ratingArr[i];
        }
        avg = sum / ratingArr.length;
      } else {
        avg = null;
      }

      return res.json(avg);
    } catch (err) {
      return res.status(400).json({ message: 'Error while getting rating', info: err.message });
    }
  }
}
module.exports = new RatingController();
