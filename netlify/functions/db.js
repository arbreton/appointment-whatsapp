import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || '';
const MONGODB_DB = process.env.MONGODB_DB || 'cafe_encanta_nails';

let cachedClient = null;

export async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  try {
    console.log('Connecting to MongoDB...');
    const client = new MongoClient(MONGODB_URI);

    await client.connect();
    console.log('Connected to MongoDB');
    cachedClient = client;
    return client;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Helper to convert MongoDB documents (with ObjectId, $date, etc.) to plain JS objects
export const normalizeMongoDoc = (doc) => {
  if (!doc) return null;

  // Create a deep copy to avoid mutating the original
  const normalized = Array.isArray(doc) ? [] : {};

  for (const key in doc) {
    const value = doc[key];

    // Handle MongoDB ObjectId instance
    if (value && (value instanceof ObjectId || (value._bsontype === 'ObjectID'))) {
      normalized[key] = value.toString();
    }
    // Handle MongoDB Extended JSON $oid
    else if (value && value.$oid) {
      normalized[key] = value.$oid;
    }
    // Handle MongoDB Extended JSON $date (can be string or number)
    else if (value && value.$date) {
      normalized[key] = typeof value.$date === 'object' && value.$date.$numberLong
        ? new Date(parseInt(value.$date.$numberLong)).toISOString()
        : new Date(value.$date).toISOString();
    }
    // Handle native JS Date objects
    else if (value instanceof Date) {
      normalized[key] = value.toISOString();
    }
    // Handle nested objects and arrays recursively
    else if (value !== null && typeof value === 'object') {
      normalized[key] = normalizeMongoDoc(value);
    }
    // Handle primitive values
    else {
      normalized[key] = value;
    }
  }

  return normalized;
};

export { MONGODB_DB, ObjectId };
