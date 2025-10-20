const { Client, Account } = require('node-appwrite');

// Initialize Appwrite client
const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('671476bb000ae8b65b9e');

const account = new Account(client);

async function clearAllSessions() {
  try {
    console.log('🔄 Clearing all active sessions...');
    
    // First, try to login with the problematic account
    await account.createEmailSession('nguyenvana@gmail.com', 'password123');
    console.log('✅ Session created successfully');
    
    // Then delete all sessions
    await account.deleteSessions();
    console.log('✅ All sessions cleared successfully!');
    
    console.log('🎉 You can now login to Restaurant Portal');
  } catch (error) {
    if (error.message.includes('session is active')) {
      try {
        // If session already exists, just delete all sessions
        await account.deleteSessions();
        console.log('✅ Existing sessions cleared successfully!');
        console.log('🎉 You can now login to Restaurant Portal');
      } catch (deleteError) {
        console.error('❌ Error deleting sessions:', deleteError.message);
      }
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

clearAllSessions();