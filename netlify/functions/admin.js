// Server-side admin authentication
const ADMIN_PASSWORD = process.env.VITE_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { password } = JSON.parse(event.body);
    
    if (password === ADMIN_PASSWORD) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, token: 'admin-session-' + Date.now() })
      };
    }
    
    return {
      statusCode: 401,
      body: JSON.stringify({ success: false, error: 'Invalid password' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error' })
    };
  }
};
