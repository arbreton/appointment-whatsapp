import Stripe from 'stripe';
import { connectToDatabase, MONGODB_DB, normalizeMongoDoc, ObjectId } from './db.js';

export const handler = async (event, context) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { httpMethod, body } = event;

    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const { sessionId } = JSON.parse(body);
        if (!sessionId) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Session ID required' }) };
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status !== 'paid') {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Payment not completed' }) };
        }

        const { appointmentId, ...appointmentData } = session.metadata;
        const client = await connectToDatabase();
        const db = client.db(MONGODB_DB);
        const appointmentsCollection = db.collection('appointments');

        let appointment;

        if (appointmentId === 'NEW') {
            // Create new appointment
            const newDoc = {
                ...appointmentData,
                appointmentDate: appointmentData.appointmentDate ? new Date(appointmentData.appointmentDate) : new Date(),
                amount: parseFloat(appointmentData.amount),
                paidAmount: parseFloat(session.amount_total) / 100,
                paymentStatus: parseFloat(session.amount_total) / 100 >= parseFloat(appointmentData.amount) ? 'paid' : 'partial',
                paymentType: 'stripe',
                status: 'confirmed',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const result = await appointmentsCollection.insertOne(newDoc);
            appointment = { _id: result.insertedId, ...newDoc };
        } else {
            // Update existing appointment
            const paidAmountArg = parseFloat(session.amount_total) / 100;
            const currentApt = await appointmentsCollection.findOne({ _id: new ObjectId(appointmentId) });

            if (!currentApt) {
                throw new Error('Cita no encontrada');
            }

            const totalPaid = (currentApt.paidAmount || 0) + paidAmountArg;
            const isFullyPaid = totalPaid >= currentApt.amount;

            await appointmentsCollection.updateOne(
                { _id: new ObjectId(appointmentId) },
                {
                    $set: {
                        paymentStatus: isFullyPaid ? 'paid' : 'partial',
                        paidAmount: totalPaid,
                        paymentType: 'stripe',
                        updatedAt: new Date()
                    }
                }
            );

            appointment = { ...currentApt, paymentStatus: isFullyPaid ? 'paid' : 'partial', paidAmount: totalPaid, paymentType: 'stripe' };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(normalizeMongoDoc(appointment))
        };

    } catch (error) {
        console.error('Error verifying payment:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};
