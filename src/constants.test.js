import { describe, it, expect } from 'vitest';
import { SERVICE_TYPES, DEPOSIT_PERCENTAGE, PRICES } from './constants';

describe('Pricing and Deposit Logic', () => {
    it('should have correct MXN prices for services', () => {
        expect(PRICES['Manicure']).toBe(250);
        expect(PRICES['Pedicure']).toBe(350);
        expect(PRICES['Uñas Acrílicas']).toBe(550);
        expect(PRICES['Gel']).toBe(300);
        expect(PRICES['Mani + Pedi']).toBe(500);
        expect(PRICES['Relleno']).toBe(400);
        expect(PRICES['Remoción']).toBe(150);
    });

    it('should calculate 20% deposit correctly', () => {
        // Manicure: 200 * 0.2 = 50
        const manicurePrice = PRICES['Manicure'];
        const deposit = Math.round(manicurePrice * DEPOSIT_PERCENTAGE);
        expect(deposit).toBe(50);

        // Uñas Acrílicas: 550 * 0.2 = 110
        const acrylicPrice = PRICES['Uñas Acrílicas'];
        const acrylicDeposit = Math.round(acrylicPrice * DEPOSIT_PERCENTAGE);
        expect(acrylicDeposit).toBe(110);
    });

    it('should have name and id mappings in PRICES', () => {
        expect(PRICES['manicure']).toBe(250);
        expect(PRICES['Manicure']).toBe(250);
    });
});
