// Clear session using native fetch (no extra packages needed)

const APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1';
const PROJECT_ID = '671476bb000ae8b65b9e';

async function clearSessionsWithFetch() {
  try {
    console.log('🔄 Attempting to clear sessions...');
    
    // First try to login
    const loginResponse = await fetch(`${APPWRITE_ENDPOINT}/account/sessions/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': PROJECT_ID
      },
      body: JSON.stringify({
        email: 'nguyenvana@gmail.com',
        password: 'password123'
      })
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login successful');
      
      // Extract session cookie/token from response
      const sessionCookie = loginResponse.headers.get('set-cookie');
      
      // Now delete all sessions
      const deleteResponse = await fetch(`${APPWRITE_ENDPOINT}/account/sessions`, {
        method: 'DELETE',
        headers: {
          'X-Appwrite-Project': PROJECT_ID,
          'Cookie': sessionCookie || ''
        }
      });

      if (deleteResponse.ok) {
        console.log('✅ All sessions cleared successfully!');
        console.log('🎉 You can now try logging into Restaurant Portal again');
      } else {
        console.log('⚠️ Delete response:', deleteResponse.status, await deleteResponse.text());
      }
    } else {
      const errorText = await loginResponse.text();
      console.log('❌ Login failed:', loginResponse.status, errorText);
      
      if (errorText.includes('rate limit')) {
        console.log('⏰ Rate limit detected. Please wait 5-10 minutes and try again.');
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('💡 Suggestion: Wait 5-10 minutes for rate limit to reset, then try logging into Restaurant Portal again.');
  }
}

clearSessionsWithFetch();