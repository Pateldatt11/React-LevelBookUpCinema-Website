const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const USERS_FILE = path.join(__dirname, 'users.json');

const read = () => {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8') || '[]');
  } catch (e) {
    return [];
  }
};

const write = (u) => fs.writeFileSync(USERS_FILE, JSON.stringify(u, null, 2), 'utf8');

const users = read();
let changed = 0;
const migrated = users.map((user) => {
  if (!user.password) return user;
  // naive check: bcrypt hashes typically start with $2a$ or $2b$
  if (typeof user.password === 'string' && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$'))) {
    return user;
  }

  const hashed = bcrypt.hashSync(String(user.password), 10);
  changed += 1;
  return { ...user, password: hashed };
});

if (changed > 0) {
  write(migrated);
  console.log(`Re-hashed ${changed} user password(s) in users.json`);
} else {
  console.log('No plaintext passwords found; no changes made.');
}
