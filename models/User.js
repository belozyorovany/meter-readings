const mongoose = require('mongoose');
const crypto = require('crypto');
const connection = require('../libs/connection');
const config = require('../config');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: 'E-mail пользователя не должен быть пустым',
    validate: [
      {
        validator(value) {
          return /^[-.\w]+@([\w-]+\.)+[\w-]{2,12}$/.test(value);
        },
        message: 'Некорректный email',
      },
    ],
    unique: true,
  },
  displayName: {
    type: String,
    required: 'У пользователя должно быть имя',
    unique: true,
  },
  verificationToken: {
    type: String,
    index: true,
  },
  passwordHash: {
    type: String,
  },
  salt: {
    type: String,
  },
}, {
  timestamps: true,
});

userSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    let errorMessage
    if (error.keyPattern.email) {
      errorMessage = 'Such email already exists';
    } else if (error.keyPattern.displayName) {
      errorMessage = 'Such user name already exists';
    }

    next(new Error(errorMessage));
  } else {
    next();
  }
});

function generatePassword(salt, password) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(
        password, salt,
        config.crypto.iterations,
        config.crypto.length,
        config.crypto.digest,
        (err, key) => {
          if (err) return reject(err);
          resolve(key.toString('hex'));
        },
    );
  });
}

function generateSalt() {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(config.crypto.length, (err, buffer) => {
      if (err) return reject(err);
      resolve(buffer.toString('hex'));
    });
  });
}

userSchema.methods.setPassword = async function setPassword(password) {
  this.salt = await generateSalt();
  this.passwordHash = await generatePassword(this.salt, password);
}

userSchema.methods.checkPassword = async function(password) {
  if (!password) return false;

  const hash = await generatePassword(this.salt, password);
  return hash === this.passwordHash;
}

userSchema.methods.verify = async function() {
  this.verificationToken = undefined;
}

userSchema.methods.checkVerified = async function() {
  return this.verificationToken === undefined;
}

module.exports = connection.model('User', userSchema);
