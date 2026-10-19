import { Product, ProductFeature, ProductPlan, ProductFaq } from './productsApi';
import { generateSlug } from './productsApi';

export interface AiProductInput {
  title: string;
  totalInfo: string;
  category?: string;
  productType?: string;
}

export interface AiGeneratedProductData {
  name: string;
  slug: string;
  short_description: string;
  description: string;
  category: string;
  product_type: string;
  pricing_model: string;
  currency: string;
  starting_price: number;
  monthly_price: number;
  annual_price: number;
  trial_available: boolean;
  trial_days: number;
  setup_fee: number;
  pricing_notes: string;
  display_price: boolean;
  is_featured: boolean;
  seo_title: string;
  seo_description: string;
  brand_color?: string;
  card_color?: string;
  features: ProductFeature[];
  benefits: string[];
  plans: ProductPlan[];
  specifications: {
    deployment: string;
    platforms: string;
    devices: string;
    integrations: string;
  };
  faqs: ProductFaq[];
}

/**
 * Intelligent domain classification based on title and user provided notes
 */
function detectDomain(text: string): {
  category: string;
  productType: string;
  brandColor: string;
  cardColor: string;
  iconSet: string[];
} {
  const t = text.toLowerCase();

  if (t.includes('kirana') || t.includes('grocery') || t.includes('retail') || t.includes('supermarket') || t.includes('pos') || t.includes('store') || t.includes('billing')) {
    return {
      category: 'Retail & Kirana Billing Software',
      productType: 'SaaS / Business Software',
      brandColor: '#10b981', // Emerald green
      cardColor: '#071b13',
      iconSet: ['Zap', 'Layers', 'Scan', 'Printer', 'BarChart3', 'Users', 'ShieldCheck', 'Smartphone']
    };
  }

  if (t.includes('crm') || t.includes('sales') || t.includes('lead') || t.includes('pipeline') || t.includes('client') || t.includes('customer relationship')) {
    return {
      category: 'CRM & Sales Automation',
      productType: 'Enterprise Cloud Platform',
      brandColor: '#00e5ff', // Cyan
      cardColor: '#071622',
      iconSet: ['Users', 'Zap', 'BarChart3', 'MessageSquare', 'PhoneCall', 'ShieldCheck', 'Database', 'Sparkles']
    };
  }

  if (t.includes('erp') || t.includes('supply chain') || t.includes('inventory') || t.includes('warehouse') || t.includes('manufacturing')) {
    return {
      category: 'ERP & Operations',
      productType: 'Enterprise Cloud ERP',
      brandColor: '#6366f1', // Indigo
      cardColor: '#0e0e24',
      iconSet: ['Layers', 'Database', 'ShieldCheck', 'BarChart3', 'Zap', 'Server', 'FileText', 'Clock']
    };
  }

  if (t.includes('hospital') || t.includes('clinic') || t.includes('health') || t.includes('doctor') || t.includes('patient') || t.includes('pharma') || t.includes('medical')) {
    return {
      category: 'Healthcare & Clinical Software',
      productType: 'Healthcare SaaS Platform',
      brandColor: '#06b6d4', // Teal/Cyan
      cardColor: '#06171d',
      iconSet: ['ShieldCheck', 'Users', 'FileText', 'Clock', 'Database', 'Zap', 'Smartphone', 'Lock']
    };
  }

  if (t.includes('school') || t.includes('college') || t.includes('education') || t.includes('student') || t.includes('learning') || t.includes('lms') || t.includes('edtech')) {
    return {
      category: 'Education & Campus Management',
      productType: 'EdTech Cloud Platform',
      brandColor: '#f59e0b', // Amber
      cardColor: '#1f1606',
      iconSet: ['BookOpen', 'Users', 'Calendar', 'BarChart3', 'Smartphone', 'ShieldCheck', 'Award', 'Zap']
    };
  }

  if (t.includes('restaurant') || t.includes('cafe') || t.includes('hotel') || t.includes('kitchen') || t.includes('food') || t.includes('kot')) {
    return {
      category: 'Hospitality & Restaurant POS',
      productType: 'SaaS / Restaurant Management',
      brandColor: '#f97316', // Orange
      cardColor: '#1e0f06',
      iconSet: ['Coffee', 'Printer', 'Zap', 'Smartphone', 'BarChart3', 'Users', 'Clock', 'CreditCard']
    };
  }

  if (t.includes('real estate') || t.includes('property') || t.includes('builder') || t.includes('broker') || t.includes('proptech') || t.includes('tenant')) {
    return {
      category: 'Real Estate & PropTech Solutions',
      productType: 'PropTech SaaS',
      brandColor: '#3b82f6', // Blue
      cardColor: '#081426',
      iconSet: ['Building2', 'Users', 'FileText', 'BarChart3', 'Key', 'ShieldCheck', 'Smartphone', 'Zap']
    };
  }

  // Default Tech / SaaS
  return {
    category: 'Enterprise SaaS & Business Automation',
    productType: 'Cloud SaaS Application',
    brandColor: '#00e5ff',
    cardColor: '#0b101d',
    iconSet: ['Zap', 'Layers', 'ShieldCheck', 'BarChart3', 'Database', 'Server', 'Smartphone', 'Sparkles']
  };
}

/**
 * Clean and summarize input lines
 */
function extractUserKeyPoints(totalInfo: string): string[] {
  return totalInfo
    .split(/\n|,|\./)
    .map(s => s.trim())
    .filter(s => s.length > 8 && !s.toLowerCase().startsWith('http'));
}

/**
 * Generate full comprehensive product dataset based on Title and Total Info
 */
export async function generateProductWithAI(input: AiProductInput): Promise<AiGeneratedProductData> {
  const title = input.title.trim();
  const rawInfo = (input.totalInfo || '').trim();
  const combinedText = `${title} ${rawInfo} ${input.category || ''}`;
  const domain = detectDomain(combinedText);

  // Generate slug
  const baseSlug = generateSlug(title || 'digital-solution');
  const slug = baseSlug || `product-${Date.now().toString().slice(-4)}`;

  const keyPoints = extractUserKeyPoints(rawInfo);

  // Craft high-converting short description
  let short_description = '';
  if (keyPoints.length > 0) {
    short_description = `${title} is an enterprise-grade platform engineered to ${keyPoints[0].toLowerCase().replace(/^(to|and|for)\s+/i, '')}. Fast, scalable, and optimized for real-time operations.`;
  } else {
    short_description = `${title} is a modern, high-performance software solution designed to streamline daily business operations, automate workflows, and accelerate enterprise growth.`;
  }

  // Craft multi-paragraph executive description
  const description = `${title} is a next-generation software platform purpose-built for modern business organizations seeking operational excellence and automation.

${rawInfo ? `Executive Overview & Scope:\n${rawInfo}\n\n` : ''}Key Problem Solved:
Organizations frequently struggle with disconnected tools, manual data reconciliation, and delayed decision-making. ${title} centralizes core workflows into a unified, secure dashboard, enabling stakeholders to monitor performance, minimize errors, and deliver exceptional service to customers.

Architecture & Scale:
Engineered with modern cloud architecture, robust database encryption, and intuitive responsive interfaces, ${title} guarantees high availability, rapid response times, and seamless multi-user collaboration across web and mobile touchpoints.`;

  // Build 6 to 8 tailored features
  const defaultFeaturesTemplate = [
    {
      title: 'High-Speed Operations & Automation',
      desc: `Streamline repetitive workflows and boost daily task throughput by up to 60% with intuitive controls and real-time processing.`
    },
    {
      title: 'Comprehensive Data Management & Tracking',
      desc: `Maintain end-to-end auditability and records with instant lookup, filters, and automated cloud sync.`
    },
    {
      title: 'Real-Time Analytics & Executive Reporting',
      desc: `Access interactive dashboards, revenue indicators, margin breakdowns, and exportable business intelligence reports.`
    },
    {
      title: 'Role-Based Access & Security Governance',
      desc: `Enforce granular user permissions, audit trails, and multi-factor security across all staff terminals.`
    },
    {
      title: 'Multi-Device & Mobile Synchronization',
      desc: `Access critical tools anywhere on desktop, tablets, or smartphones with instant bidirectional cloud replication.`
    },
    {
      title: 'Ecosystem & Peripheral Integrations',
      desc: `Plug-and-play compatibility with standard hardware, thermal receipt printers, scanners, and external third-party APIs.`
    },
    {
      title: 'Automated Notifications & Reminders',
      desc: `Keep customers and internal teams synchronized with automated WhatsApp, SMS, and email status updates.`
    },
    {
      title: 'Offline-First Reliability & Fast Failover',
      desc: `Continue seamless billing and operational workflows uninterrupted even during temporary network outages.`
    }
  ];

  // If user provided specific bullet points, integrate them into the top features!
  const features: ProductFeature[] = [];
  const totalFeatureSlots = 8;

  for (let i = 0; i < totalFeatureSlots; i++) {
    const iconName = domain.iconSet[i % domain.iconSet.length];
    if (i < keyPoints.length && keyPoints[i].length > 15) {
      // Use user's key point
      const pt = keyPoints[i];
      const titleWords = pt.split(' ').slice(0, 5).join(' ');
      features.push({
        id: `feat-${i + 1}`,
        title: titleWords.charAt(0).toUpperCase() + titleWords.slice(1),
        description: pt.length > 40 ? pt : `${pt}. Designed for speed, reliability, and automated compliance.`,
        icon: iconName,
        display_order: i + 1
      });
    } else {
      const template = defaultFeaturesTemplate[i % defaultFeaturesTemplate.length];
      features.push({
        id: `feat-${i + 1}`,
        title: template.title,
        description: template.desc,
        icon: iconName,
        display_order: i + 1
      });
    }
  }

  // Business benefits
  const benefits = [
    `Accelerate operational throughput and reduce turnaround times by up to 65%`,
    `Eliminate manual paperwork, bookkeeping mismatches, and revenue leakages`,
    `Ensure 100% data audit compliance with bank-grade encryption and secure backups`,
    `Scale effortlessly from single-branch operations to enterprise multi-location deployments`,
    `Zero deployment friction with 24/7 technical onboarding and assisted rollout`
  ];

  // Pricing Plans (3 tiers)
  const isRetail = domain.category.includes('Retail') || domain.category.includes('Kirana') || domain.category.includes('Restaurant');
  const basePrice = isRetail ? 1999 : 4999;

  const plans: ProductPlan[] = [
    {
      id: 'plan-basic',
      plan_name: 'Starter Edition',
      price: basePrice,
      currency: 'INR',
      billing_interval: 'month',
      is_featured: false,
      cta_label: 'Get Started',
      cta_destination: 'quote',
      features: [
        'Single Store / Branch License',
        'Up to 3 Active Cashier / Staff Logins',
        'Standard Billing & Record Tracking',
        'Daily Revenue & Sales PDF Reports',
        'Standard Email & Chat Support'
      ]
    },
    {
      id: 'plan-pro',
      plan_name: 'Professional / Growth',
      price: Math.round(basePrice * 2.5),
      currency: 'INR',
      billing_interval: 'month',
      is_featured: true,
      cta_label: 'Most Popular',
      cta_destination: 'demo',
      features: [
        'Multi-Terminal & Multi-Counter Support',
        'Unlimited Staff Accounts with Granular Roles',
        'Barcode, Thermal Printer & Hardware Integration',
        'Advanced Analytics & GST Tax Export',
        'WhatsApp & SMS Customer Alerts',
        'Priority Phone & Remote Setup Support'
      ]
    },
    {
      id: 'plan-enterprise',
      plan_name: 'Enterprise Custom',
      price: Math.round(basePrice * 6),
      currency: 'INR',
      billing_interval: 'month',
      is_featured: false,
      cta_label: 'Contact Enterprise',
      cta_destination: 'quote',
      features: [
        'Unlimited Multi-Branch & Chain Rollout',
        'Dedicated Private Cloud / On-Premise Server',
        'Custom ERP & Warehouse API Integrations',
        'Customized Module Development',
        'Dedicated Account Manager & 24/7 SLA'
      ]
    }
  ];

  // Specifications
  const specifications = {
    deployment: 'Cloud SaaS (Mumbai Data Center) / Optional Hybrid On-Premise Deployment',
    platforms: 'Windows 10/11, macOS, Ubuntu Linux, Android 10+, Progressive Web App (PWA)',
    devices: 'Desktop Computers, POS Touchscreen Terminals, Android Tablets, Barcode Handhelds',
    integrations: 'USB/Bluetooth Thermal Printers (58mm/80mm), 1D/2D Barcode Scanners, Electronic Cash Drawers, UPI Soundboxes'
  };

  // Structured FAQs
  const faqs: ProductFaq[] = [
    {
      id: 'faq-1',
      question: `How quickly can ${title} be deployed in our business?`,
      answer: `${title} is cloud-ready and can be configured within 24 to 48 hours. Our technical team assists with data import from Excel or existing legacy software to ensure zero operational downtime.`,
      display_order: 1
    },
    {
      id: 'faq-2',
      question: `Does ${title} require active internet to function?`,
      answer: `The platform features smart offline-first synchronization. Critical checkout and transaction workflows operate locally without interruptions and automatically sync with the cloud once connectivity resumes.`,
      display_order: 2
    },
    {
      id: 'faq-3',
      question: `Can we request custom modules or features tailored to our workflows?`,
      answer: `Yes. As Digi8 Solutions is a full-stack engineering firm, we provide end-to-end customization, hardware integration, and proprietary module development upon request.`,
      display_order: 3
    },
    {
      id: 'faq-4',
      question: `What kind of training and after-sales support is provided?`,
      answer: `Every license includes dedicated remote staff onboarding, video documentation, telephone support, and ongoing software security updates at no additional charge.`,
      display_order: 4
    }
  ];

  return {
    name: title,
    slug,
    short_description,
    description,
    category: input.category || domain.category,
    product_type: input.productType || domain.productType,
    pricing_model: 'Tiered Pricing',
    currency: 'INR',
    starting_price: basePrice,
    monthly_price: basePrice,
    annual_price: basePrice * 10,
    trial_available: true,
    trial_days: 14,
    setup_fee: 0,
    pricing_notes: 'Includes free cloud data sync, automated daily backups, and free software updates.',
    display_price: true,
    is_featured: true,
    seo_title: `${title} — ${domain.category} | Digi8 Solutions`,
    seo_description: short_description.slice(0, 155),
    brand_color: domain.brandColor,
    card_color: domain.cardColor,
    features,
    benefits,
    plans,
    specifications,
    faqs
  };
}
