import mongoose from "mongoose";

interface IPetAttributes extends mongoose.Document {
  petId: mongoose.Types.ObjectId;
  collarId: mongoose.Types.ObjectId;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  heartRate: number;
  temperature: number;
  batteryLevel: number;
  status: string;
  history: {
    coordinates: {
      latitude: number;
      longitude: number;
    };
    heartRate: number;
    temperature: number;
    batteryLevel: number;
    status: string;
    time: Date;
  }[];
}

const PetAttributesSchema = new mongoose.Schema(
  {
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
    },
    collarId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collar",
      required: true,
    },
    coordinates: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
    heartRate: {
      type: Number,
      required: true,
    },
    temperature: {
      type: Number,
      required: true,
    },
    batteryLevel: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    history: [
      {
        coordinates: {
          latitude: {
            type: Number,
            required: true,
          },
          longitude: {
            type: Number,
            required: true,
          },
        },
        heartRate: {
          type: Number,
          required: true,
        },
        temperature: {
          type: Number,
          required: true,
        },
        batteryLevel: {
          type: Number,
          required: true,
        },
        status: {
          type: String,
          required: true,
        },
        time: {
          type: Date,
          required: true,
        },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model<IPetAttributes>(
  "PetAttributes",
  PetAttributesSchema,
);
