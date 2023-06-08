const { Comment, User, Rating } = require('../models/models');

class CommentController {
  async create(req, res) {
    try {
      const { id } = req.user;
      const { deviceId, text } = req.body;
      if (!id || !deviceId || !text) {
        return res.status(400).json({ message: 'not enought data' });
      }
      const comment = await Comment.create({ deviceId, userId: id, text });
      return res.json(comment);
    } catch (error) {
      return res.status(400).json({ message: 'Error while creating comment', info: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const { deviceId, limit = 9, page = 1 } = req.query;
      let offset = page * limit - limit;
      let comments = await Comment.findAll({ where: { deviceId: deviceId }, limit, offset });
      if (!comments) {
        return res.status(404).json({ message: 'comments not found' });
      }
      comments = await Promise.all(
        comments.map(async comment => {
          const user = await User.findOne({ where: { id: comment.userId } });
          if (!user) {
            return res.status(404).json({ message: 'could not find comment author' });
          }
          const rating = await Rating.findOne({ where: { userId: user.id, deviceId } });
          return {
            ...comment.dataValues,
            user_nickname: user.nickname,
            user_email: user.email,
            user_avatar: user.img,
            rating: rating?.rate || null,
          };
        })
      );
      return res.json(comments);
    } catch (error) {
      return res.status(400).json({ message: 'Error while getting comments', info: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.user;
      const { commentId, text } = req.body;
      if (!commentId || !text) {
        return res.status(400).json({ message: 'need comment id and comment message' });
      }
      let comment = await Comment.findOne({ where: { id: commentId, userId: id } });
      if (!comment) {
        return res.status(404).json({ message: 'comment not found' });
      }
      comment.text = text;
      await comment.save();
      return res.json(comment);
    } catch (error) {
      return res.status(400).json({ message: 'Error while changing comment', info: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.user;
      const { commentId } = req.query;
      if (!commentId) {
        return res.status(404).json({ message: 'not enough data' });
      }
      const comment = await Comment.findOne({ where: { id: commentId, userId: id } });
      if (!comment) {
        return res.status(404).json({ message: 'comment not found' });
      }
      await Comment.destroy({ where: { id: commentId, userId: id } });
      return res.json('Comment successfully deleted');
    } catch (error) {
      return res.status(400).json({ message: 'Error while deleting comment', info: error.message });
    }
  }
}

module.exports = new CommentController();
