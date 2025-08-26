import mongoose, { Schema, Document } from "mongoose";
import { INotification, NotificationSchema } from "./Notifications";


export enum Expiration {
  Default = "7d",
  None = "never",
  OneMonth = "30d",
  TwoMonth = "60d",
}

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  image: string;
  contact: string;

  sessionTimeOut: Expiration;

  notifications: INotification[];
  notificationsOn: boolean;
  emailNotificationsOn: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, default: null },
    contact: { type: String, default: null },
    sessionTimeOut: {
      type: String,
      enum: Object.values(Expiration),
      default: Expiration.Default,
    },

    notifications: { type: [NotificationSchema], default: [] },
    notificationsOn: { type: Boolean, default: true },
    emailNotificationsOn: { type: Boolean, default: true },

  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
