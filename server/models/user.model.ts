import mongoose from "mongoose";
import { Schema, Document } from "mongoose";

// ── Home / safe-zone definition ───────────────────────────────────────────────

interface IHome {
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

// ── User interface ────────────────────────────────────────────────────────────

interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  pets: mongoose.Types.ObjectId[];
  home: IHome | null;
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ────────────────────────────────────────────────────────────────────

const HomeSchema = new Schema(
  {
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
  },
  { _id: false }, // embedded sub-document, no separate _id
);

const UserSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  pets: {
    type: [Schema.Types.ObjectId],
    ref: "Pet",
    default: [],
  },
  home: {
    type: HomeSchema,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IUser>("User", UserSchema);
