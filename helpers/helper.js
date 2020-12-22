const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};
const comparePassword = async (password, encryptPassword) => {
  return await bcrypt.compare(password, encryptPassword);
};
const comparePasswordWithDb = async (password, userPassword) => {
  return password === userPassword;
};
const generateToken = (user) => {
  return jwt.sign({ user }, `${process.env.SECRET_KEY}`);
};
const verifyToken = (token) => {
  return jwt.verify(`${token}`, `${process.env.SECRET_KEY}`);
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  comparePasswordWithDb,
};
