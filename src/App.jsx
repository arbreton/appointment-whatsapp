import { BrowserRouter, Routes, Route, Navigate, useSearchParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from './pages/Home'
import CustomerLogin from './pages/CustomerLogin'
import CustomerDashboard from './pages/CustomerDashboard'
import BookAppointment from './pages/BookAppointment'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AppointmentDetail from './pages/AppointmentDetail'
import CustomerManagement from './pages/CustomerManagement'
import PaymentSuccess from './pages/PaymentSuccess'
import { customerApi } from './api'

function AppContent() {
  const [customer, setCustomer] = useState(null)
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    // Check for logged in customer
    const storedCustomer = localStorage.getItem('customer')
    if (storedCustomer) {
      setCustomer(JSON.parse(storedCustomer))
    }
    // Check for logged in admin
    const storedAdmin = localStorage.getItem('admin')
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin))
    }

    // Handle auto-login from URL (admin sending link)
    const refPhone = searchParams.get('ref')
    const redirectTo = searchParams.get('redirectTo')

    if (refPhone && !storedCustomer) {
      // Try to auto-login with the reference phone
      customerApi.autoLogin(refPhone)
        .then(customer => {
          localStorage.setItem('customer', JSON.stringify(customer))
          setCustomer(customer)
          // Redirect to the intended page or dashboard
          navigate(redirectTo || '/dashboard', { replace: true })
        })
        .catch((err) => {
          console.error('Auto-login failed:', err)
          // If login fails, redirect to login page
          navigate(`/login?ref=${refPhone}`, { replace: true })
        })
    }

    setLoading(false)
  }, [searchParams, navigate])

  const handleCustomerLogin = (customerData) => {
    setCustomer(customerData)
    localStorage.setItem('customer', JSON.stringify(customerData))
  }

  const handleCustomerLogout = () => {
    setCustomer(null)
    localStorage.removeItem('customer')
  }

  const handleAdminLogin = (adminData) => {
    setAdmin(adminData)
    localStorage.setItem('admin', JSON.stringify(adminData))
  }

  const handleAdminLogout = () => {
    setAdmin(null)
    localStorage.removeItem('admin')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-fresia-dark flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-fresia-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<CustomerLogin onLogin={handleCustomerLogin} />} />
      <Route path="/admin" element={<AdminLogin onLogin={handleAdminLogin} />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />

      {/* Protected customer routes */}
      <Route path="/dashboard" element={
        customer ? <CustomerDashboard customer={customer} onLogout={handleCustomerLogout} /> : <Navigate to="/login" />
      } />
      <Route path="/book" element={
        customer ? <BookAppointment customer={customer} /> : <Navigate to="/login" />
      } />
      <Route path="/appointment/:id" element={
        customer ? <AppointmentDetail customer={customer} /> : <Navigate to="/login" />
      } />

      {/* Protected admin routes */}
      <Route path="/admin/dashboard" element={
        admin ? <AdminDashboard admin={admin} onLogout={handleAdminLogout} /> : <Navigate to="/admin" />
      } />
      <Route path="/admin/customers" element={
        admin ? <CustomerManagement admin={admin} onLogout={handleAdminLogout} /> : <Navigate to="/admin" />
      } />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <AppContent />
      </div>
    </BrowserRouter>
  )
}
