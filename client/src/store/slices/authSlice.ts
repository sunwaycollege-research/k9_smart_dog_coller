import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  _id: string
  username: string
  email: string
  pets: string[]
  home?: {
    coordinates: {
      latitude: number
      longitude: number
    }
  } | null
}

interface AuthState {
  user:            AuthUser | null
  token:           string | null
  isAuthenticated: boolean
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const TOKEN_KEY = 'pawtrack_token'
const USER_KEY  = 'pawtrack_user'

function loadFromStorage(): Pick<AuthState, 'user' | 'token'> {
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    const raw   = localStorage.getItem(USER_KEY)
    const user  = raw ? (JSON.parse(raw) as AuthUser) : null
    return { token, user }
  } catch {
    return { token: null, user: null }
  }
}

// ── Initial state (hydrated from localStorage) ────────────────────────────────

const { token, user } = loadFromStorage()

const initialState: AuthState = {
  user,
  token,
  isAuthenticated: !!token && !!user,
}

// ── Slice ─────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Update stored home coordinates after PATCH /user/home succeeds */
    setHomeCoord(
      state,
      action: PayloadAction<{ latitude: number; longitude: number }>,
    ) {
      if (state.user) {
        state.user.home = { coordinates: action.payload }
        localStorage.setItem(USER_KEY, JSON.stringify(state.user))
      }
    },

    /** Called after a successful login or register */
    loginSuccess(
      state,
      action: PayloadAction<{ user: AuthUser; token: string }>,
    ) {
      state.user            = action.payload.user
      state.token           = action.payload.token
      state.isAuthenticated = true
      localStorage.setItem(TOKEN_KEY, action.payload.token)
      localStorage.setItem(USER_KEY,  JSON.stringify(action.payload.user))
    },

    /** Clear session on sign-out */
    logout(state) {
      state.user            = null
      state.token           = null
      state.isAuthenticated = false
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    },
  },
})

export const { loginSuccess, logout, setHomeCoord } = authSlice.actions
export default authSlice.reducer
