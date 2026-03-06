const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  const { httpMethod, body } = event;

  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const data = JSON.parse(body);
    const { appointmentId, amount, customerEmail, customerName, serviceType } = data;

    // Get site URL dynamically or from environment
    const protocol = event.headers['x-forwarded-proto'] || 'https';
    const host = event.headers.host;
    const siteUrl = process.env.SITE_URL || `${protocol}://${host}`;

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product_data: {
              name: `Cita de Uñas - ${serviceType}`,
              description: `Cita para ${customerName}`
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${siteUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&appointment_id=${String(appointmentId)}&amount=${amount}`,
      cancel_url: `${siteUrl}/appointment/${String(appointmentId)}`,
      metadata: {
        appointmentId: String(appointmentId),
      },
      // Enable Wallets like Apple Pay automatically
      payment_intent_data: {
        metadata: {
          appointmentId: String(appointmentId),
        }
      }
    });

    console.log('Stripe session created:', session.id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ sessionId: session.id, url: session.url })
    };

  } catch (error) {
    console.error('Error creating payment session:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
