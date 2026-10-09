import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AccessMode, DeviceAccess, Reader, Session } from '../../types/api';

interface AuthState {
  token: string | null;
  user: Reader | null;
  accessMode: AccessMode | null;
  deviceAccess: DeviceAccess | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: null,
  user: null,
  accessMode: null,
  deviceAccess: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<Session>) => {
      state.token = action.payload.accessToken;
      state.user = action.payload.reader;
      state.accessMode = action.payload.accessMode;
      state.deviceAccess = action.payload.deviceAccess;
      state.isAuthenticated = true;
    },
    updateAccessToken: (state, action: PayloadAction<string>) => { state.token = action.payload; },
    clearAuth: () => initialState,
    updateUser: (state, action: PayloadAction<Reader>) => { state.user = action.payload; },
    updateDeviceAccess: (state, action: PayloadAction<DeviceAccess>) => {
      state.deviceAccess = action.payload;
      state.accessMode = action.payload.accessMode;
    },
  },
});

export const { setSession, updateAccessToken, clearAuth, updateUser, updateDeviceAccess } = authSlice.actions;
export default authSlice.reducer;
