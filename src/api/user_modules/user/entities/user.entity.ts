import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";
import pM from "mongoose-paginate-v2";
import {
  MailType,
  payoutType,
  profileVisibleType,
  RegisterMethod,
  RegisterStatus,
  UserPrivacyTypes,
  UserRole,
  UserType,
} from "../../../../core/utils/enums";
import { IUserDevice } from "../../user_device/entities/user_device.entity";
import { UserGlobalCallStatus } from "../../../../chat/call_modules/utils/user-global-call-status.model";
import { ISubscriptionPlan } from "./subscription_plan.entity";

export interface IUser extends Document{
  _id: string;
  email: string;
  fullName: string;
  fullNameEn: string;
  password: string;
  uniqueCode: number;
  bio?: string;
  phoneNumber?: string;
  // Gender enum male female
  gender?: string;
  // Location fields for nearby users feature
  latitude?: number;
  longitude?: number;
  locationUpdatedAt?: Date;
  lastMail: {
    type: MailType;
    sendAt: Date;
    code: number;
    expired: boolean;
  };
  banTo?: Date;
  banMessageTo: Date;
  banLiveTo: Date;
  verifiedAt?: Date;
  isVerified?: boolean;
  registerStatus: RegisterStatus;
  registerMethod: RegisterMethod;
  userImage: string;
  createdAt: Date;
  deletedAt?: Date;
  countryId?: string;
  updatedAt: Date;
  lastSeenAt: Date;
  loyaltyPoints: number;
  balance: number;
  claimedGifts: string[];
  roles: UserRole[];
  userPrivacy: UserPrivacy;
  isAgeVerified: boolean;
  dateOfBirth?: Date;
  payoutDetails?: {
    method: payoutType;
    accountId?: string;
    phoneNumber?: string;
    isVerified: boolean;
  };
  subscription?: {
    plan: ISubscriptionPlan | string;
    purchasedAt: Date;
    expiresAt: Date;
  };
  // family members in case of emergency
  familyMembers?: {
    userId: string;
    relationship?: string;
  }[];
  currentDevice: IUserDevice;
  resetPasswordOTP?: string;
  resetPasswordOTPExpiry?: Date;
  userGlobalCallStatus?: UserGlobalCallStatus;
  socialId?: string;
  provider?: string;
  // remeber Me true or false
  rememberMe?: boolean;
  // two factor authentication
  isTwoFactorEnabled?: boolean;
  twoFactorSecret?: string;
}

export enum DpVisibilityType {
  Everyone = "Everyone",
  Nobody = "Nobody",
}

export interface UserPrivacy {
  startChat: UserPrivacyTypes;
  publicSearch: boolean;
  showStory: UserPrivacyTypes;
  lastSeen: boolean;
  readReceipts: boolean;
  // who can call me
  whoCanCallMe: WhoCanType;
  // who can add me to groups
  whoCanAddMeToGroups: WhoCanType;
  // who can see my profile photo]
  dpVisibility: DpVisibilityType;
}

export enum WhoCanType {
  Everyone = "Everyone",
  Nobody = "Nobody",
}

export const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    fullNameEn: { type: String, required: true },
    bio: { type: String, default: null },
    phoneNumber: { type: String, default: null },
    userGlobalCallStatus: {
      type: Object,
      default: UserGlobalCallStatus.createEmpty(),
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "male",
    },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    locationUpdatedAt: { type: Date, default: null },
    uniqueCode: { type: Number, required: true },
    password: { type: String, required: true, select: false },
    lastMail: { type: Object, default: {} },
    verifiedAt: { type: Date, default: null },
    isVerified: { type: Boolean, default: false },
    userImage: { type: String, default: "default_user_image.png" },
    registerStatus: {
      type: String,
      enum: Object.values(RegisterStatus),
      required: true,
    },
    registerMethod: {
      type: String,
      enum: Object.values(RegisterMethod),
      required: true,
    },
    roles: {
      type: [String], // Define as an array of strings
      default: [],
      enum: Object.values(UserRole), // Ensure UserRole values are strings
    },
    banTo: { type: Date, default: null },
    banMessageTo: { type: Date, default: null },
    banLiveTo: { type: Date, default: null },
    countryId: { type: Schema.Types.ObjectId, default: null, ref: "countries" },
    createdAt: { type: Date },
    deletedAt: { type: Date, default: null },
    userPrivacy: {
      type: Object,
      default: {
        startChat: UserPrivacyTypes.ForReq,
        publicSearch: true,
        showStory: UserPrivacyTypes.ForReq,
        lastSeen: true,
        // readReceipts: true by default
        readReceipts: true,
        // who can call me
        whoCanCallMe: WhoCanType.Everyone,
        // who can add me to groups
        whoCanAddMeToGroups: WhoCanType.Everyone,
        // dp visibility
        dpVisibility: DpVisibilityType.Everyone,
      },
    },
    lastSeenAt: { type: Date, default: Date.now },
    loyaltyPoints: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    claimedGifts: { type: [String], default: [] },
    updatedAt: { type: Date },
    resetPasswordOTP: { type: String, default: null },
    resetPasswordOTPExpiry: { type: Date, default: null },
    isAgeVerified: { type: Boolean, default: false },
    dateOfBirth: {
      type: Date,
      default: () => {
        const d = new Date();
        d.setFullYear(d.getFullYear() - 18);
        return d;
      },
    },
    payoutDetails: { type: Object, default: {} },
    subscription: {
      plan: {
        type: Schema.Types.ObjectId,
        ref: "SubscriptionPlan",
        default: null,
      },
      purchasedAt: { type: Date, default: null },
      expiresAt: { type: Date, default: null },
    },
    familyMembers: {
      type: [
        {
          userId: {
            type: Schema.Types.ObjectId,
            ref: 'User', 
            required: true
          },
          relationship: { type: String, required: false },
        }
      ]
    },
    socialId: { type: String, default: null },
    provider: { type: String, default: null },
    isTwoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      select: false,
    },

  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  let user = this;
  if (!user.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hashSync(user.password, salt);
  return next();
});
UserSchema.pre("findOneAndUpdate", async function (next) {
  let update: any = this.getUpdate();

  // If password is under $set, hash it
  if (update.$set && update.$set.password) {
    const salt = await bcrypt.genSalt(10);
    update.$set.password = await bcrypt.hash(update.$set.password, salt);
  }
  // If password is directly in the object (rare case), hash it too
  else if (update.password) {
    const salt = await bcrypt.genSalt(10);
    update.password = await bcrypt.hash(update.password, salt);
  }

  next();
});

UserSchema.plugin(pM);

// export const UserEntity = mongoose.model<IUser>("User", userSchema);
