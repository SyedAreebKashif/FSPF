import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/user.model';

export const seedAdmin = async (): Promise<void> => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@portfolio.design';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPass123!';
  const adminName = process.env.ADMIN_NAME || 'Portfolio Administrator';

  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }

  const existing = await User.findOne({ email: adminEmail.toLowerCase() });
  if (existing) {
    existing.role = 'admin';
    existing.password = adminPassword; // Triggers pre-save hook
    await existing.save();
    console.log(`✅ Admin account updated for: ${adminEmail}`);
  } else {
    await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });
    console.log(`✅ Admin account created: ${adminEmail}`);
  }

  console.log(`🔑 Credentials:\n   Email: ${adminEmail}\n   Password: ${adminPassword}`);
};

if (require.main === module) {
  seedAdmin()
    .then(async () => {
      await disconnectDB();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('❌ Seeding admin failed:', err);
      await disconnectDB();
      process.exit(1);
    });
}
