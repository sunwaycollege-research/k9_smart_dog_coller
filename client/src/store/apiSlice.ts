/**
 * RTK Query API slice
 *
 * All HTTP requests go through this single slice.
 * Components use the generated hooks (useLoginUserMutation, etc.)
 * instead of calling apiFetch directly.
 */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "./store";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface HomeCoord {
  latitude: number;
  longitude: number
}

export interface PopulatedPet {
  _id: string;
  name: string;
  breed: string;
  collarModelNo: string;
  collarId?: string | null;
  age: number;
  gender: "male" | "female";
  color: string;
  weight: number;
  vaccinations: string[];
  healthNotes: string;
  temperament: string;
  owner: string;
}

export interface PopulatedUser {
  _id: string;
  username: string;
  email: string;
  pets: PopulatedPet[];
  home: { coordinates: HomeCoord } | null;
}

export interface RegisterPetRequest {
  name: string;
  breed: string;
  age: number;
  gender: "male" | "female";
  color: string;
  weight: number;
  vaccinations?: string[];
  healthNotes?: string;
  temperament?: string;
  owner: string;
}

export interface AssignCollarRequest {
  collarModelNo: string;
  petId: string;
}

export interface AuthUser {
  _id:      string
  username: string
  email:    string
  pets:     string[]
  home:     { coordinates: HomeCoord } | null
}

export interface LoginRequest {
  identifier: string; // email or username
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export interface PetAttributes {
  _id: string;
  petId: string;
  collarId: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  heartRate: number;
  temperature: number;
  batteryLevel: number;
  status: string;
  totalHistoryCount?: number;
  history: {
    coordinates: {
      latitude: number;
      longitude: number;
    };
    heartRate: number;
    temperature: number;
    batteryLevel: number;
    status: string;
    time: string;
  }[];
}

// ── API slice ─────────────────────────────────────────────────────────────────

const BASE_URL = (import.meta.env.VITE_API_URL as string).replace(/\/$/, "");

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // Attach JWT from Redux store on every authenticated request
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // POST /user/login
    loginUser: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: "/user/login",
        method: "POST",
        body,
      }),
    }),

    // POST /user/register
    registerUser: builder.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({
        url: "/user/register",
        method: "POST",
        body,
      }),
    }),

    // PATCH /user/home
    setHome: builder.mutation<{ message: string; home: { coordinates: HomeCoord } }, HomeCoord>({
      query: (coordinates) => ({
        url:    '/user/home',
        method: 'PATCH',
        body:   { coordinates },
      }),
    }),

    // GET /user/me
    getMe: builder.query<{ user: PopulatedUser }, void>({
      query: () => "/user/me",
    }),

    // GET /pet/:petId/attributes
    getPetAttributes: builder.query<
      { attributes: PetAttributes },
      { petId: string; page?: number; limit?: number }
    >({
      query: ({ petId, page, limit }) => {
        let url = `/pet/${petId}/attributes`;
        const params: string[] = [];
        if (page !== undefined) params.push(`page=${page}`);
        if (limit !== undefined) params.push(`limit=${limit}`);
        if (params.length > 0) {
          url += `?${params.join("&")}`;
        }
        return url;
      },
    }),

    // POST /pet/register
    registerPet: builder.mutation<{ message: string; pet: PopulatedPet }, RegisterPetRequest>({
      query: (body) => ({
        url: "/pet/register",
        method: "POST",
        body,
      }),
    }),

    // POST /pet/assign-collar
    assignCollar: builder.mutation<{ message: string; pet: PopulatedPet; collar: unknown }, AssignCollarRequest>({
      query: (body) => ({
        url: "/pet/assign-collar",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { 
  useLoginUserMutation, 
  useRegisterUserMutation, 
  useSetHomeMutation,
  useGetMeQuery,
  useGetPetAttributesQuery,
  useRegisterPetMutation,
  useAssignCollarMutation,
} = apiSlice;

