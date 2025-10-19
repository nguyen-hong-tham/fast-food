// Script to link existing menu items to a restaurant
// Run this from restaurant-portal directory: node scripts/link-menu-to-restaurant.js

const sdk = require('node-appwrite');

// Initialize Appwrite Client
const client = new sdk.Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('68c9791a002b85f096b4')
    .setKey('YOUR_API_KEY_HERE'); // Get from Appwrite Console → Settings → API Keys

const databases = new sdk.Databases(client);

const DATABASE_ID = '68da5e73002cb68e70af';
const MENU_COLLECTION_ID = 'menu';

// ⚠️ REPLACE THIS WITH YOUR RESTAURANT DOCUMENT ID
const RESTAURANT_ID = 'PASTE_RESTAURANT_ID_HERE';

async function linkMenuToRestaurant() {
  try {
    console.log('🔍 Fetching all menu items...');
    
    // Get all menu items
    const response = await databases.listDocuments(
      DATABASE_ID,
      MENU_COLLECTION_ID,
      [] // No filters - get all items
    );

    console.log(`📋 Found ${response.documents.length} menu items`);

    if (response.documents.length === 0) {
      console.log('❌ No menu items found!');
      return;
    }

    // Update each menu item with restaurantId
    let updated = 0;
    let skipped = 0;

    for (const item of response.documents) {
      try {
        // Check if already has restaurantId
        if (item.restaurantId) {
          console.log(`⏭️  Skipped: ${item.name} (already linked to ${item.restaurantId})`);
          skipped++;
          continue;
        }

        // Update the document
        await databases.updateDocument(
          DATABASE_ID,
          MENU_COLLECTION_ID,
          item.$id,
          {
            restaurantId: RESTAURANT_ID
          }
        );

        console.log(`✅ Updated: ${item.name} → Restaurant ${RESTAURANT_ID}`);
        updated++;

      } catch (error) {
        console.error(`❌ Failed to update ${item.name}:`, error.message);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Updated: ${updated} items`);
    console.log(`   ⏭️  Skipped: ${skipped} items`);
    console.log(`   📝 Total: ${response.documents.length} items`);
    console.log('\n✨ Done! Your menu items are now linked to the restaurant.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
linkMenuToRestaurant();
