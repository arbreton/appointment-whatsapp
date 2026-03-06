import { describe, it, expect, vi, beforeEach } from 'vitest';

// Setting this before imports
process.env.STRIPE_SECRET_KEY = 'sk_test_mock';

// Define mocks that need to be hoisted
const mocks = vi.hoisted(() => {
    return {
        mockInsertOne: vi.fn(),
        mockUpdateOne: vi.fn(),
        mockFindOne: vi.fn(),
        mockStripeRetrieve: vi.fn(),
    };
});

// Mock DB module - must be hoisted
vi.mock('../../netlify/functions/db.js', () => ({
    connectToDatabase: vi.fn(async () => ({
        db: vi.fn(() => ({
            collection: vi.fn(() => ({
                insertOne: mocks.mockInsertOne,
                updateOne: mocks.mockUpdateOne,
                findOne: mocks.mockFindOne,
            })),
        })),
    })),
    MONGODB_DB: 'test_db',
    normalizeMongoDoc: (doc) => doc,
    ObjectId: class {
        constructor(id) { this.id = id; }
        toString() { return this.id; }
        static isValid(id) { return id && id.length === 24; }
    }
}));

// Mock Stripe - must be hoisted
vi.mock('stripe', () => {
    const Stripe = vi.fn().mockImplementation(() => ({
        checkout: {
            sessions: {
                retrieve: mocks.mockStripeRetrieve
            }
        }
    }));
    return { default: Stripe };
});

// Now we can import the handler
import { handler } from '../../netlify/functions/verify-payment.js';

describe('verify-payment handler', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should create a new appointment if appointmentId is NEW', async () => {
        const mockSession = {
            payment_status: 'paid',
            amount_total: 5000,
            metadata: {
                appointmentId: 'NEW',
                customerName: 'Ari',
                customerPhone: '6641234567',
                serviceType: 'Manicure',
                amount: '250',
                appointmentDate: '2026-03-12T10:00:00Z'
            }
        };
        mocks.mockStripeRetrieve.mockResolvedValue(mockSession);
        mocks.mockInsertOne.mockResolvedValue({ insertedId: 'new_id' });

        const event = {
            httpMethod: 'POST',
            body: JSON.stringify({ sessionId: 'sess_123' })
        };

        const response = await handler(event);
        const body = JSON.parse(response.body);

        expect(response.statusCode).toBe(200);
        expect(body.customerName).toBe('Ari');
        expect(body.paidAmount).toBe(50);
        expect(mocks.mockInsertOne).toHaveBeenCalled();
    });

    it('should update an existing appointment if appointmentId is provided', async () => {
        const mockSession = {
            payment_status: 'paid',
            amount_total: 20000,
            metadata: {
                appointmentId: 'existing_id'
            }
        };
        mocks.mockStripeRetrieve.mockResolvedValue(mockSession);
        mocks.mockFindOne.mockResolvedValue({
            _id: 'existing_id',
            amount: 250,
            paidAmount: 50,
            paymentStatus: 'partial'
        });

        const event = {
            httpMethod: 'POST',
            body: JSON.stringify({ sessionId: 'sess_123' })
        };

        const response = await handler(event);
        expect(response.statusCode).toBe(200);
        expect(mocks.mockUpdateOne).toHaveBeenCalled();

        const updateCall = mocks.mockUpdateOne.mock.calls[0][1].$set;
        expect(updateCall.paidAmount).toBe(250);
        expect(updateCall.paymentStatus).toBe('paid');
    });

    it('should return error if payment is not completed', async () => {
        mocks.mockStripeRetrieve.mockResolvedValue({ payment_status: 'unpaid' });

        const event = {
            httpMethod: 'POST',
            body: JSON.stringify({ sessionId: 'sess_123' })
        };

        const response = await handler(event);
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).error).toBe('Payment not completed');
    });
});
