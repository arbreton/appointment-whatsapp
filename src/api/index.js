// API for Cafe Encenta Nails
// Uses Netlify Functions to connect to MongoDB
// Falls back to localStorage for local development without Netlify CLI

const FUNCTION_BASE = ''; // Empty means same origin, Netlify handles /api redirects

// For local development, use localhost:9999 (Netlify CLI proxy)
const isDev = import.meta.env.DEV;
const USE_NETLIFY = !isDev; // Only use Netlify functions in production

// Local storage keys
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

// API call helper
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
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

// Customer API - Local Storage fallback for development
export const customerApi = {
  // Admin creates a customer with PIN
  async create(phone, name) {
    if (!USE_NETLIFY) {
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
    
    return apiCall('customers', 'POST', { phone, name });
  },

  // Get customer by phone
  async getByPhone(phone) {
    if (!USE_NETLIFY) {
      const customers = getLocalData(CUSTOMERS_KEY);
      return customers.find(c => c.phone === phone) || null;
    }
    return apiCall(`customers?phone=${encodeURIComponent(phone)}`);
  },

  // Customer login with phone + PIN
  async login(phone, pin = null) {
    if (!USE_NETLIFY) {
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
    
    const customer = await apiCall(`customers?phone=${encodeURIComponent(phone)}`);
    if (!customer) {
      throw new Error('Cliente no encontrado');
    }
    if (pin && customer.pin !== pin) {
      throw new Error('PIN incorrecto');
    }
    return customer;
  },

  // Auto-login from link (without PIN)
  async autoLogin(phone) {
    return this.login(phone);
  },

  // Update PIN
  async updatePIN(phone, newPIN) {
    if (!USE_NETLIFY) {
      const customers = getLocalData(CUSTOMERS_KEY);
      const customer = customers.find(c => c.phone === phone);
      if (!customer) {
        throw new Error('Cliente no encontrado');
      }
      customer.pin = newPIN;
      saveLocalData(CUSTOMERS_KEY, customers);
      return customer;
    }
    
    return apiCall('customers', 'PUT', { phone, pin: newPIN });
  },

  // Get all customers (admin only)
  async getAll() {
    if (!USE_NETLIFY) {
      return getLocalData(CUSTOMERS_KEY);
    }
    return apiCall('customers');
  },

  // Update customer name (admin)
  async updateName(phone, name) {
    if (!USE_NETLIFY) {
      const customers = getLocalData(CUSTOMERS_KEY);
      const customer = customers.find(c => c.phone === phone);
      if (customer) {
        customer.name = name;
        saveLocalData(CUSTOMERS_KEY, customers);
        return customer;
      }
      throw new Error('Cliente no encontrado');
    }
    return apiCall('customers', 'PUT', { phone, name });
  }
};

// Appointment API - Local Storage fallback for development
export const appointmentApi = {
  // Create new appointment
  async create(data) {
    if (!USE_NETLIFY) {
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
    
    return apiCall('appointments', 'POST', data);
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
    if (!USE_NETLIFY) {
      const appointments = getLocalData(APPOINTMENTS_KEY);
      return appointments.find(a => a._id === id) || null;
    }
    return apiCall(`appointments?id=${encodeURIComponent(id)}`);
  },

  // Get appointments by phone
  async getByPhone(phone) {
    if (!USE_NETLIFY) {
      const appointments = getLocalData(APPOINTMENTS_KEY);
      return appointments.filter(a => a.customerPhone === phone);
    }
    return apiCall(`appointments?phone=${encodeURIComponent(phone)}`);
  },

  // Get all appointments (admin)
  async getAll() {
    if (!USE_NETLIFY) {
      return getLocalData(APPOINTMENTS_KEY);
    }
    return apiCall('appointments');
  },

  // Get appointments by date (admin)
  async getByDate(date) {
    if (!USE_NETLIFY) {
      const appointments = getLocalData(APPOINTMENTS_KEY);
      return appointments.filter(a => {
        const aptDate = new Date(a.appointmentDate).toISOString().split('T')[0];
        return aptDate === date;
      });
    }
    return apiCall(`appointments?date=${encodeURIComponent(date)}`);
  },

  // Update appointment
  async update(id, data) {
    if (!USE_NETLIFY) {
      const appointments = getLocalData(APPOINTMENTS_KEY);
      const index = appointments.findIndex(a => a._id === id);
      if (index !== -1) {
        appointments[index] = { ...appointments[index], ...data };
        saveLocalData(APPOINTMENTS_KEY, appointments);
        return appointments[index];
      }
      throw new Error('Cita no encontrada');
    }
    return apiCall('appointments', 'PUT', { id, ...data });
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
