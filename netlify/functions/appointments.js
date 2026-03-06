const { connectToDatabase, MONGODB_DB } = require('./db');

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
    const appointments = db.collection('appointments');
    
    if (httpMethod === 'GET') {
      const { phone, id, date } = queryStringParameters;
      
      if (id) {
        const appointment = await appointments.findOne({ _id: require('mongodb').ObjectId(id) });
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(appointment)
        };
      }
      
      if (phone) {
        const customerAppointments = await appointments.find({ customerPhone: phone }).toArray();
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(customerAppointments)
        };
      }
      
      if (date) {
        // Get appointments for a specific date
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        const dayAppointments = await appointments.find({
          appointmentDate: { $gte: startOfDay, $lte: endOfDay },
          status: { $ne: 'cancelled' }
        }).toArray();
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(dayAppointments)
        };
      }
      
      const allAppointments = await appointments.find({}).toArray();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(allAppointments)
      };
    }
    
    if (httpMethod === 'POST') {
      const data = JSON.parse(body);
      
      const newAppointment = {
        customerPhone: data.customerPhone,
        customerName: data.customerName,
        appointmentDate: new Date(data.appointmentDate),
        serviceType: data.serviceType,
        paymentType: data.paymentType || 'waitlist',
        amount: data.amount || 0,
        paidAmount: data.paidAmount || 0,
        paymentStatus: data.paymentStatus || 'none',
        status: data.status || 'waitlist',
        notes: data.notes || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await appointments.insertOne(newAppointment);
      newAppointment._id = result.insertedId;
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(newAppointment)
      };
    }
    
    if (httpMethod === 'PUT') {
      const data = JSON.parse(body);
      const { id } = data;
      
      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Appointment ID required' })
        };
      }
      
      const updateData = { updatedAt: new Date() };
      
      // Only update allowed fields
      if (data.status) updateData.status = data.status;
      if (data.paymentStatus) updateData.paymentStatus = data.paymentStatus;
      if (data.paidAmount !== undefined) updateData.paidAmount = data.paidAmount;
      if (data.customerName) updateData.customerName = data.customerName;
      if (data.appointmentDate) updateData.appointmentDate = new Date(data.appointmentDate);
      if (data.serviceType) updateData.serviceType = data.serviceType;
      if (data.notes !== undefined) updateData.notes = data.notes;
      
      await appointments.updateOne(
        { _id: require('mongodb').ObjectId(id) },
        { $set: updateData }
      );
      
      const updated = await appointments.findOne({ _id: require('mongodb').ObjectId(id) });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(updated)
      };
    }
    
    if (httpMethod === 'DELETE') {
      const { id } = queryStringParameters;
      
      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Appointment ID required' })
        };
      }
      
      await appointments.deleteOne({ _id: require('mongodb').ObjectId(id) });
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
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
