import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Configuración base de axios para la base de datos (backend)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Acción asíncrona para iniciar sesión
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      // Simulación de llamada a la base de datos vía API
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      
      // Guardar token y usuario en localStorage para persistencia
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al conectar con la base de datos'
      );
    }
  }
);

// Acción asíncrona para cerrar sesión
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
    isAuthenticated: !!localStorage.getItem('token'),
  },
  reducers: {
    // Reducers síncronos si se necesitan
    resetError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { resetError } = authSlice.actions;
export default authSlice.reducer;
