/**
 * Script to create the master admin user in Redis
 * Run with: npx tsx scripts/create-master-admin.ts
 */

import 'dotenv/config';
import { redis } from '../lib/redist';

async function createMasterAdmin() {
  const masterEmail = process.env.MASTER_ADMIN_EMAIL;

  if (!masterEmail) {
    console.error('❌ MASTER_ADMIN_EMAIL not found in environment variables');
    process.exit(1);
  }

  console.log('🔧 Creating master admin user...');
  console.log(`📧 Email: ${masterEmail}`);

  try {
    // Check if user already exists
    const existingUser = await redis.hgetall(`user:${masterEmail}`);

    if (existingUser && Object.keys(existingUser).length > 0) {
      console.log('⚠️  Master admin user already exists!');
      console.log('Current user data:', existingUser);

      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const answer = await new Promise<string>((resolve) => {
        readline.question('Do you want to update it? (yes/no): ', resolve);
      });
      readline.close();

      if (answer.toLowerCase() !== 'yes') {
        console.log('❌ Cancelled. No changes made.');
        process.exit(0);
      }
    }

    // Create/Update the master admin user
    const userData = {
      email: masterEmail,
      name: 'Master Admin',
      role: 'MASTER_ADMIN',
      createdAt: new Date().toISOString(),
      invitedBy: 'system',
      lastSignIn: '',
    };

    await redis.hset(`user:${masterEmail}`, userData);

    // Add to users index
    await redis.sadd('users:all', masterEmail);

    console.log('✅ Master admin user created successfully!');
    console.log('User data:', userData);
    console.log('');
    console.log('🎉 You can now sign in at: http://localhost:3000/auth/signin');
    console.log(`📧 Using email: ${masterEmail}`);
  } catch (error) {
    console.error('❌ Error creating master admin:', error);
    process.exit(1);
  }
}

createMasterAdmin();
