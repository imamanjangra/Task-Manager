import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../Features/auth/authSlice.ts";
import themeReducer from "../Features/theamSlice.ts"
export const store = configureStore({
  reducer: {
    auth: authReducer,
    mode : themeReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

