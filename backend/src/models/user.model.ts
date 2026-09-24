import { Schema, model, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  bio?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserModel extends Model<IUser> {
  // Add static methods here if required
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Do not return password by default in queries
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'admin'],
        message: '{VALUE} is not a supported role',
      },
      default: 'user',
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [300, 'Bio cannot exceed 300 characters'],
      default: '',
    },
    avatar: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete (ret as Record<string, unknown>).password;
        delete (ret as Record<string, unknown>).__v;
        return ret;
      },
    },
  }
);

// Pre-save hook: Hash password before saving if it has been modified
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(env.BCRYPT_SALT_ROUNDS);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to check password validity
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = model<IUser, IUserModel>('User', userSchema);
