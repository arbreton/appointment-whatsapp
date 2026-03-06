export const CURRENCY = 'mxn';
export const CURRENCY_SYMBOL = '$';

export const DEPOSIT_AMOUNT = 200;

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
