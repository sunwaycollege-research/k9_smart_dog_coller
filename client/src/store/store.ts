import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import petReducer  from './slices/petSlice'
import { apiSlice } from './apiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    pet:  petReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(apiSlice.middleware),
})

// Inferred types — use these everywhere instead of plain `any`
export type RootState   = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

