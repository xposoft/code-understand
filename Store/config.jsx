// config.jsx

// Base URL (change in .env for prod/dev)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"

// ✅ All backend endpoints
export const ENDPOINTS = {
  // People / general
  people: `${API_BASE_URL}/people`,

  // Students
  students: `${API_BASE_URL}/students`,

  // Trainers
  trainers: `${API_BASE_URL}/trainers`,

  // Classes
  classes: `${API_BASE_URL}/classes`,

  // Administration
  administration: `${API_BASE_URL}/administration`,

  //AdmissionMaster

  admissionmaster: `${API_BASE_URL}/admissionmaster`,

  // Transport
  transport: `${API_BASE_URL}/transport`,

  // Transaction
  transaction: `${API_BASE_URL}/transaction`,

  // Store
  store: `${API_BASE_URL}/store`,

  // Library
  library: `${API_BASE_URL}/library`,

  // Normal user authentication
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    me: `${API_BASE_URL}/auth/me`, // ✅ get logged-in user profile
    School: `${API_BASE_URL}/schools`,

  },

  // Admin endpoints
  admin: {
    login: `${API_BASE_URL}/admin/login`,
    registerSchool: `${API_BASE_URL}/schools/register`,
    getSchools: `${API_BASE_URL}/admin/schools`, // ✅ list / update / delete schools
    me: `${API_BASE_URL}/admin/me`, // ✅ get logged-in admin profile
  },
}
