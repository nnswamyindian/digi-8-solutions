import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'digi8',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const initDb = async () => {
  try {
    const connection = await pool.getConnection();
    try {
      // Basic tables matching schema
      await connection.query(`
        CREATE DATABASE IF NOT EXISTS digi8 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
      await connection.query(`
        CREATE TABLE IF NOT EXISTS leads (
          id INT AUTO_INCREMENT PRIMARY KEY,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          first_name VARCHAR(255),
          last_name VARCHAR(255),

        email VARCHAR(255),
        phone VARCHAR(50),
        company VARCHAR(255),
        industry VARCHAR(255),
        budget VARCHAR(100),
        timeline VARCHAR(100),
        services JSON,
        message TEXT,
        status VARCHAR(50) DEFAULT 'new',
        is_verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(255)
      )
    `);

      await connection.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        name VARCHAR(255),
        email VARCHAR(255),
        subject VARCHAR(255),
        message TEXT,
        status VARCHAR(50) DEFAULT 'new',
        is_verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(255)
      )
    `);

      await connection.query(`
      CREATE TABLE IF NOT EXISTS quotes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        quote_number VARCHAR(100),
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        company VARCHAR(255),
        website VARCHAR(255),
        project_type VARCHAR(100),
        project_details TEXT,
        total_estimate DECIMAL(10,2),
        selected_features JSON,
        status VARCHAR(50) DEFAULT 'pending',
        is_verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(255)
      )
    `);

      await connection.query(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        email VARCHAR(255) UNIQUE,
        is_verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(255)
      )
    `);
      await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        password_hash VARCHAR(255),
        role VARCHAR(50) DEFAULT 'Normal User',
        status VARCHAR(50) DEFAULT 'active',
        reset_token VARCHAR(255),
        reset_token_expires TIMESTAMP NULL
      );
    `);

      const superAdminEmail = 'admin@digi8solutions.com';
      const superAdminPassword = process.env.ADMIN_PASSWORD || 'AdminDigi8Password2026!';

      const [adminRows]: any = await connection.query('SELECT * FROM admin_users WHERE email = ?', [superAdminEmail]);
      if (adminRows.length === 0) {
        const defaultHash = await bcrypt.hash(superAdminPassword, 10);
        await connection.query(
          'INSERT INTO admin_users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
          ['Digi-8 Super Admin', superAdminEmail, defaultHash, 'Super Admin']
        );
        console.log(`[DB INFO] Default Super Admin user created: ${superAdminEmail}`);
      }

      const hrAdminEmail = 'hr@digi8solutions.com';
      const hrAdminPassword = process.env.HR_ADMIN_PASSWORD || 'HrAdminDigi8Password2026!';

      const [hrRows]: any = await connection.query('SELECT * FROM admin_users WHERE email = ?', [hrAdminEmail]);
      if (hrRows.length === 0) {
        const hrHash = await bcrypt.hash(hrAdminPassword, 10);
        await connection.query(
          'INSERT INTO admin_users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
          ['Digi-8 HR Admin', hrAdminEmail, hrHash, 'HR Admin']
        );
        console.log(`[DB INFO] Default HR Admin user created: ${hrAdminEmail}`);
      }

      await connection.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        title VARCHAR(255),
        description TEXT,
        category VARCHAR(100),
        image_url VARCHAR(255),
        client VARCHAR(255),
        completion_date VARCHAR(100),
        results JSON,
        sort_order INT DEFAULT 0
      )
    `);

      await connection.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        name VARCHAR(255),
        role VARCHAR(100),
        company VARCHAR(255),
        content TEXT,
        rating INT DEFAULT 5,
        image_url VARCHAR(255),
        is_featured BOOLEAN DEFAULT FALSE
      )
    `);

      await connection.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        title VARCHAR(255),
        slug VARCHAR(255) UNIQUE,
        excerpt TEXT,
        content LONGTEXT,
        author VARCHAR(100),
        category VARCHAR(100),
        image_url VARCHAR(255),
        status VARCHAR(50) DEFAULT 'draft'
      )
    `);

      await connection.query(`
      CREATE TABLE IF NOT EXISTS service_pricing (
        id INT AUTO_INCREMENT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        name VARCHAR(255),
        price VARCHAR(100),
        features JSON
      )
    `);

      await connection.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ticket_number VARCHAR(100) UNIQUE NOT NULL,
        user_name VARCHAR(255),
        user_email VARCHAR(255),
        user_phone VARCHAR(50),
        service_category VARCHAR(100),
        subject VARCHAR(255),
        description TEXT,
        priority VARCHAR(50) DEFAULT 'medium',
        status VARCHAR(50) DEFAULT 'open',
        assigned_to VARCHAR(255) DEFAULT 'Support Desk',
        resolution_notes TEXT
      )
    `);

      await connection.query(`
      CREATE TABLE IF NOT EXISTS career_jobs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        published_at TIMESTAMP NULL,
        job_id VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        category VARCHAR(100) NOT NULL,
        job_type VARCHAR(100) NOT NULL,
        work_mode VARCHAR(50) NOT NULL,
        location VARCHAR(150) NOT NULL,
        experience VARCHAR(100) NOT NULL,
        openings INT DEFAULT 1,
        compensation VARCHAR(150),
        short_description TEXT,
        description LONGTEXT,
        responsibilities JSON,
        requirements JSON,
        skills JSON,
        documents_required JSON,
        custom_questions JSON,
        application_deadline DATE,
        status VARCHAR(50) DEFAULT 'published',
        created_by VARCHAR(255) DEFAULT 'HR Admin'
      )
    `);

      await connection.query(`
      CREATE TABLE IF NOT EXISTS career_applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        application_id VARCHAR(50) UNIQUE NOT NULL,
        job_id VARCHAR(50) NOT NULL,
        candidate_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        location VARCHAR(150),
        current_role VARCHAR(150),
        experience VARCHAR(100),
        skills JSON,
        linkedin VARCHAR(255),
        portfolio VARCHAR(255),
        github VARCHAR(255),
        availability VARCHAR(100),
        expected_compensation VARCHAR(150),
        cover_message TEXT,
        resume_file VARCHAR(255),
        resume_original_name VARCHAR(255),
        custom_answers JSON,
        documents JSON,
        status VARCHAR(50) DEFAULT 'new'
      )
    `);

      // Seed default active opportunities if career_jobs table is empty
      const [existingJobs]: any = await connection.query('SELECT COUNT(*) as cnt FROM career_jobs');
      if (existingJobs[0]?.cnt === 0) {
        const initialJobs = [
          {
            job_id: 'DIGI8-JOB-101',
            title: 'Senior Frontend Developer',
            slug: 'senior-frontend-developer',
            category: 'Engineering',
            job_type: 'Full-time',
            work_mode: 'Remote',
            location: 'Mumbai / Remote, India',
            experience: '3+ Years',
            openings: 2,
            compensation: '₹10,00,000 - ₹16,00,000 P.A.',
            short_description: 'We are seeking an exceptional Senior Frontend Developer with deep expertise in React, TypeScript, and modern component architectures.',
            description: 'As a Senior Frontend Developer at DIGI8 Solutions, you will lead the architecture and development of ultra-responsive, accessible, and high-performance digital applications for global enterprise clients.',
            responsibilities: JSON.stringify([
              'Architect, build, and maintain production-grade React & TypeScript applications.',
              'Collaborate closely with UI/UX designers, backend engineers, and product managers.',
              'Optimize applications for maximum speed, scalability, and cross-browser responsiveness.',
              'Mentor junior developers and participate in code reviews to ensure best practices.',
              'Implement automated unit and integration tests for mission-critical interfaces.'
            ]),
            requirements: JSON.stringify([
              '3+ years of professional web development experience with React.js and TypeScript.',
              'Proficient in Tailwind CSS, CSS3 modern layouts (Grid/Flexbox), and state management.',
              'Hands-on experience with RESTful APIs, WebSockets, and asynchronous request handling.',
              'Solid understanding of Git, CI/CD pipelines, and modern bundling tools (Vite, Webpack).',
              'Strong problem-solving skills and passion for pixel-perfect UI implementations.'
            ]),
            skills: JSON.stringify(['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'REST APIs', 'Git']),
            documents_required: JSON.stringify(['Resume/CV', 'Portfolio / GitHub']),
            custom_questions: JSON.stringify([
              {
                id: 'q1',
                question: 'How many years of professional React & TypeScript experience do you have?',
                type: 'number',
                required: true,
                options: []
              },
              {
                id: 'q2',
                question: 'Are you available to join within 15-30 days?',
                type: 'radio',
                required: true,
                options: ['Immediate', '15 Days', '30 Days', 'More than 30 Days']
              },
              {
                id: 'q3',
                question: 'Link to your best deployed project or live web application:',
                type: 'url',
                required: false,
                options: []
              }
            ]),
            application_deadline: '2026-12-31',
            status: 'published',
            created_by: 'Digi-8 Talent Team'
          },
          {
            job_id: 'DIGI8-JOB-102',
            title: 'UI/UX & Product Designer',
            slug: 'ui-ux-product-designer',
            category: 'Design',
            job_type: 'Full-time / Freelance',
            work_mode: 'Hybrid',
            location: 'Mumbai, India',
            experience: '2+ Years',
            openings: 1,
            compensation: '₹8,00,000 - ₹14,00,000 P.A.',
            short_description: 'Looking for a visionary UI/UX designer to craft compelling digital experiences, design systems, and enterprise product interfaces.',
            description: 'Join our design division to build visually stunning brand experiences, user flows, wireframes, and design systems for next-generation digital products.',
            responsibilities: JSON.stringify([
              'Design wireframes, user journeys, interactive prototypes, and high-fidelity mockups.',
              'Establish and maintain cohesive design systems in Figma.',
              'Work with engineering teams to ensure design fidelity during frontend implementation.',
              'Conduct user research, usability testing, and synthesize feedback into design iterations.'
            ]),
            requirements: JSON.stringify([
              'Proven track record with an online portfolio showcasing digital product design.',
              'Mastery of Figma, design tokens, responsive layout principles, and micro-interactions.',
              'Good understanding of HTML/CSS constraints and modern design trends.'
            ]),
            skills: JSON.stringify(['Figma', 'UI/UX Design', 'Design Systems', 'Wireframing', 'Prototyping']),
            documents_required: JSON.stringify(['Resume/CV', 'Design Portfolio Link']),
            custom_questions: JSON.stringify([
              {
                id: 'q1',
                question: 'Please provide the direct link to your Figma or Behance portfolio:',
                type: 'url',
                required: true,
                options: []
              },
              {
                id: 'q2',
                question: 'Preferred work arrangement:',
                type: 'dropdown',
                required: true,
                options: ['Full-time (Hybrid)', 'Contract / Freelance', 'Either']
              }
            ]),
            application_deadline: '2026-11-30',
            status: 'published',
            created_by: 'Digi-8 Talent Team'
          },
          {
            job_id: 'DIGI8-JOB-103',
            title: 'Full Stack Node.js Engineer',
            slug: 'full-stack-nodejs-engineer',
            category: 'Engineering',
            job_type: 'Full-time',
            work_mode: 'Remote',
            location: 'Remote, India',
            experience: '3+ Years',
            openings: 2,
            compensation: '₹12,00,000 - ₹18,00,000 P.A.',
            short_description: 'Build robust backend architectures, distributed APIs, microservices, and database layers powering enterprise client platforms.',
            description: 'We are expanding our backend engineering team. You will be responsible for creating performant, secure, and resilient backend systems with Node.js, Express/Nest, and MySQL/PostgreSQL.',
            responsibilities: JSON.stringify([
              'Develop RESTful and GraphQL APIs with Node.js and TypeScript.',
              'Optimize database queries, indexing, and connection pools for MySQL/PostgreSQL.',
              'Implement security best practices including JWT, rate limiting, and OAuth.',
              'Architect scalable cloud deployments with Docker, AWS/GCP, and CI/CD pipelines.'
            ]),
            requirements: JSON.stringify([
              '3+ years backend development experience with Node.js & TypeScript.',
              'Deep understanding of relational databases (MySQL/PostgreSQL) and caching (Redis).',
              'Experience in API security, asynchronous messaging, and scalable microservices.'
            ]),
            skills: JSON.stringify(['Node.js', 'Express', 'TypeScript', 'MySQL', 'Redis', 'Docker', 'AWS']),
            documents_required: JSON.stringify(['Resume/CV']),
            custom_questions: JSON.stringify([
              {
                id: 'q1',
                question: 'What is your current notice period?',
                type: 'dropdown',
                required: true,
                options: ['Immediate', '15 Days', '30 Days', '60 Days', '90 Days']
              }
            ]),
            application_deadline: '2026-12-15',
            status: 'published',
            created_by: 'Digi-8 Talent Team'
          },
          {
            job_id: 'DIGI8-JOB-104',
            title: 'Digital Marketing & Growth Strategist',
            slug: 'digital-marketing-growth-strategist',
            category: 'Marketing',
            job_type: 'Full-time',
            work_mode: 'Hybrid',
            location: 'Mumbai, India',
            experience: '2+ Years',
            openings: 1,
            compensation: '₹7,00,000 - ₹12,00,000 P.A.',
            short_description: 'Drive high-ROI acquisition campaigns, SEO strategies, paid performance ads, and content-driven client growth.',
            description: 'Lead digital marketing initiatives across Google Ads, Meta Ads, SEO optimization, email automation, and conversion rate optimization (CRO).',
            responsibilities: JSON.stringify([
              'Plan and manage multi-channel paid acquisition campaigns (Google, Meta, LinkedIn).',
              'Execute technical and on-page SEO audits and content distribution strategies.',
              'Track attribution, KPIs, and campaign performance in Google Analytics 4.'
            ]),
            requirements: JSON.stringify([
              'Demonstrated success managing Google Ads and Meta Ads budgets with measurable ROAS.',
              'Strong knowledge of GA4, GTM, SEO tools (Ahrefs/Semrush), and email marketing funnels.'
            ]),
            skills: JSON.stringify(['SEO', 'Google Ads', 'Meta Ads', 'GA4', 'Performance Marketing']),
            documents_required: JSON.stringify(['Resume/CV', 'Past Campaign Case Studies']),
            custom_questions: JSON.stringify([
              {
                id: 'q1',
                question: 'What has been the largest monthly advertising budget you have managed?',
                type: 'short text',
                required: false,
                options: []
              }
            ]),
            application_deadline: '2026-11-15',
            status: 'published',
            created_by: 'Digi-8 Talent Team'
          }
        ];

        for (const j of initialJobs) {
          await connection.query(
            `INSERT INTO career_jobs 
             (job_id, title, slug, category, job_type, work_mode, location, experience, openings, compensation, short_description, description, responsibilities, requirements, skills, documents_required, custom_questions, application_deadline, status, created_by, published_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
              j.job_id, j.title, j.slug, j.category, j.job_type, j.work_mode, j.location,
              j.experience, j.openings, j.compensation, j.short_description, j.description,
              j.responsibilities, j.requirements, j.skills, j.documents_required, j.custom_questions,
              j.application_deadline, j.status, j.created_by
            ]
          );
        }
        console.log('[DB INFO] Seeded 4 initial career opportunity listings.');
      }

      // --- PHASE 2 ATS TABLES & SEEDS ---

      // Safely ensure Phase 2 columns exist on career_applications
      try {
        await connection.query(`ALTER TABLE career_applications ADD COLUMN stage_slug VARCHAR(50) DEFAULT 'applied'`);
      } catch {}
      try {
        await connection.query(`ALTER TABLE career_applications ADD COLUMN recruiter_id VARCHAR(50) NULL`);
      } catch {}
      try {
        await connection.query(`ALTER TABLE career_applications ADD COLUMN recruiter_name VARCHAR(150) NULL`);
      } catch {}
      try {
        await connection.query(`ALTER TABLE career_applications ADD COLUMN priority VARCHAR(20) DEFAULT 'normal'`);
      } catch {}
      try {
        await connection.query(`ALTER TABLE career_applications ADD COLUMN source VARCHAR(100) DEFAULT 'website'`);
      } catch {}

      // 1. Recruitment Stages
      await connection.query(`
        CREATE TABLE IF NOT EXISTS career_stages (
          id INT AUTO_INCREMENT PRIMARY KEY,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          name VARCHAR(100) NOT NULL,
          slug VARCHAR(50) UNIQUE NOT NULL,
          color VARCHAR(30) DEFAULT '#06b6d4',
          order_index INT DEFAULT 0,
          stage_type VARCHAR(50) DEFAULT 'in_progress',
          is_system BOOLEAN DEFAULT TRUE,
          active BOOLEAN DEFAULT TRUE
        )
      `);

      // Seed Default Stages
      const [stageRows]: any = await connection.query('SELECT COUNT(*) as cnt FROM career_stages');
      if (stageRows[0]?.cnt === 0) {
        const defaultStages = [
          { name: 'Applied', slug: 'applied', color: '#0ea5e9', order_index: 1, stage_type: 'applied' },
          { name: 'Screening', slug: 'screening', color: '#8b5cf6', order_index: 2, stage_type: 'screening' },
          { name: 'Shortlisted', slug: 'shortlisted', color: '#06b6d4', order_index: 3, stage_type: 'shortlisted' },
          { name: 'Interview', slug: 'interview', color: '#f59e0b', order_index: 4, stage_type: 'interview' },
          { name: 'Assessment', slug: 'assessment', color: '#3b82f6', order_index: 5, stage_type: 'assessment' },
          { name: 'Selected', slug: 'selected', color: '#10b981', order_index: 6, stage_type: 'selected' },
          { name: 'Hired', slug: 'hired', color: '#059669', order_index: 7, stage_type: 'hired' },
          { name: 'Rejected', slug: 'rejected', color: '#ef4444', order_index: 8, stage_type: 'rejected' }
        ];

        for (const st of defaultStages) {
          await connection.query(
            `INSERT INTO career_stages (name, slug, color, order_index, stage_type, is_system, active) VALUES (?, ?, ?, ?, ?, TRUE, TRUE)`,
            [st.name, st.slug, st.color, st.order_index, st.stage_type]
          );
        }
        console.log('[DB INFO] Seeded default recruitment stages.');
      }

      // 2. Stage History
      await connection.query(`
        CREATE TABLE IF NOT EXISTS career_stage_history (
          id INT AUTO_INCREMENT PRIMARY KEY,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          application_id VARCHAR(50) NOT NULL,
          from_stage VARCHAR(50),
          to_stage VARCHAR(50) NOT NULL,
          changed_by VARCHAR(150) DEFAULT 'Recruiter',
          notes TEXT
        )
      `);

      // 3. Internal Notes
      await connection.query(`
        CREATE TABLE IF NOT EXISTS career_notes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          candidate_email VARCHAR(255) NOT NULL,
          application_id VARCHAR(50),
          author_name VARCHAR(150) DEFAULT 'Recruiter',
          content TEXT NOT NULL
        )
      `);

      // 4. Candidate Tags
      await connection.query(`
        CREATE TABLE IF NOT EXISTS career_candidate_tags (
          id INT AUTO_INCREMENT PRIMARY KEY,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          candidate_email VARCHAR(255) NOT NULL,
          tag_name VARCHAR(100) NOT NULL
        )
      `);

      // 5. Recruiter Tasks
      await connection.query(`
        CREATE TABLE IF NOT EXISTS career_tasks (
          id INT AUTO_INCREMENT PRIMARY KEY,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          candidate_email VARCHAR(255),
          application_id VARCHAR(50),
          title VARCHAR(255) NOT NULL,
          description TEXT,
          assigned_to VARCHAR(150) DEFAULT 'Recruiter',
          due_date DATE,
          priority VARCHAR(20) DEFAULT 'medium',
          status VARCHAR(30) DEFAULT 'pending'
        )
      `);

      // 6. Email Templates
      await connection.query(`
        CREATE TABLE IF NOT EXISTS career_email_templates (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(150) NOT NULL,
          subject VARCHAR(255) NOT NULL,
          body LONGTEXT NOT NULL,
          category VARCHAR(50) DEFAULT 'general',
          variables TEXT,
          is_default BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Seed Default Email Templates
      const [tplRows]: any = await connection.query('SELECT COUNT(*) as cnt FROM career_email_templates');
      if (tplRows[0]?.cnt === 0) {
        const defaultTemplates = [
          {
            name: 'Application Received Confirmation',
            subject: 'We have received your application for {{job_title}} — DIGI8 Solutions',
            body: 'Hi {{candidate_name}},\n\nThank you for applying for the {{job_title}} position at DIGI8 Solutions. Your unique Application Reference ID is {{application_id}}.\n\nOur talent acquisition team has received your profile and will review your experience carefully. You will hear back from us regarding the next steps soon.\n\nBest regards,\nDIGI8 Solutions Talent Team',
            category: 'acknowledgement',
            variables: JSON.stringify(['candidate_name', 'job_title', 'application_id', 'company_name']),
            is_default: true
          },
          {
            name: 'Profile Shortlisted for Evaluation',
            subject: 'Great News! You have been shortlisted for {{job_title}} at DIGI8 Solutions',
            body: 'Dear {{candidate_name}},\n\nWe were impressed by your background and are excited to inform you that your application for {{job_title}} has been shortlisted!\n\nOur recruiting specialist {{recruiter_name}} will be coordinating the next stage with you shortly.\n\nWarm regards,\nDIGI8 Solutions Recruitment',
            category: 'shortlist',
            variables: JSON.stringify(['candidate_name', 'job_title', 'recruiter_name']),
            is_default: true
          },
          {
            name: 'Technical / Cultural Interview Invitation',
            subject: 'Interview Invitation: {{job_title}} at DIGI8 Solutions',
            body: 'Hi {{candidate_name}},\n\nWe would like to invite you for a virtual interview for the {{job_title}} position.\n\nDetails:\nDate: {{interview_date}}\nTime: {{interview_time}}\nMeeting Link: {{meeting_link}}\n\nPlease reply to confirm this slot or let us know if you need to reschedule.\n\nBest regards,\nDIGI8 Talent Team',
            category: 'interview',
            variables: JSON.stringify(['candidate_name', 'job_title', 'interview_date', 'interview_time', 'meeting_link']),
            is_default: true
          },
          {
            name: 'Formal Selection & Offer Letter',
            subject: 'Congratulations! Job Offer: {{job_title}} at DIGI8 Solutions',
            body: 'Dear {{candidate_name}},\n\nOn behalf of DIGI8 Solutions, we are thrilled to offer you the position of {{job_title}}!\n\nTarget Joining Date: {{joining_date}}\n\nPlease review the attached offer details and feel free to reach out with any questions. We look forward to building great digital products together!\n\nWarm regards,\nDIGI8 Solutions Leadership Team',
            category: 'offer',
            variables: JSON.stringify(['candidate_name', 'job_title', 'joining_date']),
            is_default: true
          },
          {
            name: 'Candidate Rejection Notice',
            subject: 'Update on your application for {{job_title}} — DIGI8 Solutions',
            body: 'Dear {{candidate_name}},\n\nThank you very much for taking the time to speak with us regarding the {{job_title}} role at DIGI8 Solutions.\n\nWhile our team was impressed with your credentials, we have decided to move forward with another applicant whose specific experience more closely aligns with our immediate goals for this role.\n\nWe will retain your profile in our talent network and reach out if a relevant opportunity emerges.\n\nWe wish you all the best in your career journey.\n\nBest regards,\nDIGI8 Talent Acquisition',
            category: 'rejection',
            variables: JSON.stringify(['candidate_name', 'job_title']),
            is_default: true
          }
        ];

        for (const tpl of defaultTemplates) {
          await connection.query(
            `INSERT INTO career_email_templates (name, subject, body, category, variables, is_default) VALUES (?, ?, ?, ?, ?, ?)`,
            [tpl.name, tpl.subject, tpl.body, tpl.category, tpl.variables, tpl.is_default]
          );
        }
        console.log('[DB INFO] Seeded default email templates.');
      }

      // 7. Email Logs (Communication History)
      await connection.query(`
        CREATE TABLE IF NOT EXISTS career_email_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          application_id VARCHAR(50),
          candidate_email VARCHAR(255) NOT NULL,
          template_id INT,
          template_name VARCHAR(255),
          subject VARCHAR(255) NOT NULL,
          body LONGTEXT NOT NULL,
          status VARCHAR(50) DEFAULT 'delivered',
          sent_by VARCHAR(150) DEFAULT 'System',
          sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 8. Interviews
      await connection.query(`
        CREATE TABLE IF NOT EXISTS career_interviews (
          id INT AUTO_INCREMENT PRIMARY KEY,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          candidate_email VARCHAR(255) NOT NULL,
          application_id VARCHAR(50) NOT NULL,
          job_id VARCHAR(50),
          interview_type VARCHAR(50) DEFAULT 'Video',
          interviewer VARCHAR(150) DEFAULT 'Technical Lead',
          date DATE NOT NULL,
          time VARCHAR(50) NOT NULL,
          duration VARCHAR(50) DEFAULT '45 mins',
          meeting_link VARCHAR(255),
          location VARCHAR(150),
          status VARCHAR(50) DEFAULT 'scheduled',
          instructions TEXT,
          notes TEXT
        )
      `);

      // 9. Interview Feedback
      await connection.query(`
        CREATE TABLE IF NOT EXISTS career_interview_feedback (
          id INT AUTO_INCREMENT PRIMARY KEY,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          interview_id INT NOT NULL,
          interviewer VARCHAR(150) NOT NULL,
          rating INT DEFAULT 4,
          recommendation VARCHAR(50) DEFAULT 'Hire',
          strengths TEXT,
          concerns TEXT,
          notes TEXT
        )
      `);

      // 10. Automation Rules
      await connection.query(`
        CREATE TABLE IF NOT EXISTS career_automation_rules (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(150) NOT NULL,
          event_trigger VARCHAR(50) NOT NULL DEFAULT 'stage_change',
          trigger_stage VARCHAR(50),
          action_type VARCHAR(50) NOT NULL DEFAULT 'send_email',
          email_template_id INT,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Seed Default Automation Rules
      const [autoRows]: any = await connection.query('SELECT COUNT(*) as cnt FROM career_automation_rules');
      if (autoRows[0]?.cnt === 0) {
        const defaultRules = [
          { name: 'Auto-reply on Application Received', event_trigger: 'stage_change', trigger_stage: 'applied', action_type: 'send_email', email_template_id: 1 },
          { name: 'Shortlist Notification Email', event_trigger: 'stage_change', trigger_stage: 'shortlisted', action_type: 'send_email', email_template_id: 2 },
          { name: 'Interview Scheduled Notification', event_trigger: 'interview_scheduled', trigger_stage: 'interview', action_type: 'send_email', email_template_id: 3 },
          { name: 'Offer Notification Email', event_trigger: 'stage_change', trigger_stage: 'selected', action_type: 'send_email', email_template_id: 4 },
          { name: 'Candidate Rejection Notice', event_trigger: 'stage_change', trigger_stage: 'rejected', action_type: 'send_email', email_template_id: 5 }
        ];
        for (const rule of defaultRules) {
          await connection.query(
            `INSERT INTO career_automation_rules (name, event_trigger, trigger_stage, action_type, email_template_id, is_active) VALUES (?, ?, ?, ?, ?, TRUE)`,
            [rule.name, rule.event_trigger, rule.trigger_stage, rule.action_type, rule.email_template_id]
          );
        }
        console.log('[DB INFO] Seeded default ATS automation rules.');
      }

      // 11. Audit Logs
      await connection.query(`
        CREATE TABLE IF NOT EXISTS career_audit_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          user_name VARCHAR(150) DEFAULT 'Recruiter',
          action VARCHAR(100) NOT NULL,
          entity_type VARCHAR(50) NOT NULL,
          entity_id VARCHAR(50) NOT NULL,
          details TEXT
        )
      `);

      console.log('Database initialized successfully.');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.warn('[DB WARNING] Local MySQL connection failed. Server running in offline/mock mode:', (error as any).message);
  }
};

export default pool;

