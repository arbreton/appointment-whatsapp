// API for Cafe Encenta Nails
// Uses Netlify Functions to connect to MongoDB
// Falls back to localStorage only if MongoDB is unavailable (development only)

const FUNCTION_BASE = ''; // Empty means same origin, Netlify handles /api redirects

// For local development fallback
const isDev = import.meta.env.DEV;

// Local storage keys (fallback only)
const CUSTOMERS_KEY = 'cafe_encanta_customers';
const APPOINTMENTS_KEY = 'cafe_encanta_appointments';

// Helper to get data from localStorage
function getLocalData(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

// Helper to save data to localStorage
function saveLocalData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Generate 4-digit PIN
function generatePIN() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// API call helper - always tries MongoDB first, falls back to localStorage in dev
async function apiCall(endpoint, method = 'GET', body = null) {
  const url = `${FUNCTION_BASE}/.netlify/functions/${endpoint}`;

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    // If it's a network error and we're in dev, fall back to localStorage
    if (isDev && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
      console.warn(`MongoDB unavailable, using localStorage fallback for ${endpoint}`);
      throw new Error('MONGODB_FALLBACK');
    }
    throw error;
  }
}

// Customer API
export const customerApi = {
  // Admin creates a customer with PIN
  async create(phone, name) {
    try {
      return await apiCall('customers', 'POST', { phone, name });
    } catch (error) {
      if (error.message === 'MONGODB_FALLBACK') {
        const customers = getLocalData(CUSTOMERS_KEY);
        const existing = customers.find(c => c.phone === phone);
        if (existing) {
          existing.pin = generatePIN();
          existing.name = name;
          saveLocalData(CUSTOMERS_KEY, customers);
          return existing;
        }
        const newCustomer = {
          _id: generateId(),
          phone,
          name,
          pin: generatePIN(),
          createdAt: new Date().toISOString()
        };
        customers.push(newCustomer);
        saveLocalData(CUSTOMERS_KEY, customers);
        return newCustomer;
      }
      throw error;
    }
  },

  // Get customer by phone
  async getByPhone(phone) {
    try {
      return await apiCall(`customers?phone=${encodeURIComponent(phone)}`);
    } catch (error) {
      if (error.message === 'MONGODB_FALLBACK') {
        const customers = getLocalData(CUSTOMERS_KEY);
        return customers.find(c => c.phone === phone) || null;
      }
      throw error;
    }
  },

  // Customer login with phone + PIN
  async login(phone, pin = null) {
    try {
      const customer = await apiCall(`customers?phone=${encodeURIComponent(phone)}`);
      if (!customer) {
        throw new Error('Cliente no encontrado');
      }
      if (pin && customer.pin !== pin) {
        throw new Error('PIN incorrecto');
      }
      return customer;
    } catch (error) {
      if (error.message === 'MONGODB_FALLBACK') {
        const customers = getLocalData(CUSTOMERS_KEY);
        const customer = customers.find(c => c.phone === phone);
        if (!customer) {
          throw new Error('Cliente no encontrado');
        }
        if (pin && customer.pin !== pin) {
          throw new Error('PIN incorrecto');
        }
        return customer;
      }
      throw error;
    }
  },

  // Auto-login from link (without PIN)
  async autoLogin(phone) {
    return this.login(phone);
  },

  // Update PIN
  async updatePIN(phone, newPIN) {
    try {
      return await apiCall('customers', 'PUT', { phone, pin: newPIN });
    } catch (error) {
      if (error.message === 'MONGODB_FALLBACK') {
        const customers = getLocalData(CUSTOMERS_KEY);
        const customer = customers.find(c => c.phone === phone);
        if (!customer) {
          throw new Error('Cliente no encontrado');
        }
        customer.pin = newPIN;
        saveLocalData(CUSTOMERS_KEY, customers);
        return customer;
      }
      throw error;
    }
  },

  // Get all customers (admin only)
  async getAll() {
    try {
      return await apiCall('customers');
    } catch (error) {
      if (error.message === 'MONGODB_FALLBACK') {
        return getLocalData(CUSTOMERS_KEY);
      }
      throw error;
    }
  },

  // Update customer name (admin)
  async updateName(phone, name) {
    try {
      return await apiCall('customers', 'PUT', { phone, name });
    } catch (error) {
      if (error.message === 'MONGODB_FALLBACK') {
        const customers = getLocalData(CUSTOMERS_KEY);
        const customer = customers.find(c => c.phone === phone);
        if (customer) {
          customer.name = name;
          saveLocalData(CUSTOMERS_KEY, customers);
          return customer;
        }
        throw new Error('Cliente no encontrado');
      }
      throw error;
    }
  }
};

// Appointment API
export const appointmentApi = {
  // Create new appointment
  async create(data) {
    try {
      return await apiCall('appointments', 'POST', data);
    } catch (error) {
      if (error.message === 'MONGODB_FALLBACK') {
        const appointments = getLocalData(APPOINTMENTS_KEY);
        const newAppointment = {
          _id: generateId(),
          ...data,
          createdAt: new Date().toISOString()
        };
        appointments.push(newAppointment);
        saveLocalData(APPOINTMENTS_KEY, appointments);
        return newAppointment;
      }
      throw error;
    }
  },

  // Create appointment from admin
  async createFromAdmin(phone, name, service, appointmentDate, amount) {
    return this.create({
      customerPhone: phone,
      customerName: name,
      serviceType: service,
      appointmentDate,
      amount,
      paidAmount: 0,
      paymentStatus: 'none',
      status: 'confirmed',
      paymentType: 'waitlist'
    });
  },

  // Get appointment by ID
  async getById(id) {
    try {
      return await apiCall(`appointments?id=${encodeURIComponent(id)}`);
    } catch (error) {
      if (error.message === 'MONGODB_FALLBACK') {
        const appointments = getLocalData(APPOINTMENTS_KEY);
        return appointments.find(a => a._id === id) || null;
      }
      throw error;
    }
  },

  // Get appointments by phone
  async getByPhone(phone) {
    try {
      return await apiCall(`appointments?phone=${encodeURIComponent(phone)}`);
    } catch (error) {
      if (error.message === 'MONGODB_FALLBACK') {
        const appointments = getLocalData(APPOINTMENTS_KEY);
        return appointments.filter(a => a.customerPhone === phone);
      }
      throw error;
    }
  },

  // Get all appointments (admin)
  async getAll(status = 'all') {
    try {
      return await apiCall(`appointments${status !== 'all' ? `?status=${status}` : ''}`);
    } catch (error) {
      if (error.message === 'MONGODB_FALLBACK') {
        return getLocalData(APPOINTMENTS_KEY);
      }
      throw error;
    }
  },

  // Get appointments by date (admin)
  async getByDate(date) {
    try {
      return await apiCall(`appointments?date=${encodeURIComponent(date)}`);
    } catch (error) {
      if (error.message === 'MONGODB_FALLBACK') {
        const appointments = getLocalData(APPOINTMENTS_KEY);
        return appointments.filter(a => {
          const aptDate = new Date(a.appointmentDate).toISOString().split('T')[0];
          return aptDate === date;
        });
      }
      throw error;
    }
  },

  // Update appointment
  async update(id, data) {
    try {
      return await apiCall('appointments', 'PUT', { id, ...data });
    } catch (error) {
      if (error.message === 'MONGODB_FALLBACK') {
        const appointments = getLocalData(APPOINTMENTS_KEY);
        const index = appointments.findIndex(a => a._id === id);
        if (index !== -1) {
          appointments[index] = { ...appointments[index], ...data };
          saveLocalData(APPOINTMENTS_KEY, appointments);
          return appointments[index];
        }
        throw new Error('Cita no encontrada');
      }
      throw error;
    }
  },

  // Cancel appointment
  async cancel(id) {
    return this.update(id, { status: 'cancelled' });
  },

  // Approve appointment
  async approve(id) {
    return this.update(id, { status: 'confirmed' });
  },

  // Reject appointment
  async reject(id) {
    return this.update(id, { status: 'rejected' });
  },

  // Mark as completed
  async complete(id) {
    return this.update(id, { status: 'completed' });
  }
};

// Payment API
export const paymentApi = {
  // Create Stripe checkout session
  async createCheckoutSession(data) {
    return apiCall('payment', 'POST', data);
  }
};
