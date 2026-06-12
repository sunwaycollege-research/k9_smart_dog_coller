import mongoose from "mongoose";

interface ICollar extends mongoose.Document {
  modelNo: string;
  status: string;
  petId: mongoose.Types.ObjectId;
}

const CollarSchema = new mongoose.Schema(
  {
    modelNo: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "unassigned",
    },
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model<ICollar>("Collar", CollarSchema);
