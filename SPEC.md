# Nail Salon Appointment System - Specification

## Project Overview
- **Project Name**: Cafe Encanta Nails Appointment System
- **Type**: Full-stack web application (React + Netlify Functions + MongoDB)
- **Core Functionality**: WhatsApp-integrated appointment booking system for nail salon with payment processing
- **Target Users**: Nail salon customers and salon admin

## Architecture

### Tech Stack
- **Frontend**: React 18 with Vite (deployable to Netlify)
- **Backend**: Netlify Functions (serverless Node.js)
- **Database**: MongoDB (provided URI)
- **Payments**: Stripe (Apple Pay support)
- **WhatsApp**: wa.me URL links (no API)

### Data Models

#### Customer
```javascript
{
  _id: ObjectId,
  phone: String (unique, indexed),
  name: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Appointment
```javascript
{
  _id: ObjectId,
  customerId: ObjectId (ref: Customer),
  customerPhone: String,
  customerName: String,
  appointmentDate: Date,
  serviceType: String (manicure, pedicure, nails, etc.),
  status: String (waitlist, confirmed, completed, cancelled),
  paymentStatus: String (none, partial, paid, pending_payment),
  paymentType: String (min_deposit, full, waitlist),
  amount: Number,
  paidAmount: Number,
  stripePaymentIntentId: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Configuration (Environment Variables)
```
MONGODB_URI=mongodb+srv://cafeencanta_db_user:zEy8snY3oKtiRKBc@cluster0.ucfamfc.mongodb.net/?appName=Cluster0
STRIPE_PUBLISHABLE_KEY=pk_test_51SzVgOGlzdFcDvpPjje6hxQJJbxQpB1oInXAu3bO1WZX3RuQu25GIBxxgpRlCjdkrS6ICnzwE4kmFFExPlbjCbY700V8NxWVW5
STRIPE_SECRET_KEY=sk_test_xxx
ADMIN_PASSWORD=admin123
NETLIFY_SITE_URL=https://your-site.netlify.app (to be configured)
```

## User Flows

### Customer Flow
1. **First Visit**: Register with phone number (one-time)
2. **Login**: Enter phone number (passwordless)
3. **Book Appointment**: Select date, service type
4. **Payment Option**:
   - Pay minimum deposit (e.g., $10)
   - Pay full amount
   - Join waitlist (no payment)
5. **View Appointments**: See all bookings
6. **Cancel**: Cancel upcoming appointments
7. **Post-Service Payment**: Pay remaining balance via Apple Pay/Stripe after service

### Admin Flow
1. **Login**: Enter admin password
2. **Generate WhatsApp Links**: Create shareable booking links for customers
3. **View All Appointments**: See waitlist, confirmed, completed
4. **Manage Appointments**: Confirm, reschedule, mark complete
5. **Send WhatsApp**: Click to open WhatsApp with pre-filled message

## API Endpoints (Netlify Functions)

### Customer Endpoints
- `POST /api/customers/register` - Register new customer
- `POST /api/customers/login` - Login with phone
- `GET /api/customers/:phone` - Get customer by phone

### Appointment Endpoints
- `POST /api/appointments` - Create appointment
- `GET /api/appointments` - List all (admin) or customer appointments
- `GET /api/appointments/:id` - Get single appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Payment Endpoints
- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/payments/confirm` - Confirm payment

### Admin Endpoints
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/links` - Generate shareable customer links

## WhatsApp Integration

### Link Format
```
https://wa.me/[PHONE]?text=[ENCODED_MESSAGE]
```

### Message Templates
- **Booking Confirmation**: "Your appointment is confirmed for [DATE] at [TIME]"
- **Appointment Reminder**: "Reminder: Your appointment is tomorrow at [TIME]"
- **Payment Request**: "Your nails are ready! Please complete your payment: [PAYMENT_LINK]"

## UI Components

### Customer Portal
1. **Login/Register Page**: Phone number input
2. **Dashboard**: List of appointments with status
3. **Booking Form**: Date picker, service selection, payment option
4. **Payment Modal**: Stripe Apple Pay integration

### Admin Portal
1. **Login Page**: Password input
2. **Dashboard**: All appointments with filters (waitlist, confirmed, completed)
3. **Link Generator**: Create WhatsApp links for new customers
4. **Appointment Detail**: View and manage single appointment

## Acceptance Criteria

### Customer
- [ ] Can register with phone number
- [ ] Can login with phone (no password)
- [ ] Can book appointment with date selection
- [ ] Can choose payment option (deposit/full/waitlist)
- [ ] Can view all appointments
- [ ] Can cancel appointments
- [ ] Can pay via Apple Pay/Stripe after service

### Admin
- [ ] Can login with password
- [ ] Can see all appointments
- [ ] Can filter by status (waitlist/confirmed/completed)
- [ ] Can generate WhatsApp links for customers
- [ ] Can confirm/manage appointments
- [ ] Can send WhatsApp messages via wa.me links

### Technical
- [ ] Deploys successfully to Netlify
- [ ] Connects to MongoDB
- [ ] Stripe payments work in test mode
- [ ] WhatsApp links open correctly
- [ ] Responsive on mobile devices
