import { Client, Databases } from 'node-appwrite';

/**
 * Appwrite Function: send-notification
 * Trigger: Manual call hoặc Event-based
 * Purpose: Gửi push notifications đến user khi có order updates
 */

export default async ({ req, res, log, error }) => {
  try {
    // Parse request body
    const { userId, title, body, data } = JSON.parse(req.body || req.payload);

    log(`📨 Sending notification to user: ${userId}`);

    // Initialize Appwrite client
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY); // API Key with proper permissions

    const databases = new Databases(client);
    const databaseId = process.env.DATABASE_ID;

    // 1. Get user's FCM token from database
    log('📱 Fetching user FCM token...');
    const user = await databases.getDocument(
      databaseId,
      'user', // Collection ID
      userId
    );

    if (!user.fcmToken) {
      error('❌ User has no FCM token');
      return res.json({
        success: false,
        error: 'User has not registered for push notifications',
      }, 400);
    }

    log(`✅ FCM Token found: ${user.fcmToken.substring(0, 20)}...`);

    // 2. Send push notification via Expo Push API
    log('🚀 Sending push notification via Expo...');
    const pushResponse = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: user.fcmToken,
        sound: 'default',
        title: title,
        body: body,
        data: data || {},
        priority: 'high',
        channelId: 'default',
      }),
    });

    if (!pushResponse.ok) {
      throw new Error(`Expo Push API error: ${pushResponse.statusText}`);
    }

    const pushResult = await pushResponse.json();
    log('✅ Notification sent successfully:', JSON.stringify(pushResult));

    // 3. Save notification to database
    log('💾 Saving notification to database...');
    await databases.createDocument(
      databaseId,
      'notifications', // Collection ID
      'unique()',
      {
        userId: userId,
        type: data?.type || 'order_update',
        title: title,
        body: body,
        data: JSON.stringify(data || {}),
        status: 'sent',
        channel: 'push',
        sentAt: new Date().toISOString(),
      }
    );

    log('✅ Notification saved to database');

    // Return success response
    return res.json({
      success: true,
      message: 'Notification sent successfully',
      data: {
        pushResult,
        userId,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (err) {
    error('❌ Error sending notification:', err);
    return res.json({
      success: false,
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    }, 500);
  }
};
