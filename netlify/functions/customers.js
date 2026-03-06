const { connectToDatabase, MONGODB_DB } = require('./db');

// Helper to convert MongoDB extended JSON to regular JS objects
const normalizeMongoDoc = (doc) => {
  if (!doc) return null;
  const normalized = {};
  for (const key in doc) {
    if (key === '_id' && doc[key] && doc[key].$oid) {
      normalized[key] = doc[key].$oid;
    } else if (key === 'createdAt' && doc[key] && doc[key].$date) {
      normalized[key] = doc[key].$date;
    } else if (key === 'updatedAt' && doc[key] && doc[key].$date) {
      normalized[key] = doc[key].$date;
    } else if (typeof doc[key] === 'object' && doc[key] !== null) {
      normalized[key] = normalizeMongoDoc(doc[key]);
    } else {
      normalized[key] = doc[key];
    }
  }
  return normalized;
};

// Helper to normalize array of MongoDB documents
const normalizeMongoDocs = (docs) => {
  if (!Array.isArray(docs)) return normalizeMongoDoc(docs);
  return docs.map(normalizeMongoDoc);
};

exports.handler = async (event, context) => {
  const { httpMethod, queryStringParameters, body } = event;
  
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  
  if (httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  
  try {
    const client = await connectToDatabase();
    const db = client.db(MONGODB_DB);
    const customers = db.collection('customers');
    
    if (httpMethod === 'GET') {
      const { phone } = queryStringParameters;
      
      if (phone) {
        const customer = await customers.findOne({ phone });
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(normalizeMongoDoc(customer))
        };
      }
      
      const allCustomers = await customers.find({}).toArray();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(normalizeMongoDocs(allCustomers))
      };
    }
    
    if (httpMethod === 'POST') {
      const data = JSON.parse(body);
      const { phone, name, pin } = data;
      
      // Check if customer already exists
      const existing = await customers.findOne({ phone });
      
      if (existing) {
        // Update existing customer
        await customers.updateOne(
          { phone },
          { $set: { name, pin, updatedAt: new Date() } }
        );
        const updated = await customers.findOne({ phone });
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(normalizeMongoDoc(updated))
        };
      }
      
      // Create new customer
      const newCustomer = {
        phone,
        name,
        pin: pin || Math.floor(1000 + Math.random() * 9000).toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await customers.insertOne(newCustomer);
      newCustomer._id = result.insertedId;
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(normalizeMongoDoc(newCustomer))
      };
    }
    
    if (httpMethod === 'PUT') {
      const data = JSON.parse(body);
      const { phone, pin, name } = data;
      
      const updateData = { updatedAt: new Date() };
      if (pin) updateData.pin = pin;
      if (name) updateData.name = name;
      
      await customers.updateOne(
        { phone },
        { $set: updateData }
      );
      
      const updated = await customers.findOne({ phone });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(normalizeMongoDoc(updated))
      };
    }
    
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
    
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
