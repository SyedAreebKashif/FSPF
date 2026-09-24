import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import {
  Project,
  Service,
  ProcessStep,
  Profile,
  ContactInquiry,
} from '../models/portfolio.model';
import { User } from '../models/user.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/apiError';

// Validation Schemas
const projectSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters'),
  slug: z.string().trim().min(2, 'Slug must be at least 2 characters'),
  client: z.string().trim().min(2, 'Client name is required'),
  category: z.string().trim().min(2, 'Category is required'),
  year: z.string().trim().min(2, 'Year is required'),
  tags: z.array(z.string()).default([]),
  summary: z.string().trim().min(5, 'Summary must be at least 5 characters'),
  challenge: z.string().trim().optional(),
  solution: z.string().trim().optional(),
  metrics: z
    .array(
      z.object({
        label: z.string().trim().min(1, 'Metric label is required'),
        value: z.string().trim().min(1, 'Metric value is required'),
      })
    )
    .default([]),
  coverImage: z.string().trim().min(1, 'Cover image URL is required'),
  liveUrl: z.string().trim().optional(),
  featured: z.boolean().default(true),
  order: z.number().default(0),
});

const serviceSchema = z.object({
  title: z.string().trim().min(2, 'Title is required'),
  slug: z.string().trim().min(2, 'Slug is required'),
  icon: z.string().trim().min(1, 'Icon name is required'),
  description: z.string().trim().min(5, 'Description is required'),
  startingPrice: z.string().trim().min(1, 'Starting price is required'),
  deliverables: z.array(z.string()).default([]),
  order: z.number().default(0),
});

const processStepSchema = z.object({
  step: z.string().trim().min(1, 'Step number is required'),
  title: z.string().trim().min(2, 'Title is required'),
  subtitle: z.string().trim().min(2, 'Subtitle is required'),
  description: z.string().trim().min(5, 'Description is required'),
  duration: z.string().trim().min(1, 'Duration is required'),
  order: z.number().default(0),
});

const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  title: z.string().trim().min(2, 'Title is required'),
  headline: z.string().trim().min(2, 'Headline is required'),
  philosophy: z.string().trim().min(5, 'Philosophy is required'),
  bio: z.string().trim().min(5, 'Bio is required'),
  statusPill: z.string().trim().default('Available for Q4 contracts'),
  isAvailable: z.boolean().default(true),
  location: z.string().trim().default('London & Remote Worldwide'),
  email: z.string().trim().email('Invalid email address'),
  stats: z
    .array(
      z.object({
        label: z.string().trim().min(1, 'Stat label is required'),
        value: z.string().trim().min(1, 'Stat value is required'),
      })
    )
    .default([]),
});

export class AdminController {
  // ==================== DASHBOARD STATS ====================
  public getDashboardStats = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    if (mongoose.connection.readyState !== 1) {
      res.status(200).json({
        success: true,
        data: {
          counts: {
            projects: 4,
            services: 3,
            processSteps: 4,
            inquiries: 2,
            users: 1,
          },
          recentInquiries: [],
        },
      });
      return;
    }

    const [
      totalProjects,
      totalServices,
      totalProcessSteps,
      totalInquiries,
      totalUsers,
      recentInquiries,
    ] = await Promise.all([
      Project.countDocuments(),
      Service.countDocuments(),
      ProcessStep.countDocuments(),
      ContactInquiry.countDocuments(),
      User.countDocuments(),
      ContactInquiry.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        counts: {
          projects: totalProjects,
          services: totalServices,
          processSteps: totalProcessSteps,
          inquiries: totalInquiries,
          users: totalUsers,
        },
        recentInquiries,
      },
    });
  });

  // ==================== PROJECTS ====================
  public getProjects = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    if (mongoose.connection.readyState !== 1) {
      res.status(200).json({ success: true, data: [] });
      return;
    }
    const projects = await Project.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, data: projects });
  });

  public createProject = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const parseResult = projectSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      throw ApiError.badRequest('Validation Error', errors);
    }

    const existing = await Project.findOne({ slug: parseResult.data.slug.toLowerCase() });
    if (existing) {
      throw ApiError.conflict(`Project with slug '${parseResult.data.slug}' already exists`);
    }

    const project = await Project.create({
      ...parseResult.data,
      slug: parseResult.data.slug.toLowerCase(),
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project,
    });
  });

  public updateProject = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const parseResult = projectSchema.partial().safeParse(req.body);
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      throw ApiError.badRequest('Validation Error', errors);
    }

    if (parseResult.data.slug) {
      const slugConflict = await Project.findOne({
        slug: parseResult.data.slug.toLowerCase(),
        _id: { $ne: id },
      });
      if (slugConflict) {
        throw ApiError.conflict(`Project with slug '${parseResult.data.slug}' already exists`);
      }
    }

    const project = await Project.findByIdAndUpdate(
      id,
      { ...parseResult.data },
      { new: true, runValidators: true }
    );

    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project,
    });
  });

  public deleteProject = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  });

  // ==================== PROFILE ====================
  public getProfile = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    if (mongoose.connection.readyState !== 1) {
      res.status(200).json({
        success: true,
        data: {
          name: 'Syed Ali Raza',
          title: 'Staff Product Designer & Systems Architect',
          headline: 'Crafting intuitive enterprise systems',
          philosophy:
            'Crafting intuitive enterprise systems with sculptural clarity, human-centered ergonomics, and ruthless technical precision.',
          bio: 'Over 8 years bridging high-stakes product design, design systems architecture, and front-end engineering for Fortune 500 fintech and AI platforms.',
          statusPill: 'Available for Q4 contracts',
          isAvailable: true,
          location: 'London & Remote Worldwide',
          email: 'syedali.raza@portfolio.design',
          stats: [
            { label: 'Years of Craft', value: '8+' },
            { label: 'Enterprise Systems Shipped', value: '42' },
            { label: 'Design Token Adoption', value: '98.4%' },
            { label: 'Capital Raised by Clients', value: '$180M+' },
          ],
        },
      });
      return;
    }

    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create({
        name: 'Syed Ali Raza',
        title: 'Staff Product Designer & Systems Architect',
        headline: 'Crafting intuitive enterprise systems',
        philosophy:
          'Crafting intuitive enterprise systems with sculptural clarity, human-centered ergonomics, and ruthless technical precision.',
        bio: 'Over 8 years bridging high-stakes product design, design systems architecture, and front-end engineering for Fortune 500 fintech and AI platforms.',
        statusPill: 'Available for Q4 contracts',
        isAvailable: true,
        location: 'London & Remote Worldwide',
        email: 'syedali.raza@portfolio.design',
        stats: [
          { label: 'Years of Craft', value: '8+' },
          { label: 'Enterprise Systems Shipped', value: '42' },
          { label: 'Design Token Adoption', value: '98.4%' },
          { label: 'Capital Raised by Clients', value: '$180M+' },
        ],
      });
    }

    res.status(200).json({ success: true, data: profile });
  });

  public updateProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const parseResult = profileSchema.partial().safeParse(req.body);
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      throw ApiError.badRequest('Validation Error', errors);
    }

    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create(parseResult.data);
    } else {
      Object.assign(profile, parseResult.data);
      await profile.save();
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: profile,
    });
  });

  // ==================== SERVICES ====================
  public getServices = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    if (mongoose.connection.readyState !== 1) {
      res.status(200).json({ success: true, data: [] });
      return;
    }
    const services = await Service.find().sort({ order: 1 });
    res.status(200).json({ success: true, data: services });
  });

  public createService = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const parseResult = serviceSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      throw ApiError.badRequest('Validation Error', errors);
    }

    const service = await Service.create(parseResult.data);
    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service,
    });
  });

  public updateService = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const service = await Service.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!service) {
      throw ApiError.notFound('Service not found');
    }

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: service,
    });
  });

  public deleteService = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const service = await Service.findByIdAndDelete(id);

    if (!service) {
      throw ApiError.notFound('Service not found');
    }

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
    });
  });

  // ==================== PROCESS STEPS ====================
  public getProcessSteps = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    if (mongoose.connection.readyState !== 1) {
      res.status(200).json({ success: true, data: [] });
      return;
    }
    const steps = await ProcessStep.find().sort({ order: 1 });
    res.status(200).json({ success: true, data: steps });
  });

  public createProcessStep = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const parseResult = processStepSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      throw ApiError.badRequest('Validation Error', errors);
    }

    const step = await ProcessStep.create(parseResult.data);
    res.status(201).json({
      success: true,
      message: 'Process step created successfully',
      data: step,
    });
  });

  public updateProcessStep = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const step = await ProcessStep.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!step) {
      throw ApiError.notFound('Process step not found');
    }

    res.status(200).json({
      success: true,
      message: 'Process step updated successfully',
      data: step,
    });
  });

  public deleteProcessStep = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const step = await ProcessStep.findByIdAndDelete(id);

    if (!step) {
      throw ApiError.notFound('Process step not found');
    }

    res.status(200).json({
      success: true,
      message: 'Process step deleted successfully',
    });
  });

  // ==================== CONTACT INQUIRIES ====================
  public getInquiries = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    if (mongoose.connection.readyState !== 1) {
      res.status(200).json({ success: true, data: [] });
      return;
    }
    const inquiries = await ContactInquiry.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: inquiries });
  });

  public deleteInquiry = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const inquiry = await ContactInquiry.findByIdAndDelete(id);

    if (!inquiry) {
      throw ApiError.notFound('Inquiry not found');
    }

    res.status(200).json({
      success: true,
      message: 'Inquiry deleted successfully',
    });
  });
}

export const adminController = new AdminController();
