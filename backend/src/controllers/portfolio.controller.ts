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
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/apiError';

// Validation Schema for Contact Submissions
const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email address'),
  company: z.string().trim().optional(),
  service: z.string().trim().optional(),
  budget: z.string().trim().optional(),
  message: z.string().trim().min(10, 'Message must be at least 10 characters'),
});

export class PortfolioController {
  /**
   * @route   GET /api/v1/portfolio/data
   * @desc    Get aggregated portfolio data (Profile, Services, Process, Projects)
   * @access  Public
   */
  public getPortfolioData = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    let profile = null;
    let services: unknown[] = [];
    let processSteps: unknown[] = [];
    let projects: unknown[] = [];

    // If connected to MongoDB, query the database
    if (mongoose.connection.readyState === 1) {
      [profile, services, processSteps, projects] = await Promise.all([
        Profile.findOne().lean(),
        Service.find().sort({ order: 1 }).lean(),
        ProcessStep.find().sort({ order: 1 }).lean(),
        Project.find().sort({ order: 1 }).lean(),
      ]);
    }

    // If empty or offline, fallback to structured production data
    if (!profile || !projects.length) {
      profile = {
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
      };

      services = [
        {
          title: 'Discovery & Architecture Strategy',
          slug: 'discovery',
          icon: 'Compass',
          description:
            'Deep stakeholder discovery, domain modeling, user journey mapping, and technical feasibility audits for high-stakes operational ecosystems.',
          startingPrice: 'From $4,500',
          deliverables: [
            'Service Blueprints & Workflow Schematics',
            'User Journey & Task-Frequency Maps',
            'Technical Feasibility & Ergonomic Audit',
            'Strategic Product Roadmap Formulation',
          ],
          order: 1,
        },
        {
          title: 'UI/UX Design Systems',
          slug: 'ui-ux-design',
          icon: 'Palette',
          description:
            'Scalable multi-brand tokenized UI libraries, typographic hierarchies, and ergonomic micro-interactions crafted with mathematical precision in Figma.',
          startingPrice: 'From $6,800',
          deliverables: [
            'Multi-Platform Design Token Library',
            'Interactive High-Fidelity Prototypes',
            'WCAG 2.1 AAA Accessibility Compliance',
            'Comprehensive Component Specs & States',
          ],
          order: 2,
        },
        {
          title: 'Frontend Production & Handoff',
          slug: 'frontend-handoff',
          icon: 'Code2',
          description:
            'Pixel-perfect Next.js, React, and TypeScript implementation with fluid motion physics, zero design drift, and sub-second performance budgets.',
          startingPrice: 'From $8,500',
          deliverables: [
            'Production-Grade Next.js & TypeScript Code',
            'Interactive Storybook Documentation',
            'Tailored Motion Physics & Micro-Interactions',
            '30-Day Engineering Hypercare & QA Support',
          ],
          order: 3,
        },
      ];

      processSteps = [
        {
          step: '01',
          title: 'Exploration & Alignment',
          subtitle: 'Discovery Sprint',
          description:
            'Deconstruct user mental models, technical constraints, and organizational workflows through intensive stakeholder discovery sessions.',
          duration: 'Week 1',
          order: 1,
        },
        {
          step: '02',
          title: 'Rapid Wireframe & Test',
          subtitle: 'Tactile Prototypes',
          description:
            'Translate ambiguous requirements into clickable low-latency prototypes tested directly against enterprise operators.',
          duration: 'Weeks 2-3',
          order: 2,
        },
        {
          step: '03',
          title: 'Design System Polish',
          subtitle: 'Tokens & Componentry',
          description:
            'Engineer multi-tier design tokens, rigorous typography, dark/light themes, and tactile micro-animations.',
          duration: 'Weeks 4-5',
          order: 3,
        },
        {
          step: '04',
          title: 'Code Handoff & Hypercare',
          subtitle: 'Zero-Drift Deployment',
          description:
            'Deliver modular TypeScript components with automated testing, Storybook documentation, and launch support.',
          duration: 'Week 6',
          order: 4,
        },
      ];

      projects = [
        {
          title: 'Apex Financial OS',
          slug: 'apex-financial-os',
          client: 'Apex Global Capital',
          category: 'FinTech & Real-Time Trading',
          year: '2025',
          tags: ['UX Research', 'Design System', 'React', 'WebGL', 'TypeScript'],
          summary:
            'Reduced complex multi-leg trade execution latency by 64% while onboarding $14B in institutional liquidity across global markets.',
          metrics: [
            { label: 'Execution Latency', value: '-64%' },
            { label: 'Liquidity Onboarded', value: '$14B' },
            { label: 'Daily Active Traders', value: '38,000+' },
          ],
          coverImage:
            'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80',
          liveUrl: 'https://apex.example.com',
          featured: true,
          order: 1,
        },
        {
          title: 'Vortex Autonomous AI',
          slug: 'vortex-ai-platform',
          client: 'Vortex Intelligence',
          category: 'Enterprise AI Orchestration',
          year: '2025',
          tags: ['AI UX', 'Figma Tokens', 'Next.js', 'Interaction Design'],
          summary:
            'Designed an intuitive multi-agent canvas orchestrating autonomous ML pipelines for 450+ enterprise data science organizations.',
          metrics: [
            { label: 'Pipeline Build Time', value: '-72%' },
            { label: 'Enterprise Adoption', value: '+185%' },
            { label: 'User NPS Score', value: '84' },
          ],
          coverImage:
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
          liveUrl: 'https://vortex.example.com',
          featured: true,
          order: 2,
        },
        {
          title: 'Chronos Cloud Observability',
          slug: 'chronos-observability',
          client: 'Chronos Telemetry Inc.',
          category: 'Infrastructure & DevOps',
          year: '2024',
          tags: ['Data Visualization', 'Design System', 'Dashboard UX', 'React'],
          summary:
            'Transformed high-cardinality cloud telemetry data into dense, readable root-cause diagnosis graphs with 0.2s render time.',
          metrics: [
            { label: 'Mean Time To Detect', value: '-45%' },
            { label: 'Telemetry Render Time', value: '0.2s' },
            { label: 'Enterprise ARR', value: '$28M' },
          ],
          coverImage:
            'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
          liveUrl: 'https://chronos.example.com',
          featured: true,
          order: 3,
        },
        {
          title: 'Aether Medical Diagnostics',
          slug: 'aether-diagnostics',
          client: 'Aether Health Systems',
          category: 'HealthTech & Radiology',
          year: '2024',
          tags: ['UX Research', 'FDA Compliance', 'Design Tokens', 'React'],
          summary:
            'Engineered an FDA-compliant radiology viewer and diagnostic triage interface enabling clinicians to detect micro-anomalies 3x faster.',
          metrics: [
            { label: 'Triage Speed', value: '3.2x Faster' },
            { label: 'Diagnostic Accuracy', value: '99.4%' },
            { label: 'Hospitals Deployed', value: '120+' },
          ],
          coverImage:
            'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
          liveUrl: 'https://aether.example.com',
          featured: true,
          order: 4,
        },
      ];
    }

    res.status(200).json({
      success: true,
      data: {
        profile,
        services,
        processSteps,
        projects,
      },
    });
  });

  /**
   * @route   GET /api/v1/portfolio/projects
   * @desc    Get all case studies
   * @access  Public
   */
  public getProjects = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const projects = await Project.find().sort({ order: 1 }).lean();

    res.status(200).json({
      success: true,
      data: projects,
    });
  });

  /**
   * @route   GET /api/v1/portfolio/projects/:slug
   * @desc    Get single project by slug
   * @access  Public
   */
  public getProjectBySlug = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.params;
    const project = await Project.findOne({ slug: slug.toLowerCase() }).lean();

    if (!project) {
      throw ApiError.notFound(`Project '${slug}' not found`);
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  });

  /**
   * @route   POST /api/v1/portfolio/contact
   * @desc    Submit a client contract or consultation inquiry
   * @access  Public
   */
  public submitContact = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const parseResult = contactSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      throw ApiError.badRequest('Validation Error', errors);
    }

    const inquiry = await ContactInquiry.create(parseResult.data);

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! Your inquiry has been received and I will reply within 24 hours.',
      data: {
        id: inquiry._id,
        createdAt: inquiry.createdAt,
      },
    });
  });
}

export const portfolioController = new PortfolioController();
