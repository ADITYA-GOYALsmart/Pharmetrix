import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  at: Date;
  actorId: string | null;
  orgId: string | null;
  action: string; // e.g., org.create, inventory.add, inventory.sell, batch.discard, auth.login
  status: "success" | "failure";
  requestId?: string;
  meta?: Record<string, any>;
}

const AuditLogSchema = new Schema<IAuditLog>({
  at: { type: Date, default: () => new Date() },
  actorId: { type: String, default: null },
  orgId: { type: String, default: null },
  action: { type: String, required: true, index: true },
  status: { type: String, enum: ["success", "failure"], required: true },
  requestId: { type: String },
  meta: { type: Schema.Types.Mixed },
});

export const AuditLog = mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);