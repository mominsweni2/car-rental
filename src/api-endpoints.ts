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
