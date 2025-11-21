/**
 * MongoDB Connection Test Script
 * 
 * Tests MongoDB connection and basic operations
 * Run: pnpm test:mongodb
 */

import { connectMongoDB, closeMongoDB, checkMongoDBHealth } from '../src/config/mongodb';
import { logger } from '../src/utils/logger';

async function testConnection() {
  console.log('🔍 Testing MongoDB connection...\n');
  
  try {
    // Test 1: Connection
    console.log('Test 1: Connecting to MongoDB...');
    const db = await connectMongoDB();
    console.log('✅ Connection successful\n');
    
    // Test 2: Health check
    console.log('Test 2: Running health check...');
    const isHealthy = await checkMongoDBHealth();
    if (isHealthy) {
      console.log('✅ Health check: PASS\n');
    } else {
      console.log('❌ Health check: FAIL\n');
      throw new Error('Health check failed');
    }
    
    // Test 3: List collections
    console.log('Test 3: Listing collections...');
    const collections = await db.listCollections().toArray();
    console.log(`✅ Found ${collections.length} collections:`);
    collections.forEach(col => console.log(`   - ${col.name}`));
    console.log('');
    
    // Test 4: Basic operation
    console.log('Test 4: Testing basic operation...');
    const testCollection = db.collection('_connection_test');
    const testDoc = { 
      test: true, 
      timestamp: new Date(),
      message: 'Connection test successful'
    };
    await testCollection.insertOne(testDoc);
    const found = await testCollection.findOne({ test: true });
    await testCollection.deleteOne({ test: true });
    
    if (found) {
      console.log('✅ Basic operations: PASS\n');
    } else {
      throw new Error('Basic operation failed');
    }
    
    // Cleanup
    await closeMongoDB();
    
    console.log('═══════════════════════════════════════');
    console.log('✅ All tests passed successfully!');
    console.log('═══════════════════════════════════════\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n═══════════════════════════════════════');
    console.error('❌ Connection test failed!');
    console.error('═══════════════════════════════════════');
    
    if (error instanceof Error) {
      console.error('\nError:', error.message);
      if (error.stack) {
        console.error('\nStack trace:');
        console.error(error.stack);
      }
    } else {
      console.error('\nError:', error);
    }
    
    console.error('\n📋 Troubleshooting steps:');
    console.error('1. Check MONGODB_URI in .env file');
    console.error('2. Verify MongoDB Atlas Network Access (IP whitelist)');
    console.error('3. Verify database user credentials');
    console.error('4. Check MongoDB Atlas cluster status');
    console.error('5. Review: MONGODB_SSL_FIX.md\n');
    
    process.exit(1);
  }
}

testConnection();
