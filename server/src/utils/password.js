const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

async function comparePassword(candidate, hashed) {
  return bcrypt.compare(candidate, hashed);
}

module.exports = {
  hashPassword,
  comparePassword,
};
