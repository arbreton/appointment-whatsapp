const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://cafeencanta_db_user:zEy8snY3oKtiRKBc@cluster0.ucfamfc.mongodb.net/?appName=Cluster0';
const MONGODB_DB = 'cafe_encanta_nails';

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }
  
  const client = new MongoClient(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  await client.connect();
  cachedClient = client;
  return client;
}

module.exports = { connectToDatabase, MONGODB_DB };
