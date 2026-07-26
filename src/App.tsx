import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import './components/home/HomeStyles.css';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Industries from './pages/Industries';
import Portfolio from './pages/Portfolio';
import CaseStudies from './pages/CaseStudies';
import Technologies from './pages/Technologies';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Testimonials from './pages/Testimonials';
import Careers from './pages/Careers';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';
import QuoteCalculator from './pages/QuoteCalculator';
import VerifyEmail from './pages/VerifyEmail';

// Service Division Platforms
import BrandingIdentity from './pages/services/BrandingIdentity';
import TechnologyInfrastructure from './pages/services/TechnologyInfrastructure';
import BusinessRegistration from './pages/services/BusinessRegistration';
import DigitalMarketingGrowth from './pages/services/DigitalMarketingGrowth';
import AITraining from './pages/services/AITraining';
import CyberSecurityCloud from './pages/services/CyberSecurityCloud';
import WorkforceSupport from './pages/services/WorkforceSupport';
import CustomizedGifting from './pages/services/CustomizedGifting';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLeads from './pages/admin/AdminLeads';
import AdminTestimonials from './pages/admin/AdminTestimonials';
import AdminQuotes from './pages/admin/AdminQuotes';
import AdminContacts from './pages/admin/AdminContacts';
import AdminProjects from './pages/admin/AdminProjects';
import AdminPricing from './pages/admin/AdminPricing';
import AdminUsers from './pages/admin/AdminUsers';
import AdminBlog from './pages/admin/AdminBlog';
import ForgotPassword from './pages/admin/ForgotPassword';
import ResetPassword from './pages/admin/ResetPassword';

import { checkAuth } from './lib/api';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// Guards admin routes — redirects to login if session absent
function RequireAuth({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<'loading' | 'authed' | 'unauthed'>('loading');

  useEffect(() => {
    checkAuth().then((isAuthed) => {
      setState(isAuthed ? 'authed' : 'unauthed');
    });
  }, []);

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="w-8 h-8 rounded-full border-2 border-brand-cyan border-t-transparent animate-spin" />
      </div>
    );
  }
  if (state === 'unauthed') return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

function AppShell() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin') || pathname === '/forgot-password' || pathname === '/reset-password';

  if (isAdmin) {
    return (
      <Routes>
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin/dashboard" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
        <Route path="/admin/leads" element={<RequireAuth><AdminLeads /></RequireAuth>} />
        <Route path="/admin/quotes" element={<RequireAuth><AdminQuotes /></RequireAuth>} />
        <Route path="/admin/projects" element={<RequireAuth><AdminProjects /></RequireAuth>} />
        <Route path="/admin/contacts" element={<RequireAuth><AdminContacts /></RequireAuth>} />
        <Route path="/admin/testimonials" element={<RequireAuth><AdminTestimonials /></RequireAuth>} />
        <Route path="/admin/blog" element={<RequireAuth><AdminBlog /></RequireAuth>} />
        <Route path="/admin/pricing" element={<RequireAuth><AdminPricing /></RequireAuth>} />
        <Route path="/admin/users" element={<RequireAuth><AdminUsers /></RequireAuth>} />
        <Route path="/admin/analytics" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
        <Route path="/admin/settings" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
        <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-24 min-h-screen bg-brand-dark text-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/branding-identity" element={<BrandingIdentity />} />
          <Route path="/services/technology-infrastructure" element={<TechnologyInfrastructure />} />
          <Route path="/services/business-registration" element={<BusinessRegistration />} />
          <Route path="/services/digital-marketing-growth" element={<DigitalMarketingGrowth />} />
          <Route path="/services/ai-training" element={<AITraining />} />
          <Route path="/services/cyber-security-cloud" element={<CyberSecurityCloud />} />
          <Route path="/services/workforce-support" element={<WorkforceSupport />} />
          <Route path="/services/customized-gifting" element={<CustomizedGifting />} />
          <Route path="/industries" element={<Industries />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/case-studies" element={<CaseStudies />} />
          <Route path="/technologies" element={<Technologies />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/quote-calculator" element={<QuoteCalculator />} />
          <Route path="/request-proposal" element={<QuoteCalculator />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppShell />
    </BrowserRouter>
  );
}
