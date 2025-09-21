import mongoose, { Schema, Document, Types } from "mongoose";

export enum OrgRole {
  Admin = "Admin",
  InventoryIn = "Inventory In",
  InventoryManager = "Inventory Manager",
  Salesperson = "Salesperson",
}

export enum MedicineType {
  TABLET = "Tablet",
  CAPSULE = "Capsule",
  INJECTION = "Injection",
  SYRUP = "Syrup",
  POWDER = "Powder",
  TUBE = "Tube",
  SPRAY = "Spray",
  INHALER = "Inhaler",
}

export interface IBatch extends Document {
  batchId: string;
  qty: number;
  combinedExp: Date;
  averageMfg: Date;
  isDiscarded: boolean;
}

export interface IMedicine extends Document {
  id: string; // custom identifier separate from _id
  barcodeNo: string;
  name: string;
  type: MedicineType;
  qty: number; // derived from non-discarded batches
  price: number; // price per unit
  desc?: string;
  exp: Date | null; // earliest among batches
  mfg: Date | null; // average across batches
  specialInstructions?: string;
  handlingTemp?: number;
  batches: Types.DocumentArray<IBatch>;
  firstStockedOn: Date | null;
  recentlyStockedOn: Date | null;
}

export interface IOrgUser extends Document {
  user: Types.ObjectId; // ref to User
  role: OrgRole;
}

export interface IOrganization extends Document {
  name: string;
  owner: Types.ObjectId; // ref to User
  users: Types.DocumentArray<IOrgUser>;
  inventory: Types.DocumentArray<IMedicine>;
  createdAt: Date;
  updatedAt: Date;
}

const BatchSchema = new Schema<IBatch>(
  {
    batchId: { type: String, required: true, index: true },
    qty: { type: Number, required: true, min: 0 },
    combinedExp: { type: Date, required: true },
    averageMfg: { type: Date, required: true },
    isDiscarded: { type: Boolean, default: false },
  },
  { _id: false, timestamps: false }
);

const MedicineSchema = new Schema<IMedicine>(
  {
    id: { type: String, required: true, index: true },
    barcodeNo: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, enum: Object.values(MedicineType), required: true },
    qty: { type: Number, default: 0 }, // derived
    price: { type: Number, default: 0, min: 0 },
    desc: { type: String, default: null },
    exp: { type: Date, default: null },
    mfg: { type: Date, default: null },
    specialInstructions: { type: String, default: null },
    handlingTemp: { type: Number, default: null },
    batches: { type: [BatchSchema], default: [] },
    firstStockedOn: { type: Date, default: null },
    recentlyStockedOn: { type: Date, default: null },
  },
  { _id: true, timestamps: false }
);

const OrgUserSchema = new Schema<IOrgUser>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: Object.values(OrgRole), required: true },
  },
  { _id: false, timestamps: false }
);

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    users: { type: [OrgUserSchema], default: [] },
    inventory: { type: [MedicineSchema], default: [] },
  },
  { timestamps: true }
);

// Ensure a medicine barcode is unique within an organization
OrganizationSchema.index({ _id: 1, "inventory.barcodeNo": 1 }, { unique: true });

export const Organization = mongoose.model<IOrganization>(
  "Organization",
  OrganizationSchema
);