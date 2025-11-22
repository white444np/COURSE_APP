const User = require('../models/Users');
const config = require('../config/env');
const { hashPassword } = require('./password');

async function ensureAdminAccount() {
  const {
    name,
    email: targetEmail,
    password,
    forceReset,
  } = config.admin;
  const hashedPassword = await hashPassword(password);

  let admin = await User.findOne({ role: 'admin' }).select('+password +role');

  if (admin) {
    const desiredEmail = targetEmail || admin.email;
    const shouldUpdatePassword = forceReset || true;

    if (shouldUpdatePassword) {
      admin.password = hashedPassword;
    }

    if (name && admin.name !== name) {
      admin.name = name;
    }

    if (admin.email !== desiredEmail) {
      const conflictingUser = await User.findOne({ email: desiredEmail }).select('_id role');
      if (!conflictingUser || String(conflictingUser._id) === String(admin._id)) {
        admin.email = desiredEmail;
      } else if (forceReset) {
        conflictingUser.role = 'admin';
        conflictingUser.name = conflictingUser.name || name;
        conflictingUser.password = hashedPassword;
        await conflictingUser.save();

        admin.role = 'user';
        await admin.save();

        admin = conflictingUser;
      }
    }

    await admin.save();

    // eslint-disable-next-line no-console
    console.log('✅ Admin account synchronized with environment configuration');
    // eslint-disable-next-line no-console
    console.log(`   Email: ${admin.email}`);
    // eslint-disable-next-line no-console
    console.log('   Password: (from ADMIN_PASSWORD env or default value)');

    return admin;
  }

  const existingByEmail = await User.findOne({ email: targetEmail }).select('+password +role');

  if (existingByEmail) {
    existingByEmail.name = existingByEmail.name || name;
    existingByEmail.password = hashedPassword;
    existingByEmail.role = 'admin';
    await existingByEmail.save();

    // eslint-disable-next-line no-console
    console.log('✅ Existing user promoted to admin');
    // eslint-disable-next-line no-console
    console.log(`   Email: ${existingByEmail.email}`);
    // eslint-disable-next-line no-console
    console.log('   Password: (from ADMIN_PASSWORD env or default value)');

    return existingByEmail;
  }

  admin = await User.create({
    name,
    email: targetEmail,
    password: hashedPassword,
    role: 'admin',
  });

  // eslint-disable-next-line no-console
  console.log('✅ Admin account created');
  // eslint-disable-next-line no-console
  console.log(`   Email: ${targetEmail}`);
  // eslint-disable-next-line no-console
  console.log('   Password: (from ADMIN_PASSWORD env or default value)');

  return admin;
}

module.exports = ensureAdminAccount;
