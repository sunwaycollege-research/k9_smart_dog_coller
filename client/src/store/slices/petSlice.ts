import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PetSelection {
  species: string   // e.g. 'Dog'
  breed:   string   // e.g. 'Golden Retriever'
  collarId: string  // e.g. 'V-GNN3'
}

export interface PetProfile {
  name:         string
  age:          string
  gender:       string
  breed:        string
  weight:       string
  color:        string
  medicalNotes: string
  photoDataUrl: string | null
}

interface PetState {
  selection: PetSelection | null
  profile:   PetProfile   | null
}

const initialState: PetState = {
  selection: null,
  profile:   null,
}

// ── Slice ─────────────────────────────────────────────────────────────────────

const petSlice = createSlice({
  name: 'pet',
  initialState,
  reducers: {
    /** Saved when user clicks Continue on the SelectPet page */
    saveSelection(state, action: PayloadAction<PetSelection>) {
      state.selection = action.payload
    },

    /** Saved when user submits the PetDetails form */
    saveProfile(state, action: PayloadAction<PetProfile>) {
      state.profile = action.payload
    },

    /** Clear pet data on sign-out */
    clearPet(state) {
      state.selection = null
      state.profile   = null
    },
  },
})

export const { saveSelection, saveProfile, clearPet } = petSlice.actions
export default petSlice.reducer
