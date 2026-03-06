import { connectToDatabase, MONGODB_DB, normalizeMongoDoc, ObjectId } from './db.js';

// Helper to normalize array of MongoDB documents
const normalizeMongoDocs = (docs) => {
  if (!Array.isArray(docs)) return normalizeMongoDoc(docs);
  return docs.map(normalizeMongoDoc);
};

export const handler = async (event, context) => {
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
      const { phone, id, date } = queryStringParameters || {};

      if (id) {
        try {
          if (id.length === 24 && ObjectId.isValid(id)) {
            const appointment = await appointments.findOne({ _id: new ObjectId(id) });
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify(normalizeMongoDoc(appointment))
            };
          } else {
            const appointment = await appointments.findOne({ _id: id });
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify(normalizeMongoDoc(appointment))
            };
          }
        } catch (err) {
          console.error('Error finding appointment by ID:', err);
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Cita no encontrada' })
          };
        }
      }

      if (phone) {
        const customerAppointments = await appointments.find({ customerPhone: phone }).toArray();
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(normalizeMongoDocs(customerAppointments))
        };
      }

      if (date) {
        // Expand range to +/- 1 day to catch timezone-shifted appointments
        const requestedDate = new Date(date);

        const startOfDay = new Date(requestedDate);
        startOfDay.setDate(startOfDay.getDate() - 1);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(requestedDate);
        endOfDay.setDate(endOfDay.getDate() + 1);
        endOfDay.setHours(23, 59, 59, 999);

        const dayAppointments = await appointments.find({
          appointmentDate: { $gte: startOfDay, $lte: endOfDay },
          status: { $ne: 'cancelled' }
        }).toArray();

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(normalizeMongoDocs(dayAppointments))
        };
      }

      const allAppointments = await appointments.find({}).toArray();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(normalizeMongoDocs(allAppointments))
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
        body: JSON.stringify(normalizeMongoDoc(newAppointment))
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

      if (data.status) updateData.status = data.status;
      if (data.paymentStatus) updateData.paymentStatus = data.paymentStatus;
      if (data.paidAmount !== undefined) updateData.paidAmount = data.paidAmount;
      if (data.customerName) updateData.customerName = data.customerName;
      if (data.appointmentDate) updateData.appointmentDate = new Date(data.appointmentDate);
      if (data.serviceType) updateData.serviceType = data.serviceType;
      if (data.notes !== undefined) updateData.notes = data.notes;

      let objectId;
      try {
        objectId = id.length === 24 ? new ObjectId(id) : id;
      } catch (err) {
        objectId = id;
      }

      await appointments.updateOne(
        { _id: objectId },
        { $set: updateData }
      );

      const updated = await appointments.findOne({ _id: objectId });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(normalizeMongoDoc(updated))
      };
    }

    if (httpMethod === 'DELETE') {
      const { id } = queryStringParameters || {};

      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Appointment ID required' })
        };
      }

      let deleteId;
      try {
        deleteId = id.length === 24 ? new ObjectId(id) : id;
      } catch (err) {
        deleteId = id;
      }

      await appointments.deleteOne({ _id: deleteId });

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
