const bcrypt = require('bcryptjs');

function hashAndLogPassword(password) {
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.error('Error hashing password:', err);
    } else {
      console.log(`Hashed password for "${password}":\n${hash}`);
    }
  });
}

hashAndLogPassword('Ardiy4190!');