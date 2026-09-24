import { Schema, model, Document } from 'mongoose';

// ==================== PROJECT / CASE STUDY ====================
export interface IProject extends Document {
  title: string;
  slug: string;
  client: string;
  category: string;
  year: string;
  tags: string[];
  summary: string;
  challenge?: string;
  solution?: string;
  metrics: { label: string; value: string }[];
  coverImage: string;
  liveUrl?: string;
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    client: { type: String, required: true },
    category: { type: String, required: true },
    year: { type: String, required: true },
    tags: [{ type: String, trim: true }],
    summary: { type: String, required: true },
    challenge: { type: String },
    solution: { type: String },
    metrics: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    coverImage: { type: String, required: true },
    liveUrl: { type: String },
    featured: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Project = model<IProject>('Project', projectSchema);

// ==================== SERVICE ====================
export interface IService extends Document {
  title: string;
  slug: string;
  icon: string;
  description: string;
  startingPrice: string;
  deliverables: string[];
  order: number;
}

const serviceSchema = new Schema<IService>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    icon: { type: String, required: true },
    description: { type: String, required: true },
    startingPrice: { type: String, required: true },
    deliverables: [{ type: String, trim: true }],
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Service = model<IService>('Service', serviceSchema);

// ==================== PROCESS STEP ====================
export interface IProcessStep extends Document {
  step: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  order: number;
}

const processStepSchema = new Schema<IProcessStep>(
  {
    step: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const ProcessStep = model<IProcessStep>('ProcessStep', processStepSchema);

// ==================== PROFILE ====================
export interface IProfile extends Document {
  name: string;
  title: string;
  headline: string;
  philosophy: string;
  bio: string;
  statusPill: string;
  isAvailable: boolean;
  location: string;
  email: string;
  stats: { label: string; value: string }[];
}

const profileSchema = new Schema<IProfile>(
  {
    name: { type: String, required: true },
    title: { type: String, required: true },
    headline: { type: String, required: true },
    philosophy: { type: String, required: true },
    bio: { type: String, required: true },
    statusPill: { type: String, default: 'Available for Q4 contracts' },
    isAvailable: { type: Boolean, default: true },
    location: { type: String, default: 'London & Remote Worldwide' },
    email: { type: String, default: 'contact@syedali.design' },
    stats: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export const Profile = model<IProfile>('Profile', profileSchema);

// ==================== CONTACT INQUIRY ====================
export interface IContactInquiry extends Document {
  name: string;
  email: string;
  company?: string;
  service?: string;
  budget?: string;
  message: string;
  createdAt: Date;
}

const contactInquirySchema = new Schema<IContactInquiry>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    company: { type: String, trim: true },
    service: { type: String, trim: true },
    budget: { type: String, trim: true },
    message: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export const ContactInquiry = model<IContactInquiry>('ContactInquiry', contactInquirySchema);
