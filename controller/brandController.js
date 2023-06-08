const { Brand } = require('../models/models');

class BrandController {
  async create(req, res) {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(404).json({ message: 'not enough data' });
      }
      const brand = await Brand.create({ name });
      return res.json(brand);
    } catch (error) {
      return res.status(400).json({ message: 'Error while creating brand', info: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const brands = await Brand.findAll();
      return res.json(brands);
    } catch (error) {
      return res.status(400).json({ message: 'Error while fetching brands', info: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(404).json({ message: 'not enough data' });
      }
      await Brand.destroy({ where: { id } });
      const allBrands = await Brand.findAll();
      return res.json({ data: allBrands, message: 'Brand deleted successfully' });
    } catch (error) {
      return res.status(400).json({ message: 'Error while deleting brand', info: error.message });
    }
  }
}

module.exports = new BrandController();
