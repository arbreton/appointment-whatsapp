import { describe, it, expect } from 'vitest';
import { normalizeMongoDoc, ObjectId } from '../../netlify/functions/db.js';

describe('normalizeMongoDoc', () => {
    it('should return null if input is null', () => {
        expect(normalizeMongoDoc(null)).toBeNull();
    });

    it('should convert ObjectId to string', () => {
        const id = new ObjectId();
        const doc = { _id: id, name: 'Test' };
        const normalized = normalizeMongoDoc(doc);
        expect(normalized._id).toBe(id.toString());
        expect(typeof normalized._id).toBe('string');
    });

    it('should handle $oid format', () => {
        const doc = { _id: { $oid: '507f1f77bcf86cd799439011' } };
        const normalized = normalizeMongoDoc(doc);
        expect(normalized._id).toBe('507f1f77bcf86cd799439011');
    });

    it('should convert $date to ISO string', () => {
        const dateStr = '2023-01-01T10:00:00.000Z';
        const doc = { appointmentDate: { $date: dateStr } };
        const normalized = normalizeMongoDoc(doc);
        expect(normalized.appointmentDate).toBe(dateStr);
    });

    it('should handle $date with $numberLong', () => {
        const timestamp = 1672567200000; // 2023-01-01T10:00:00.000Z
        const doc = { createdAt: { $date: { $numberLong: timestamp.toString() } } };
        const normalized = normalizeMongoDoc(doc);
        expect(normalized.createdAt).toBe('2023-01-01T10:00:00.000Z');
    });

    it('should convert native Date objects to ISO string', () => {
        const date = new Date('2023-05-05T12:00:00Z');
        const doc = { dateField: date };
        const normalized = normalizeMongoDoc(doc);
        expect(normalized.dateField).toBe(date.toISOString());
    });

    it('should handle nested objects and arrays', () => {
        const id = new ObjectId();
        const doc = {
            items: [
                { id: id, val: 1 },
                { id: { $oid: '507f1f77bcf86cd799439011' }, val: 2 }
            ],
            meta: {
                created: { $date: '2023-01-01T00:00:00Z' }
            }
        };
        const normalized = normalizeMongoDoc(doc);
        expect(normalized.items[0].id).toBe(id.toString());
        expect(normalized.items[1].id).toBe('507f1f77bcf86cd799439011');
        expect(normalized.meta.created).toBe('2023-01-01T00:00:00.000Z');
    });
});
