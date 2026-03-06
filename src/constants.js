export const CURRENCY = 'mxn';
export const CURRENCY_SYMBOL = '$';

export const DEPOSIT_PERCENTAGE = 0.2;

export const SERVICE_TYPES = [
    { id: 'manicure', name: 'Manicure', price: 250 },
    { id: 'pedicure', name: 'Pedicure', price: 350 },
    { id: 'nails', name: 'Uñas Acrílicas', price: 550 },
    { id: 'gel', name: 'Gel', price: 300 },
    { id: 'manicure_pedicure', name: 'Mani + Pedi', price: 500 },
    { id: 'fill_in', name: 'Relleno', price: 400 },
    { id: 'removal', name: 'Remoción', price: 150 }
];

export const PRICES = SERVICE_TYPES.reduce((acc, service) => {
    acc[service.name] = service.price;
    acc[service.id] = service.price;
    return acc;
}, {});

export const APPOINTMENT_DURATION_MINS = 90;

export const TIME_SLOTS = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00'
];
