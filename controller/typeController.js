const { Type } = require('../models/models');
const ApiError = require('../error/ApiError');

class TypeController {
  async create(req, res) {
    const { name } = req.body;
    if (!name) {
      return res.status(404).json({ message: 'not enough data' });
    }
    try {
      const type = await Type.create({ name });
      return res.json(type);
    } catch (error) {
      return res.status(400).json({ message: 'Error while creating type', info: error.message });
    }
  }
  async getAll(req, res) {
    try {
      const types = await Type.findAll();
      return res.json(types);
    } catch (error) {
      return res.status(400).json({ message: 'Error while fetching types', info: error.message });
    }
  }

  async delete(req, res) {
    const { id } = req.params;
    if (!id) {
      return res.status(404).json({ message: 'not enough data' });
    }
    try {
      await Type.destroy({ where: { id } });
      const allTypes = await Type.findAll();
      return res.json({ data: allTypes, message: 'Type deleted successfully' });
    } catch (error) {
      return res.status(400).json({ message: 'Error while deleting type', info: error.message });
    }
  }
}
module.exports = new TypeController();
