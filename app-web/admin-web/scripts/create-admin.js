/**
 * Script to create admin user automatically
 * Run: node admin-web/scripts/create-admin.js
 */

import { Client, Account, Databases, ID } from 'appwrite';
import * as readline from 'readline';

// Appwrite config
const APPWRITE_ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '68c9791a002b85f096b4';
const DATABASE_ID = '68da5e73002cb68e70af';
const USER_COLLECTION_ID = 'user';

// Initialize Appwrite
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

const account = new Account(client);
const databases = new Databases(client);

// Readline interface for input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createAdminUser() {
  try {
    console.log('🚀 ADMIN USER CREATION SCRIPT\n');

    // Get admin details
    const email = await question('Enter admin email (default: admin@gmail.com): ') || 'admin@gmail.com';
    const password = await question('Enter admin password (min 8 chars, default: admin123): ') || 'admin123';
    const name = await question('Enter admin name (default: Admin): ') || 'Admin';

    console.log('\n📝 Creating admin user...\n');

    // Step 1: Create Auth user
    console.log('Step 1: Creating Auth account...');
    let authUser;
    try {
      authUser = await account.create(
        ID.unique(),
        email,
        password,
        name
      );
      console.log(`✅ Auth user created with ID: ${authUser.$id}`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️  Auth user already exists. Trying to login...');
        
        // Login to get existing user
        try {
          await account.createEmailPasswordSession(email, password);
          authUser = await account.get();
          console.log(`✅ Found existing auth user with ID: ${authUser.$id}`);
        } catch (loginError) {
          console.error('❌ Failed to login with existing user:', loginError.message);
          throw loginError;
        }
      } else {
        throw error;
      }
    }

    // Step 2: Create User document
    console.log('\nStep 2: Creating User document in database...');
    try {
      const userDoc = await databases.createDocument(
        DATABASE_ID,
        USER_COLLECTION_ID,
        ID.unique(),
        {
          accountId: authUser.$id,
          name: name,
          email: email,
          role: 'admin',
          avatar: '',
          phone: '',
          address_home: '',
          address_home_label: 'Home'
        }
      );
      console.log(`✅ User document created with ID: ${userDoc.$id}`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️  User document already exists');
      } else {
        console.error('❌ Failed to create user document:', error.message);
        throw error;
      }
    }

    console.log('\n✨ SUCCESS! Admin user created!\n');
    console.log('📋 Details:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Auth ID: ${authUser.$id}`);
    console.log(`   Role: admin`);
    console.log('\n⚠️  IMPORTANT: You need to add "admin" label manually in Appwrite Console:');
    console.log('   1. Go to Auth → Users');
    console.log(`   2. Click on ${email}`);
    console.log('   3. Scroll to "Labels" section');
    console.log('   4. Add label: "admin"');
    console.log('   5. Click "Update"\n');

    console.log('🎯 You can now login at: http://localhost:3001\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

createAdminUser();
