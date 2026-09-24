import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';
import {
  Profile,
  Service,
  ProcessStep,
  Project,
} from '../models/portfolio.model';

export const seedData = async (): Promise<void> => {
  console.log('🌱 Starting Portfolio Database Seeding...');

  // Connect to DB if not connected
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }

  // Clear existing collections
  await Promise.all([
    Profile.deleteMany({}),
    Service.deleteMany({}),
    ProcessStep.deleteMany({}),
    Project.deleteMany({}),
  ]);

  console.log('🧹 Cleared existing portfolio collections.');

  // 1. Seed Profile
  await Profile.create({
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
  console.log('✅ Seeded Profile');

  // 2. Seed Services
  await Service.create([
    {
      title: 'Discovery & Architecture Strategy',
      slug: 'discovery',
      icon: 'Compass',
      description:
        'Deep stakeholder discovery, domain modeling, user journey mapping, and technical feasibility audits for high-stakes operational ecosystems.',
      startingPrice: '$4,500',
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
      startingPrice: '$6,800',
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
      startingPrice: '$8,500',
      deliverables: [
        'Production-Grade Next.js & TypeScript Code',
        'Interactive Storybook Documentation',
        'Tailored Motion Physics & Micro-Interactions',
        '30-Day Engineering Hypercare & QA Support',
      ],
      order: 3,
    },
  ]);
  console.log('✅ Seeded Services');

  // 3. Seed Process Steps (4-step horizontal process flow)
  await ProcessStep.create([
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
  ]);
  console.log('✅ Seeded Process Steps');

  // 4. Seed Projects (Case Studies)
  await Project.create([
    {
      title: 'Apex Financial OS',
      slug: 'apex-financial-os',
      client: 'Apex Global Capital',
      category: 'FinTech & Real-Time Trading',
      year: '2025',
      tags: ['UX Research', 'Design System', 'React', 'WebGL', 'TypeScript'],
      summary:
        'Reduced complex multi-leg trade execution latency by 64% while onboarding $14B in institutional liquidity across global markets.',
      challenge:
        'Institutional desks relied on disjointed legacy software with 4+ second quote latency and frequent execution errors.',
      solution:
        'Engineered an ultra-dense, keyboard-first financial terminal with WebGL order-book visualizations and synchronized real-time state.',
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
      challenge:
        'Machine learning engineers lacked visual observability into multi-agent decision chains and token expenditure.',
      solution:
        'Created a tactile spatial canvas with live telemetry, branching visual debugging, and semantic node inspectors.',
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
      challenge:
        'DevOps engineers faced alerting fatigue caused by cluttered telemetry charts and slow queries over petabyte datasets.',
      solution:
        'Formulated a modular chart componentry system with predictive anomaly highlighting and contextual log correlation.',
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
      challenge:
        'Radiologists experienced severe visual fatigue navigating non-standard DICOM interfaces under urgent triage deadlines.',
      solution:
        'Engineered a calibrated monochrome high-contrast dark theme with 10-bit color accuracy and adaptive shortcut ergonomics.',
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
  ]);
  console.log('✅ Seeded Projects');

  console.log('🎉 Portfolio Database seeding completed successfully!');
};

// Execute if run directly
if (require.main === module) {
  seedData()
    .then(async () => {
      await disconnectDB();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('❌ Seeding failed:', err);
      await disconnectDB();
      process.exit(1);
    });
}
