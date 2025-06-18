
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

// Define the structure of the user profile based on API response
export interface MyProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  role: "BUYER" | "SELLER" | string; // Can be 'BUYER', 'SELLER', or other roles
  isVerified: boolean;
  createdAt: string;
  enabled: boolean;
  accountNonExpired: boolean;
  accountNonLocked: boolean;
  credentialsNonExpired: boolean;
  username: string;
}

// Define the structure of the signup API response data
export interface SignupResponseData {
  myProfile: MyProfile;
  accessToken: string;
  refreshToken: string;
}

interface UserState {
  profile: MyProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: 'idle' | 'pending';
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: 'idle',
  error: null,
};

// Helper function to load state from localStorage
const loadState = (): UserState => {
  try {
    const serializedState = localStorage.getItem('userState');
    if (serializedState === null) {
      return initialState;
    }
    const storedState = JSON.parse(serializedState);
    return { ...initialState, ...storedState, isAuthenticated: !!storedState.accessToken };
  } catch (err) {
    console.warn("Could not load user state from localStorage", err);
    return initialState;
  }
};

// Helper function to save state to localStorage
const saveState = (state: Partial<UserState>) => {
  try {
    const stateToSave = {
      profile: state.profile,
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
    };
    const serializedState = JSON.stringify(stateToSave);
    localStorage.setItem('userState', serializedState);
  } catch (err) {
    console.warn("Could not save user state to localStorage", err);
  }
};


const userSlice = createSlice({
  name: 'user',
  initialState: loadState(),
  reducers: {
    setLoading: (state) => {
      state.loading = 'pending';
      state.error = null;
    },
    signupSuccess: (state, action: PayloadAction<SignupResponseData>) => {
      state.profile = action.payload.myProfile;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.loading = 'idle';
      state.error = null;
      saveState(state);
    },
    authError: (state, action: PayloadAction<string>) => {
      state.loading = 'idle';
      state.error = action.payload;
      state.isAuthenticated = false;
      state.profile = null;
      state.accessToken = null;
      state.refreshToken = null;
      localStorage.removeItem('userState');
    },
    logout: (state) => {
      state.profile = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.loading = 'idle';
      state.error = null;
      localStorage.removeItem('userState');
    },
  },
});

export const { setLoading, signupSuccess, authError, logout } = userSlice.actions;

export const selectUser = (state: RootState) => state.user.profile;
export const selectIsAuthenticated = (state: RootState) => state.user.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.user.loading;
export const selectAuthError = (state: RootState) => state.user.error;
export const selectAccessToken = (state: RootState) => state.user.accessToken;

export default userSlice.reducer;
