// Test script to verify MongoDB connection
// Run with: node test-mongodb.js

import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://cafeencanta_db_user:zEy8snY3oKtiRKBc@cluster0.ucfamfc.mongodb.net/?appName=Cluster0';

async function testConnection() {
  console.log('Testing MongoDB connection...');
  console.log('URI:', MONGODB_URI.replace(/:([^:@]+)@/, ':****@')); // Hide password
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected successfully!');
    
    // Test database operations
    const db = client.db('cafe_encanta_nails');
    
    // Create collections if they don't exist
    await db.createCollection('customers').catch(() => {});
    await db.createCollection('appointments').catch(() => {});
    
    console.log('✅ Database and collections ready!');
    
    // Test insert
    const testCustomer = {
      phone: '+1234567890',
      name: 'Test User',
      createdAt: new Date()
    };
    
    const result = await db.collection('customers').insertOne(testCustomer);
    console.log('✅ Insert test passed!');
    
    // Clean up test data
    await db.collection('customers').deleteOne({ _id: result.insertedId });
    console.log('✅ Delete test passed!');
    
    console.log('\n🎉 All tests passed! MongoDB is working correctly.');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

testConnection();
