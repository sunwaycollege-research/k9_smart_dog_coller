import mongoose, { Schema, Document } from "mongoose";

interface IPet extends Document {
  name: string;
  breed: string;
  collarModelNo: string;
  collarId: mongoose.Types.ObjectId;
  age: number;
  gender: "male" | "female";
  color: string;
  weight: number;
  vaccinations: string[];
  healthNotes: string;
  temperament: string;
  owner: mongoose.Types.ObjectId;
  ownerUsername: string;
  createdAt: Date;
  updatedAt: Date;
}

const PetSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  breed: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ["male", "female"],
  },
  color: {
    type: String,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  vaccinations: {
    type: [String],
    default: [],
  },
  healthNotes: {
    type: String,
    default: "",
  },
  temperament: {
    type: String,
    default: "",
  },
  collarModelNo: {
    type: String,
    default: "",
  },
  collarId: {
    type: Schema.Types.ObjectId,
    ref: "Collar",
    default: null,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  ownerUsername: {
    type: String,
    default: "",
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

export default mongoose.model<IPet>("Pet", PetSchema);
