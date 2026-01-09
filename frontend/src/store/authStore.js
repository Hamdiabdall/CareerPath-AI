import { create } from 'zustand';
import { authAPI, profileAPI } from '../services/api';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  profile: null,
  isLoading: false,
  error: null,

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },

  register: async (email, password, role) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.register({ email, password, role });
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || 'Registration failed' });
      throw error;
    }
  },

  verifyOTP: async (email, otp) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.verifyOTP({ email, otp });
      const { user, token } = response.data.data;
      get().setUser(user);
      get().setToken(token);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || 'Verification failed' });
      throw error;
    }
  },

  resendOTP: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.resendOTP({ email });
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || 'Failed to resend OTP' });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login({ email, password });
      const { user, token } = response.data.data;
      get().setUser(user);
      get().setToken(token);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || 'Login failed' });
      throw error;
    }
  },

  fetchProfile: async () => {
    try {
      const response = await profileAPI.get();
      set({ profile: response.data.data.profile });
      return response.data.data.profile;
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      throw error;
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await profileAPI.update(data);
      set({ profile: response.data.data.profile, isLoading: false });
      return response.data.data.profile;
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || 'Update failed' });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, profile: null });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
