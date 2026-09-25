/**
 * Digi-8 Solutions — AI Job Description & Key Roles Generator
 * Intelligent synthesis engine for enterprise technology & business job postings.
 */

export interface GeneratedJobSpec {
  title: string;
  category: string;
  jobType: string;
  workMode: string;
  experience: string;
  shortDescription: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  suggestedCompensation?: string;
}

export interface PresetRole {
  title: string;
  category: string;
  defaultExperience: string;
  skills: string[];
  shortDescription: string;
  responsibilities: string[];
  requirements: string[];
}

export const PRESET_ROLES: PresetRole[] = [
  {
    title: "Senior Full Stack Developer",
    category: "Engineering",
    defaultExperience: "4+ Years",
    skills: ["React", "TypeScript", "Node.js", "Express", "MySQL", "Tailwind CSS", "RESTful APIs", "Docker", "Git"],
    shortDescription: "Join Digi-8 Solutions as a Senior Full Stack Developer to architect resilient web applications, scale cloud APIs, and build reactive enterprise user interfaces.",
    responsibilities: [
      "Architect, develop, and maintain responsive web applications using React, TypeScript, and Tailwind CSS.",
      "Design, build, and optimize scalable RESTful API services and microservices using Node.js and Express.",
      "Design high-performance database schemas, optimize SQL queries, and implement indexing strategies in MySQL.",
      "Collaborate cross-functionally with UI/UX designers, product managers, and cloud engineers in agile sprint cycles.",
      "Conduct thorough code reviews, enforce strict security standards, and mentor mid-level and junior developers.",
      "Implement automated CI/CD pipelines, containerization with Docker, and automated end-to-end testing suites."
    ],
    requirements: [
      "4+ years of professional full-stack development experience with modern JavaScript / TypeScript ecosystems.",
      "Strong proficiency with React (Hooks, Context, State Management) and Node.js backend architecture.",
      "Demonstrated experience designing relational databases (MySQL, PostgreSQL) and writing optimized queries.",
      "Deep understanding of web security best practices (JWT, OAuth, CORS, CSRF, rate-limiting, and encryption).",
      "Hands-on experience with Git version control, GitHub Actions, and Linux / Ubuntu server environments.",
      "Bachelor's or Master's degree in Computer Science, Software Engineering, or equivalent practical experience."
    ]
  },
  {
    title: "Frontend Architect & UI Engineer",
    category: "Engineering",
    defaultExperience: "5+ Years",
    skills: ["React 18", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "Design Systems", "Web Vitals", "PWA"],
    shortDescription: "Lead front-end engineering at Digi-8 Solutions, crafting ultra-responsive, accessible, and high-performance digital experiences for global clients.",
    responsibilities: [
      "Spearhead front-end architecture, establishing component libraries, design systems, and frontend best practices.",
      "Translate high-fidelity Figma mockups into pixel-perfect, accessible, and fluidly animated web applications.",
      "Optimize Core Web Vitals, page rendering pipelines, asset bundling, and code splitting for maximum speed.",
      "Build Progressive Web App (PWA) capabilities including offline service workers, push notifications, and local caching.",
      "Ensure cross-browser compatibility, responsive typography, and mobile-first touch ergonomics.",
      "Work closely with backend teams to integrate GraphQL and REST API contracts efficiently."
    ],
    requirements: [
      "5+ years of extensive frontend software development experience with React and TypeScript.",
      "Expertise in modern CSS paradigms, Tailwind CSS, CSS-in-JS, and animation libraries (Framer Motion, GSAP).",
      "Deep understanding of browser rendering lifecycle, DOM optimization, and client-side performance auditing.",
      "Experience creating and maintaining reusable component libraries and design tokens.",
      "Excellent eye for micro-interactions, layout aesthetics, typography, and human-computer interaction (HCI)."
    ]
  },
  {
    title: "Backend & Cloud API Specialist",
    category: "Engineering",
    defaultExperience: "3+ Years",
    skills: ["Node.js", "Python", "Express", "FastAPI", "MySQL", "Redis", "Docker", "AWS / VPS", "WebSockets / SSE"],
    shortDescription: "Engineer resilient backend systems, real-time event streaming pipelines, and secure cloud microservices for Digi-8 Solutions clients.",
    responsibilities: [
      "Develop robust, fault-tolerant backend services and APIs handling millions of transactional events.",
      "Implement real-time streaming architectures using WebSockets and Server-Sent Events (SSE).",
      "Manage database migrations, connection pooling, automated backups, and zero-downtime schema deployments.",
      "Enforce API authentication, role-based access control (RBAC), data sanitation, and cryptographic hashing.",
      "Monitor application performance, server logs, latency bottlenecks, and error tracking with PM2 and Prometheus.",
      "Configure and maintain cloud infrastructure, reverse proxies (Nginx), and SSL/TLS certificate lifecycles."
    ],
    requirements: [
      "3+ years of backend engineering experience with Node.js/Express, Python, or Go.",
      "Proficient in relational databases (MySQL, PostgreSQL) and in-memory caches (Redis).",
      "Strong understanding of REST architectural principles, asynchronous programming, and message queues.",
      "Experience deploying on Linux VPS (Ubuntu), configuring Nginx, and process management with PM2.",
      "Strong analytical mindset and proven troubleshooting capabilities under high server load."
    ]
  },
  {
    title: "AI & Machine Learning Engineer",
    category: "Engineering",
    defaultExperience: "3+ Years",
    skills: ["Python", "PyTorch", "OpenAI / Gemini APIs", "LangChain", "Vector Databases", "RAG", "NLP", "FastAPI"],
    shortDescription: "Drive innovation at Digi-8 Solutions by architecting GenAI pipelines, conversational assistants, and proprietary machine learning models.",
    responsibilities: [
      "Design, build, and deploy generative AI applications, agentic workflows, and retrieval-augmented generation (RAG) systems.",
      "Integrate state-of-the-art LLMs (Gemini, Claude, GPT) via vector databases (Pinecone, ChromaDB, PGVector).",
      "Fine-tune pre-trained models on specialized enterprise datasets and establish evaluation benchmarks.",
      "Develop high-throughput REST APIs and asynchronous workers to serve model predictions in real-time.",
      "Implement prompt engineering pipelines, guardrails, latency optimizations, and hallucination reduction strategies.",
      "Collaborate with product teams to discover and launch novel AI-powered business tools."
    ],
    requirements: [
      "3+ years in software engineering with at least 2 years focused on applied machine learning and GenAI.",
      "Strong Python programming skills and familiarity with deep learning frameworks (PyTorch, Hugging Face).",
      "Demonstrated experience building production applications with LLMs, prompt orchestration, and vector search.",
      "Understanding of token economics, inference optimization, embedding dimensions, and semantic chunking.",
      "Strong background in mathematics, statistics, computer science, or equivalent technical discipline."
    ]
  },
  {
    title: "Cloud DevOps & Infrastructure Engineer",
    category: "Infrastructure",
    defaultExperience: "4+ Years",
    skills: ["Linux / Ubuntu", "Docker", "Kubernetes", "AWS / GCP", "CI/CD", "GitHub Actions", "Nginx", "Terraform", "Monitoring"],
    shortDescription: "Architect, automate, and safeguard the mission-critical cloud infrastructure and continuous deployment pipelines of Digi-8 Solutions.",
    responsibilities: [
      "Design and maintain high-availability cloud infrastructure across AWS, DigitalOcean, and dedicated VPS nodes.",
      "Build and optimize automated CI/CD deployment pipelines using GitHub Actions, Docker, and bash scripting.",
      "Administer Linux servers, configure reverse proxies (Nginx), firewall rules (UFW), and automated SSL cert renewals.",
      "Implement real-time server health monitoring, alerting, telemetry dashboards, and incident response runbooks.",
      "Manage database replication, automated offsite snapshot schedules, and disaster recovery testing.",
      "Audit cloud configurations for enterprise security compliance, least-privilege IAM, and cost efficiency."
    ],
    requirements: [
      "4+ years of professional DevOps / SysAdmin / SRE experience supporting production environments.",
      "Advanced knowledge of Linux administration (Ubuntu/Debian), systemd services, SSH hardening, and networking.",
      "Expertise in containerization with Docker and automated deployment orchestration.",
      "Proficiency writing automated scripts in Bash and Python.",
      "Experience managing production databases (MySQL/PostgreSQL) and reverse proxies (Nginx)."
    ]
  },
  {
    title: "UI/UX & Product Designer",
    category: "Design",
    defaultExperience: "3+ Years",
    skills: ["Figma", "UI/UX Design", "Wireframing", "Design Systems", "Prototyping", "User Research", "Micro-Interactions"],
    shortDescription: "Craft captivating, intuitive, and modern enterprise digital products and branding experiences for Digi-8 Solutions and our global partners.",
    responsibilities: [
      "Lead end-to-end product design from initial wireframes and discovery user flows to high-fidelity clickable prototypes.",
      "Develop and maintain comprehensive design systems, component tokens, color theory, and typography hierarchies in Figma.",
      "Conduct user research, usability testing, and heat-map analyses to identify and eliminate product friction.",
      "Work side-by-side with frontend engineers to ensure design fidelity and micro-interactive animation accuracy.",
      "Design captivating brand identities, marketing collateral, presentation decks, and executive dashboard interfaces.",
      "Stay ahead of cutting-edge design trends including glassmorphism, neo-brutalism, and sleek dark-mode aesthetics."
    ],
    requirements: [
      "3+ years of professional UI/UX design experience with a standout portfolio of web and mobile products.",
      "Mastery of Figma (Auto Layout, Component Variants, Interactive Components, and Token Libraries).",
      "Deep understanding of user-centered design principles, typography, visual hierarchy, and accessibility (WCAG).",
      "Experience collaborating closely with software development teams and understanding frontend constraints.",
      "Exceptional communication skills and ability to articulate design decisions to executive stakeholders."
    ]
  },
  {
    title: "Digital Marketing & Growth Manager",
    category: "Marketing",
    defaultExperience: "3+ Years",
    skills: ["SEO", "Content Strategy", "Google Ads", "Meta Ads", "LinkedIn Marketing", "HubSpot", "Google Analytics 4", "Conversion Rate Optimization"],
    shortDescription: "Spearhead multi-channel digital acquisition, inbound lead generation, and brand visibility strategies for Digi-8 Solutions.",
    responsibilities: [
      "Develop and execute high-converting digital marketing campaigns across Google Search, LinkedIn, and Meta Ads.",
      "Conduct comprehensive SEO audits, keyword research, and on-page/off-page optimizations to rank in top search results.",
      "Manage outbound email sequences, newsletter campaigns, lead nurturing funnels, and conversion landing pages.",
      "Analyze full-funnel marketing telemetry in GA4, tracking customer acquisition costs (CAC) and return on ad spend (ROAS).",
      "Collaborate with the design team to produce compelling ad creatives, case study one-pagers, and lead magnets.",
      "Drive marketing automation workflows and CRM synchronization to hand off qualified prospects to sales."
    ],
    requirements: [
      "3+ years of hands-on digital marketing and growth experience, preferably in B2B tech or agency environments.",
      "Demonstrated track record of scaling inbound organic traffic and running profitable paid performance campaigns.",
      "Proficiency with SEO tools (Ahrefs, SEMrush, Screaming Frog) and analytics platforms (Google Analytics 4, Tag Manager).",
      "Strong copywriting chops and ability to distill complex tech solutions into crisp, compelling value propositions.",
      "Data-driven mindset with strong analytical skills and experimental A/B testing methodology."
    ]
  },
  {
    title: "Enterprise B2B Sales Executive",
    category: "Sales",
    defaultExperience: "3+ Years",
    skills: ["Enterprise Sales", "B2B Outreach", "Contract Negotiation", "Lead Qualification", "CRM Management", "Solution Selling"],
    shortDescription: "Drive commercial revenue growth by engaging corporate leaders, understanding technology needs, and closing high-value digital transformation contracts.",
    responsibilities: [
      "Identify, prospect, and engage C-suite and executive decision-makers across target industry verticals.",
      "Conduct deep discovery consultations to diagnose clients' digital bottlenecks and present Digi-8 tailored solutions.",
      "Prepare and present compelling technical proposals, executive slide decks, and customized project quotes.",
      "Lead contract negotiations, pricing discussions, statement-of-work (SOW) structuring, and deal closures.",
      "Maintain rigorous CRM pipeline hygiene, forecasting accuracy, and lead progression milestones.",
      "Collaborate with engineering and delivery leads to ensure seamless project kickoff and client onboarding."
    ],
    requirements: [
      "3+ years of proven success in B2B technology sales, SaaS, or digital agency business development.",
      "Track record of consistently meeting or exceeding quarterly quotas and closing 5-to-6 figure contracts.",
      "Superb verbal presentation, written proposal, and interpersonal negotiation skills.",
      "Ability to comfortably discuss technology solutions (web, mobile, cloud, AI, cyber security) with technical stakeholders.",
      "Self-motivated, high-energy hunter mindset with disciplined follow-up habits."
    ]
  },
  {
    title: "Cyber Security & Compliance Analyst",
    category: "Infrastructure",
    defaultExperience: "3+ Years",
    skills: ["Penetration Testing", "Vulnerability Assessment", "SOC 2 / ISO 27001", "OWASP Top 10", "Network Security", "Incident Response"],
    shortDescription: "Safeguard client digital infrastructure, conduct rigorous penetration testing, and establish enterprise compliance standards at Digi-8 Solutions.",
    responsibilities: [
      "Perform vulnerability assessments, ethical penetration tests, and static/dynamic application security testing (SAST/DAST).",
      "Review source code, API authentication schemes, database queries, and cloud configurations against OWASP Top 10 standards.",
      "Implement security hardening protocols across Linux VPS servers, firewalls, reverse proxies, and database instances.",
      "Assist in preparing and auditing client platforms for compliance certifications (SOC 2, ISO 27001, GDPR).",
      "Develop incident response plans, monitor intrusion detection telemetry, and investigate security anomalies.",
      "Conduct internal security awareness training and educate developer teams on secure coding principles."
    ],
    requirements: [
      "3+ years of experience in information security, ethical hacking, or IT compliance auditing.",
      "Familiarity with industry security tools (Burp Suite, Wireshark, Nmap, Metasploit, Nessus).",
      "Solid understanding of network protocols, cryptographic ciphers, SSL/TLS, and modern web application vulnerabilities.",
      "Relevant industry certifications (CEH, CompTIA Security+, CISSP, OSCP) are highly regarded.",
      "Strong documentation skills and ability to present actionable remediation reports to technical teams."
    ]
  },
  {
    title: "Technical Project Manager / Scrum Master",
    category: "Support",
    defaultExperience: "4+ Years",
    skills: ["Agile / Scrum", "Jira / Trello", "Sprint Planning", "Client Communications", "Risk Management", "Resource Allocation"],
    shortDescription: "Orchestrate agile delivery, unblock cross-functional engineering teams, and guarantee on-time, high-quality client deliverables.",
    responsibilities: [
      "Facilitate agile ceremonies including daily standups, sprint planning, backlog grooming, and sprint retrospectives.",
      "Serve as the primary liaison between client stakeholders and internal engineering/design teams.",
      "Define project scope, detailed milestone schedules, acceptance criteria, and resource allocation plans.",
      "Proactively identify technical roadblocks, scope creep, and delivery risks, executing timely mitigations.",
      "Track project velocity, budget burn-down, and deliverable quality against agreed statement-of-work (SOW) terms.",
      "Foster a collaborative, transparent, and high-performance team culture."
    ],
    requirements: [
      "4+ years of technical project management experience delivering software and digital products.",
      "Strong knowledge of Agile, Scrum, and Kanban methodologies with Scrum Master certification (CSM/PSM preferred).",
      "Familiarity with software development lifecycle (SDLC) and ability to converse intelligently with engineers.",
      "Exceptional client-facing communication, stakeholder management, and conflict resolution skills.",
      "Proficiency with modern project management tooling (Jira, Confluence, Linear, Notion)."
    ]
  },
  {
    title: "HR & Talent Acquisition Lead",
    category: "Support",
    defaultExperience: "3+ Years",
    skills: ["Talent Sourcing", "Technical Recruitment", "ATS Management", "Employee Onboarding", "HR Policies", "Culture Building"],
    shortDescription: "Champion talent recruitment, manage the hiring pipeline, and nurture our thriving engineering and creative culture at Digi-8 Solutions.",
    responsibilities: [
      "Manage end-to-end recruitment lifecycle from job posting, proactive candidate sourcing, and screening to final offer rollout.",
      "Source exceptional engineering, design, marketing, and sales talent across LinkedIn, GitHub, and industry networks.",
      "Maintain and optimize our Applicant Tracking System (ATS), interview scorecards, and candidate communications.",
      "Conduct preliminary HR screenings, culture-fit evaluations, and compensation negotiations.",
      "Design seamless onboarding journeys for new team members and organize continuous learning initiatives.",
      "Develop progressive HR policies, performance review frameworks, and employee retention strategies."
    ],
    requirements: [
      "3+ years of technical recruitment or human resources experience in fast-moving technology companies.",
      "Proven ability to source and attract specialized software developers, UI designers, and executive talent.",
      "Deep understanding of market compensation benchmarks and employment compliance laws.",
      "Outstanding empathetic communication, active listening, and relationship-building capabilities.",
      "Bachelor's degree in Human Resources, Psychology, Business Administration, or related field."
    ]
  }
];

/**
 * Intelligent AI Generator function that synthesizes a full Job Specification
 */
export function generateJobWithAI(params: {
  title: string;
  category?: string;
  experience?: string;
  workMode?: string;
  jobType?: string;
  customInstructions?: string;
}): GeneratedJobSpec {
  const { title, category, experience, workMode, jobType, customInstructions } = params;
  const cleanTitle = (title || "").trim();

  // 1. Check for exact or close match in preset roles
  const matchedPreset = PRESET_ROLES.find(
    p => p.title.toLowerCase() === cleanTitle.toLowerCase() ||
         cleanTitle.toLowerCase().includes(p.title.toLowerCase()) ||
         p.title.toLowerCase().includes(cleanTitle.toLowerCase())
  );

  const finalCategory = category || (matchedPreset ? matchedPreset.category : detectCategory(cleanTitle));
  const finalExp = experience || (matchedPreset ? matchedPreset.defaultExperience : "3+ Years");
  const finalWorkMode = workMode || "Remote";
  const finalJobType = jobType || "Full-time";

  // If a preset was closely matched, customize it with parameters
  if (matchedPreset) {
    const customizedShort = matchedPreset.shortDescription
      .replace(/Digi-8 Solutions/g, "Digi-8 Solutions")
      .trim();

    const fullDescription = composeFullDescription({
      title: cleanTitle || matchedPreset.title,
      category: finalCategory,
      experience: finalExp,
      workMode: finalWorkMode,
      jobType: finalJobType,
      shortDesc: customizedShort,
      customInstructions
    });

    return {
      title: cleanTitle || matchedPreset.title,
      category: finalCategory,
      jobType: finalJobType,
      workMode: finalWorkMode,
      experience: finalExp,
      shortDescription: customizedShort,
      description: fullDescription,
      responsibilities: matchedPreset.responsibilities,
      requirements: matchedPreset.requirements,
      skills: matchedPreset.skills,
      suggestedCompensation: getSuggestedCompensation(finalCategory, finalExp)
    };
  }

  // 2. Synthesize dynamically for any custom or novel job title
  return synthesizeCustomJobSpec({
    title: cleanTitle || "Technology Specialist",
    category: finalCategory,
    experience: finalExp,
    workMode: finalWorkMode,
    jobType: finalJobType,
    customInstructions
  });
}

function detectCategory(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("engineer") || t.includes("developer") || t.includes("frontend") || t.includes("backend") || t.includes("full stack") || t.includes("architect") || t.includes("software")) {
    return "Engineering";
  }
  if (t.includes("designer") || t.includes("ui") || t.includes("ux") || t.includes("creative") || t.includes("brand") || t.includes("motion") || t.includes("video")) {
    return "Design";
  }
  if (t.includes("marketing") || t.includes("seo") || t.includes("growth") || t.includes("content") || t.includes("ad") || t.includes("social")) {
    return "Marketing";
  }
  if (t.includes("sales") || t.includes("business development") || t.includes("account executive") || t.includes("lead")) {
    return "Sales";
  }
  if (t.includes("devops") || t.includes("cloud") || t.includes("security") || t.includes("sysadmin") || t.includes("infrastructure") || t.includes("database")) {
    return "Infrastructure";
  }
  return "Support";
}

function getSuggestedCompensation(_category: string, experience: string): string {
  if (experience.includes("5+") || experience.includes("Lead") || experience.includes("Architect")) {
    return "₹18,00,000 - ₹30,00,000 P.A. (Disclosed upon interview)";
  }
  if (experience.includes("3+") || experience.includes("4+")) {
    return "₹10,00,000 - ₹18,00,000 P.A.";
  }
  if (experience.includes("1+") || experience.includes("2+")) {
    return "₹6,00,000 - ₹10,00,000 P.A.";
  }
  return "Competitive Industry Standard (Based on experience)";
}

function composeFullDescription(params: {
  title: string;
  category: string;
  experience: string;
  workMode: string;
  jobType: string;
  shortDesc: string;
  customInstructions?: string;
}): string {
  const instructionNote = params.customInstructions ? `\n\n**Special Role Focus:**\n${params.customInstructions}` : "";

  return `### About Digi-8 Solutions
Digi-8 Solutions is an enterprise digital transformation, technology consulting, and software development leader. We empower ambitious startups and Fortune 500 enterprises with cutting-edge web platforms, cloud infrastructure, AI-driven automation, and high-impact digital products.

### About The Opportunity: ${params.title}
We are seeking an exceptional, high-impact **${params.title}** to join our fast-growing **${params.category}** division. In this role, you will be instrumental in executing critical client initiatives, architecting modern software solutions, and driving technological excellence.

This is a **${params.jobType}** opportunity operating with a **${params.workMode}** setup, designed for someone with **${params.experience}** who thrives in collaborative, high-velocity environments.

### What You Will Achieve
- Partner with visionary product leads, designers, and systems architects to deliver robust, scalable technology solutions.
- Champion code quality, system performance, and modern best practices across every deliverable.
- Solve challenging architectural problems, optimize workflow pipelines, and contribute directly to customer success.${instructionNote}

### Why Build Your Career at Digi-8
- **Cutting-Edge Tech Stack:** Work with modern technologies, frameworks, cloud native services, and AI architectures.
- **Autonomy & Impact:** High level of ownership with direct influence on technical decisions and product roadmaps.
- **Continuous Learning:** Dedicated budget for certifications, technical workshops, and conference attendance.
- **Vibrant Remote-First Culture:** Collaborative, inclusive, and transparent team dynamics with flexible working hours.`;
}

function synthesizeCustomJobSpec(params: {
  title: string;
  category: string;
  experience: string;
  workMode: string;
  jobType: string;
  customInstructions?: string;
}): GeneratedJobSpec {
  const { title, category, experience, workMode, jobType, customInstructions } = params;

  const shortDesc = `Digi-8 Solutions is hiring a talented ${title} (${experience}) to drive high-priority initiatives, deliver world-class ${category.toLowerCase()} outcomes, and elevate our client solutions.`;

  const fullDesc = composeFullDescription({
    title,
    category,
    experience,
    workMode,
    jobType,
    shortDesc,
    customInstructions
  });

  const responsibilities = [
    `Lead the strategy, execution, and day-to-day deliverables for all ${title} initiatives across company accounts.`,
    `Collaborate closely with cross-functional leadership in ${category} to define roadmaps, sprint goals, and technical milestones.`,
    `Establish best-in-class standards, workflows, and quality assurance checkpoints to ensure defect-free, high-performance output.`,
    `Proactively diagnose bottlenecks, identify strategic opportunities, and propose innovative technological or operational solutions.`,
    `Document technical specifications, system architecture, standard operating procedures, and client-facing deliverable summaries.`,
    `Participate actively in team retrospectives, knowledge-sharing sessions, and continuous improvement initiatives.`
  ];

  const requirements = [
    `Demonstrated professional experience (${experience}) excelling as a ${title} or directly comparable role.`,
    `Comprehensive mastery of modern tools, methodologies, frameworks, and best practices relevant to ${title}.`,
    `Proven track record of managing end-to-end deliverables on time, within scope, and with uncompromising quality.`,
    `Outstanding written and verbal communication skills with the ability to articulate complex concepts clearly.`,
    `Strong problem-solving ability, self-direction, and comfort operating in an agile, fast-paced environment.`,
    `Relevant academic degree or demonstrable portfolio of successful projects and achievements.`
  ];

  const skills = [
    title,
    category,
    "Agile / Scrum",
    "Problem Solving",
    "Cross-Functional Collaboration",
    "Strategic Planning",
    "Continuous Improvement"
  ];

  return {
    title,
    category,
    jobType,
    workMode,
    experience,
    shortDescription: shortDesc,
    description: fullDesc,
    responsibilities,
    requirements,
    skills,
    suggestedCompensation: getSuggestedCompensation(category, experience)
  };
}
