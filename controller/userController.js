const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt');
const { User, Basket, FavoritesBasket } = require('../models/models');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const path = require('path');
const fs = require('fs');

const generateJwt = (id, email, role) => {
  return jwt.sign({ id, email, role }, process.env.SECRET_KEY, {
    expiresIn: '24h',
  });
};

class UserController {
  async registration(req, res, next) {
    let { email, password, role } = req.body;
    if (!email || !password) {
      return next(ApiError.badRequest('Некорректный email или password'));
    }
    const candidate = await User.findOne({ where: { email } });
    if (candidate) {
      return next(ApiError.badRequest('Пользователь с таким email уже существует'));
    }
    const hashPassword = await bcrypt.hash(password, 5);
    if (email.includes('admin')) {
      role = 'ADMIN';
    }
    try {
      const user = await User.create({
        email,
        role,
        password: hashPassword,
        nickname: null,
        img: null,
      });
      await Basket.create({ userId: user.id });
      await FavoritesBasket.create({ userId: user.id });
      const token = generateJwt(user.id, user.email, user.role);
      return res.json({ token });
    } catch (error) {
      return res
        .status(400)
        .json({ message: 'Error while registrating user', info: error.message });
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return next(ApiError.internal('Пользователь не найден'));
      }
      let comparePassword = await bcrypt.compare(password, user.password);
      if (!comparePassword) {
        return next(ApiError.internal('Указан неверный пароль'));
      }

      const token = generateJwt(user.id, user.email, user.role);
      return res.json({ token });
    } catch (error) {
      return res.status(400).json({ message: 'Error while logging in', info: error.message });
    }
  }

  async check(req, res, next) {
    try {
      const token = generateJwt(req.user.id, req.user.email, req.user.role);
      const user = await User.findOne({ where: { id: req.user.id } });
      return res.json({
        token,
        id: user.id,
        email: user.email,
        role: user.role,
        img: user.img,
        nickname: user.nickname,
      });
    } catch (error) {
      return res.status(400).json({ message: 'Error while auth', info: error.message });
    }
  }

  async updateUser(req, res, next) {
    try {
      const { id } = req.user;
      let { email, nickname, img, makeAdmin } = req.body;
      console.log(img);
      const user = await User.findOne({
        where: { id },
      });

      if (user) {
        if (img) {
          user.img = img;
        }
      }
      if (email && email !== 'undefined') {
        user.email = email;
      }
      if (nickname && nickname !== 'undefined') {
        user.nickname = nickname;
      }
      if (makeAdmin && makeAdmin !== 'undefined') {
        user.role = 'ADMIN';
      }
      await user.save();
      const updatedUser = await User.findOne({
        where: { id },
      });
      return res.json({
        email: updatedUser.email,
        nickname: updatedUser.nickname,
        img: updatedUser.img,
        role: updatedUser.role,
      });
    } catch (error) {
      return res.status(400).json({ message: 'Error updating user profile', info: error.message });
    }
  }
}
module.exports = new UserController();
