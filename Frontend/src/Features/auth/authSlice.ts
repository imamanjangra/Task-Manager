import type { AuthState, User } from "@/Types/auth.types";
import { createSlice ,  type PayloadAction } from "@reduxjs/toolkit";

const initialState: AuthState = {
  user: null,
  // accessToken: null,
  isAuthenticated: false,
  loading: false,
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    loginSuccess: ( state, action: PayloadAction<{ user: User;  }>) => {
      state.user = action.payload.user;
      // state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
    },

    logout: (state) => {
      state.user = null;
      // state.accessToken = null;
      state.isAuthenticated = false;
    },

    setLoading: ( state, action: PayloadAction<boolean> ) => {
      state.loading = action.payload;
    },

    updateUser: (
      state,
      action: PayloadAction<User>
    ) => {
      state.user = action.payload;
    },
  },
});

export const {
  loginSuccess,
  logout,
  setLoading,
  updateUser,
} = authSlice.actions;

export default authSlice.reducer;