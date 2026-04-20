// API Endpoints Configuration
// This file defines all the API endpoints for the Car Rental Backend

export const API_ENDPOINTS = {
  // Base URL
  BASE: '/api',

  // Authentication endpoints
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
  },

  // Booking endpoints
  BOOKINGS: {
    // Car management
    GET_CARS: '/api/bookings/cars',
    ADD_CAR: '/api/bookings/cars',

    // Booking operations
    CREATE_GUEST_BOOKING: '/api/bookings/guest',
    CREATE_BOOKING: '/api/bookings/',
    GET_ALL_BOOKINGS: '/api/bookings/',
    APPROVE_BOOKING: (bookingId: string) => `/api/bookings/${bookingId}/approve`,
    DECLINE_BOOKING: (bookingId: string) => `/api/bookings/${bookingId}/decline`,
    UPDATE_BOOKING_DATES: (bookingId: string) => `/api/bookings/${bookingId}`,
    DELETE_BOOKING: (bookingId: string) => `/api/bookings/${bookingId}`,

    // Admin stats
    GET_ADMIN_STATS: '/api/bookings/admin/stats',
  },

  // Root endpoint
  ROOT: '/',
} as const;

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
} as const;

// API Endpoint Methods and Paths
export const API_ROUTES = [
  // Auth routes
  { method: HTTP_METHODS.POST, path: API_ENDPOINTS.AUTH.REGISTER, description: 'Register a new user' },
  { method: HTTP_METHODS.POST, path: API_ENDPOINTS.AUTH.LOGIN, description: 'Login user' },

  // Booking routes
  { method: HTTP_METHODS.GET, path: API_ENDPOINTS.BOOKINGS.GET_CARS, description: 'Get all cars' },
  { method: HTTP_METHODS.POST, path: API_ENDPOINTS.BOOKINGS.ADD_CAR, description: 'Add a new car' },
  { method: HTTP_METHODS.POST, path: API_ENDPOINTS.BOOKINGS.CREATE_GUEST_BOOKING, description: 'Create guest booking' },
  { method: HTTP_METHODS.POST, path: API_ENDPOINTS.BOOKINGS.CREATE_BOOKING, description: 'Create booking (authenticated)' },
  { method: HTTP_METHODS.GET, path: API_ENDPOINTS.BOOKINGS.GET_ALL_BOOKINGS, description: 'Get all bookings (admin)' },
  { method: HTTP_METHODS.PUT, path: API_ENDPOINTS.BOOKINGS.APPROVE_BOOKING(''), description: 'Approve booking (admin)' },
  { method: HTTP_METHODS.PUT, path: API_ENDPOINTS.BOOKINGS.DECLINE_BOOKING(''), description: 'Decline booking (admin)' },
  { method: HTTP_METHODS.PUT, path: API_ENDPOINTS.BOOKINGS.UPDATE_BOOKING_DATES(''), description: 'Update booking dates (admin)' },
  { method: HTTP_METHODS.DELETE, path: API_ENDPOINTS.BOOKINGS.DELETE_BOOKING(''), description: 'Delete booking (admin)' },
  { method: HTTP_METHODS.GET, path: API_ENDPOINTS.BOOKINGS.GET_ADMIN_STATS, description: 'Get admin statistics' },

  // Root
  { method: HTTP_METHODS.GET, path: API_ENDPOINTS.ROOT, description: 'API health check' },
];
