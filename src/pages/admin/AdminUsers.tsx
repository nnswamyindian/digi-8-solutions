import { useState, useEffect, useMemo } from 'react';
import { 
  Users, UserPlus, Shield, Check, X, ShieldAlert, KeyRound, 
  Copy, RefreshCw, Eye, EyeOff, Search, Lock, 
  Briefcase, Code2, TrendingUp, CheckCircle2, AlertCircle,
  Clock, Database, Sliders, ChevronDown
} from 'lucide-react';
import AdminLayout, { AdminRole } from './AdminLayout';
import { 
  getAdminUsersList, 
  createAdminUserRecord, 
  updateAdminUserRecord, 
  deleteAdminUserRecord,
  AdminUserRecord 
} from '../../lib/api';

const DEFAULT_SEED_USERS: AdminUserRecord[] = [
  { id: '1', name: 'Digi-8 Super Admin', email: 'admin@digi8solutions.com', role: 'Super Admin', status: 'active', created_at: new Date().toISOString() },
  { id: '2', name: 'Digi-8 Official Admin', email: 'digi8solutions@gmail.com', role: 'Super Admin', status: 'active', created_at: new Date().toISOString() },
  { id: '3', name: 'Digi-8 HR Admin', email: 'hr@digi8solutions.com', role: 'HR Admin', status: 'active', created_at: new Date().toISOString() },
  { id: '4', name: 'Sub Administrator', email: 'subadmin@digi8solutions.com', role: 'Sub Admin', status: 'active', created_at: new Date().toISOString() },
  { id: '5', name: 'Lead Developer', email: 'dev@digi8solutions.com', role: 'Developer', status: 'active', created_at: new Date().toISOString() },
  { id: '6', name: 'Marketing Executive', email: 'marketing@digi8solutions.com', role: 'Marketing Executive', status: 'active', created_at: new Date().toISOString() },
  { id: '7', name: 'Database Administrator', email: 'dbadmin@digi8solutions.com', role: 'Database Admin', status: 'active', created_at: new Date().toISOString() },
];

const ROLE_PERMISSIONS: Record<AdminRole, { title: string; color: string; bg: string; border: string; sections: string[]; icon: any }> = {
  'Super Admin': {
    title: 'Super Admin',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    sections: ['Full Access', 'User Management', 'Financials', 'Careers/ATS', 'Tickets', 'Settings'],
    icon: ShieldAlert
  },
  'Sub Admin': {
    title: 'Sub Admin',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    sections: ['Careers/ATS', 'Leads', 'Quotes', 'Projects', 'Contacts', 'Blog', 'Pricing', 'Analytics'],
    icon: Shield
  },
  'HR Admin': {
    title: 'HR Admin',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    sections: ['Careers Overview', 'ATS Pipeline', 'Candidate CRM', 'Interviews', 'Email Automations', 'Funnel Analytics'],
    icon: Briefcase
  },
  'Developer': {
    title: 'Developer',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    sections: ['Support Tickets', 'Projects & Portfolio', 'System Tools & Config'],
    icon: Code2
  },
  'Marketing Executive': {
    title: 'Marketing Executive',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    sections: ['Leads Center', 'Quotes Estimator', 'Contact Inquiries', 'Testimonials', 'Blog Editor'],
    icon: TrendingUp
  },
  'Database Admin': {
    title: 'Database Admin',
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/30',
    sections: ['System Health', 'Database Diagnostics', 'Execution Telemetry'],
    icon: Database
  }
};

const ALL_ROLES: AdminRole[] = [
  'Super Admin',
  'Sub Admin',
  'HR Admin',
  'Developer',
  'Marketing Executive',
  'Database Admin'
];

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUserRecord[]>(DEFAULT_SEED_USERS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('All');

  // Add User Form State
  const [isAdding, setIsAdding] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<AdminRole>('Sub Admin');
  const [formPassword, setFormPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  
  // Just created credentials card
  const [createdCredentials, setCreatedCredentials] = useState<{
    name: string;
    email: string;
    password: string;
    role: string;
  } | null>(null);
  const [copiedToast, setCopiedToast] = useState(false);

  // Quick Password Reset Modal
  const [resetModalUser, setResetModalUser] = useState<AdminUserRecord | null>(null);
  const [newResetPassword, setNewResetPassword] = useState('');
  const [resetShowPass, setResetShowPass] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');

  // Quick Role Change Dropdown Target
  const [roleChangeUser, setRoleChangeUser] = useState<AdminUserRecord | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAdminUsersList();
      if (data && data.length > 0) {
        // Merge with seed users ensuring no duplicates by email
        const merged = [...data];
        for (const seed of DEFAULT_SEED_USERS) {
          if (!merged.some(u => u.email.toLowerCase() === seed.email.toLowerCase())) {
            merged.push(seed);
          }
        }
        setUsers(merged);
      } else {
        setUsers(DEFAULT_SEED_USERS);
      }
    } catch {
      setUsers(DEFAULT_SEED_USERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Helper to generate secure password
  const generateRandomPassword = () => {
    const specials = ['!', '@', '#', '$', '%'];
    const randomSpecial = specials[Math.floor(Math.random() * specials.length)];
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const pass = `Digi8#${randomNum}${randomSpecial}`;
    setFormPassword(pass);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formEmail.trim() || !formPassword.trim()) {
      setFormError('Email and Password are required.');
      return;
    }

    setFormSubmitting(true);
    const res = await createAdminUserRecord({
      name: formName.trim() || 'Staff Member',
      email: formEmail.trim().toLowerCase(),
      password: formPassword.trim(),
      role: formRole,
      status: 'active'
    });
    setFormSubmitting(false);

    if (!res.success) {
      setFormError(res.error || 'Failed to create user. Please try again.');
      return;
    }

    // Success! Show credential banner so admin can copy and distribute
    setCreatedCredentials({
      name: formName.trim() || 'Staff Member',
      email: formEmail.trim().toLowerCase(),
      password: formPassword.trim(),
      role: formRole
    });

    // Reset form
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setIsAdding(false);
    loadUsers();
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `Digi 8 Solutions Staff Credentials:
Name: ${createdCredentials.name}
Role: ${createdCredentials.role}
Email / Username: ${createdCredentials.email}
Password: ${createdCredentials.password}
Login Portal: ${window.location.origin}/admin/staff`;
    navigator.clipboard.writeText(text);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  const handleToggleStatus = async (user: AdminUserRecord) => {
    if (user.email === 'admin@digi8solutions.com' || user.email === 'digi8solutions@gmail.com') {
      alert('Primary Super Admin status cannot be modified.');
      return;
    }
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    await updateAdminUserRecord(user.id, { status: nextStatus });
    setUsers(users.map(u => u.id === user.id ? { ...u, status: nextStatus } : u));
  };

  const handleRoleChange = async (userId: string | number, newRole: AdminRole) => {
    await updateAdminUserRecord(userId, { role: newRole });
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    setRoleChangeUser(null);
  };

  const handleExecuteResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser || !newResetPassword.trim()) return;
    setResetSubmitting(true);
    setResetSuccess('');

    await updateAdminUserRecord(resetModalUser.id, { password: newResetPassword.trim() });
    setResetSubmitting(false);
    setResetSuccess(`Password updated successfully!`);
    setTimeout(() => {
      setResetModalUser(null);
      setNewResetPassword('');
      setResetSuccess('');
    }, 1500);
  };

  const handleDeleteUser = async (user: AdminUserRecord) => {
    if (user.email === 'admin@digi8solutions.com' || user.email === 'digi8solutions@gmail.com') {
      alert('Primary Super Admin accounts cannot be deleted.');
      return;
    }
    if (confirm(`Are you sure you want to remove the staff account for "${user.name}" (${user.email})?`)) {
      await deleteAdminUserRecord(user.id);
      setUsers(users.filter(u => u.id !== user.id));
    }
  };

  // Filtered list
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'All' || user.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, filterRole]);

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.status === 'active').length;
    const superAdmins = users.filter(u => u.role === 'Super Admin').length;
    const subAdmins = users.filter(u => u.role === 'Sub Admin').length;
    const hrAdmins = users.filter(u => u.role === 'HR Admin').length;
    const devs = users.filter(u => u.role === 'Developer').length;
    const marketing = users.filter(u => u.role === 'Marketing Executive').length;
    return { total, active, superAdmins, subAdmins, hrAdmins, devs, marketing };
  }, [users]);

  return (
    <AdminLayout>
      <div className="max-w-7xl w-full mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-xs font-mono mb-2">
              <KeyRound size={13} /> Direct Staff Provisioning Gateway
            </div>
            <h1 className="font-outfit font-black text-white text-3xl tracking-tight">Staff & Access Management</h1>
            <p className="text-slate-400 text-sm font-inter">
              Directly create, provision, and assign role-based credentials without email or OTP verification hoops.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsAdding(!isAdding);
                setFormError('');
                if (!isAdding && !formPassword) generateRandomPassword();
              }}
              className="btn-glow px-5 py-2.5 rounded-xl text-sm font-poppins font-semibold flex items-center gap-2 shadow-glow-cyan"
            >
              {isAdding ? <X size={16} /> : <UserPlus size={16} />}
              {isAdding ? 'Close Creation Panel' : 'Create Staff Login'}
            </button>
            <button
              onClick={loadUsers}
              disabled={loading}
              title="Refresh Users"
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="glass-panel p-4 border border-white/10">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Logins</div>
            <div className="text-2xl font-black font-outfit text-white">{stats.total}</div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> {stats.active} Active
            </div>
          </div>
          <div className="glass-panel p-4 border border-purple-500/20 bg-purple-500/[0.03]">
            <div className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-1">Super Admins</div>
            <div className="text-2xl font-black font-outfit text-purple-300">{stats.superAdmins}</div>
            <div className="text-[11px] text-slate-400 mt-1">Full System Authority</div>
          </div>
          <div className="glass-panel p-4 border border-cyan-500/20 bg-cyan-500/[0.03]">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1">Sub Admins</div>
            <div className="text-2xl font-black font-outfit text-cyan-300">{stats.subAdmins}</div>
            <div className="text-[11px] text-slate-400 mt-1">Operations & Portals</div>
          </div>
          <div className="glass-panel p-4 border border-emerald-500/20 bg-emerald-500/[0.03]">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">HR Admins</div>
            <div className="text-2xl font-black font-outfit text-emerald-300">{stats.hrAdmins}</div>
            <div className="text-[11px] text-slate-400 mt-1">Careers & Candidate CRM</div>
          </div>
          <div className="glass-panel p-4 border border-amber-500/20 bg-amber-500/[0.03]">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">Developers</div>
            <div className="text-2xl font-black font-outfit text-amber-300">{stats.devs}</div>
            <div className="text-[11px] text-slate-400 mt-1">Tickets & Projects</div>
          </div>
          <div className="glass-panel p-4 border border-rose-500/20 bg-rose-500/[0.03]">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-1">Marketing</div>
            <div className="text-2xl font-black font-outfit text-rose-300">{stats.marketing}</div>
            <div className="text-[11px] text-slate-400 mt-1">Leads & Quotes</div>
          </div>
        </div>

        {/* Credentials Created Notification Banner */}
        {createdCredentials && (
          <div className="glass-strong p-6 rounded-2xl border-2 border-emerald-500/50 bg-emerald-500/[0.06] animate-slide-up shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <h3 className="text-base font-outfit font-bold text-white flex items-center gap-2">
                    Staff Login Created & Activated Instantly!
                    <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Zero Verification Required
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    The staff account is live and ready for immediate login at <code className="text-brand-cyan">/admin/staff</code>. Copy credentials below to share with employee.
                  </p>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                    <div className="bg-black/40 px-3 py-2 rounded-lg border border-white/10">
                      <span className="text-slate-400 block text-[10px]">Email / Username:</span>
                      <span className="text-white font-semibold">{createdCredentials.email}</span>
                    </div>
                    <div className="bg-black/40 px-3 py-2 rounded-lg border border-white/10">
                      <span className="text-slate-400 block text-[10px]">Password:</span>
                      <span className="text-brand-cyan font-bold">{createdCredentials.password}</span>
                    </div>
                    <div className="bg-black/40 px-3 py-2 rounded-lg border border-white/10">
                      <span className="text-slate-400 block text-[10px]">Assigned Role:</span>
                      <span className="text-emerald-400 font-semibold">{createdCredentials.role}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  onClick={handleCopyCredentials}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs font-poppins flex items-center justify-center gap-1.5 transition-colors shadow-lg"
                >
                  {copiedToast ? <Check size={14} /> : <Copy size={14} />}
                  {copiedToast ? 'Copied to Clipboard!' : 'Copy Credentials'}
                </button>
                <button
                  onClick={() => setCreatedCredentials(null)}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1 transition-colors"
                >
                  Dismiss Banner
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Staff Login Form (Direct Provisioning) */}
        {isAdding && (
          <div className="glass-strong p-6 sm:p-8 rounded-2xl border-2 border-brand-cyan/40 shadow-2xl bg-gradient-to-b from-[#0a0f1d] to-[#070b14] animate-slide-up">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-cyan/20 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-outfit font-bold text-white">Create New Staff Login</h2>
                  <p className="text-xs text-slate-400">Zero-verification: User will be activated immediately upon creation.</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                <Check size={13} /> Instant Active Status
              </div>
            </div>

            {formError && (
              <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="text-red-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 font-inter">
                    Staff Member Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Sharma"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="form-input w-full px-4 py-3 rounded-xl text-sm font-inter"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 font-inter">
                    Staff Email / Login Identifier
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. vikram@digi8solutions.com"
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    className="form-input w-full px-4 py-3 rounded-xl text-sm font-inter"
                  />
                </div>
              </div>

              {/* Role Selection with Permission preview */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 font-inter">
                  Select Assigned Role & Access Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {ALL_ROLES.map(role => {
                    const roleInfo = ROLE_PERMISSIONS[role];
                    const IconComponent = roleInfo.icon;
                    const isSelected = formRole === role;
                    return (
                      <div
                        key={role}
                        onClick={() => setFormRole(role)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-brand-cyan bg-brand-cyan/10 shadow-glow-cyan/20 ring-1 ring-brand-cyan' 
                            : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <IconComponent size={16} className={roleInfo.color} />
                            <span className="text-sm font-outfit font-bold text-white">{role}</span>
                          </div>
                          {isSelected && <Check size={14} className="text-brand-cyan" />}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {roleInfo.sections.slice(0, 3).map(sec => (
                            <span key={sec} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-300">
                              {sec}
                            </span>
                          ))}
                          {roleInfo.sections.length > 3 && (
                            <span className="text-[10px] text-slate-500">+{roleInfo.sections.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Password setup */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 font-inter">
                    Direct Login Password
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-xs text-brand-cyan hover:underline flex items-center gap-1 font-medium"
                  >
                    <RefreshCw size={12} /> Generate Random Password
                  </button>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter direct login password"
                    value={formPassword}
                    onChange={e => setFormPassword(e.target.value)}
                    className="form-input w-full pl-10 pr-12 py-3 rounded-xl text-sm font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Zero verification note */}
              <div className="p-3.5 rounded-xl bg-brand-cyan/5 border border-brand-cyan/20 text-xs text-slate-300 flex items-start gap-2">
                <CheckCircle2 size={16} className="text-brand-cyan shrink-0 mt-0.5" />
                <span>
                  <strong>Zero-Verification Guarantee:</strong> This user will NOT be asked to click any confirmation links, enter OTP codes, or verify their email. They can sign in immediately at the <strong>Staff Login Gateway</strong> using the password assigned above.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="btn-glow px-6 py-2.5 rounded-xl text-sm font-poppins font-bold text-white flex items-center gap-2 shadow-glow-cyan disabled:opacity-50"
                >
                  {formSubmitting ? (
                    <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Provisioning...</>
                  ) : (
                    <><Check size={16} /> Create & Activate Login Now</>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="glass-panel p-4 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-white font-inter text-xs outline-none focus:border-brand-cyan/50"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setFilterRole('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                filterRole === 'All' ? 'bg-brand-cyan text-black font-bold' : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              All ({users.length})
            </button>
            {ALL_ROLES.map(role => (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                  filterRole === role ? 'bg-white text-black font-bold' : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="glass-panel border border-white/10 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
            <h2 className="font-outfit font-bold text-lg text-white flex items-center gap-2">
              <Users size={18} className="text-brand-cyan" /> Registered Accounts ({filteredUsers.length})
            </h2>
            <div className="text-xs text-slate-400">
              Showing active administrative and team credentials
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-inter">
              <thead className="bg-[#0c101c] border-b border-white/10 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">User & Email</th>
                  <th className="px-5 py-3.5">Assigned Role</th>
                  <th className="px-5 py-3.5">Accessible Sections</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Created</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-400 text-sm">
                      No accounts found matching your query.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => {
                    const roleInfo = ROLE_PERMISSIONS[user.role as AdminRole] || ROLE_PERMISSIONS['Sub Admin'];
                    const RoleIcon = roleInfo.icon;
                    const isProtected = user.email === 'admin@digi8solutions.com' || user.email === 'digi8solutions@gmail.com';

                    return (
                      <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                        {/* Name and Email */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-cyan/20 to-brand-blue/20 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan font-bold text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-white font-medium text-sm flex items-center gap-2">
                                {user.name}
                                {isProtected && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">
                                    Primary Root
                                  </span>
                                )}
                              </div>
                              <div className="text-slate-400 text-xs font-mono">{user.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Role Badge */}
                        <td className="px-5 py-4">
                          <div className="relative inline-block">
                            <button
                              onClick={() => !isProtected && setRoleChangeUser(user)}
                              disabled={isProtected}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${roleInfo.bg} ${roleInfo.color} border ${roleInfo.border} ${!isProtected ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'}`}
                            >
                              <RoleIcon size={12} />
                              {user.role}
                              {!isProtected && <ChevronDown size={11} className="opacity-70" />}
                            </button>
                          </div>
                        </td>

                        {/* Section Pills */}
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {roleInfo.sections.slice(0, 2).map(sec => (
                              <span key={sec} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/5">
                                {sec}
                              </span>
                            ))}
                            {roleInfo.sections.length > 2 && (
                              <span className="text-[10px] text-slate-500 flex items-center px-1">
                                +{roleInfo.sections.length - 2} more
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleToggleStatus(user)}
                            disabled={isProtected}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                              user.status === 'active' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            } ${!isProtected ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                            {user.status}
                          </button>
                        </td>

                        {/* Created Date */}
                        <td className="px-5 py-4 text-xs text-slate-400 font-mono">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active'}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setResetModalUser(user);
                                setNewResetPassword('');
                                setResetSuccess('');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1 border border-white/5"
                              title="Reset Password Instantly"
                            >
                              <KeyRound size={12} /> Reset Pass
                            </button>

                            {!isProtected && (
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition-colors border border-red-500/20"
                                title="Delete User"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Password Reset Modal */}
        {resetModalUser && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="glass-strong max-w-md w-full p-6 rounded-2xl border border-brand-cyan/40 shadow-2xl animate-scale-up">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <KeyRound size={18} className="text-brand-cyan" />
                  <h3 className="font-outfit font-bold text-lg text-white">Reset Staff Password</h3>
                </div>
                <button onClick={() => setResetModalUser(null)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-slate-300 mb-4 font-inter">
                Set a new direct password for <strong>{resetModalUser.name}</strong> ({resetModalUser.email}). The new password takes effect immediately with no verification needed.
              </p>

              {resetSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>{resetSuccess}</span>
                </div>
              )}

              <form onSubmit={handleExecuteResetPassword} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-300">New Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        const rnd = Math.floor(1000 + Math.random() * 9000);
                        setNewResetPassword(`Digi8!Staff${rnd}`);
                      }}
                      className="text-xs text-brand-cyan hover:underline"
                    >
                      Generate Strong
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={resetShowPass ? 'text' : 'password'}
                      required
                      placeholder="Enter new password"
                      value={newResetPassword}
                      onChange={e => setNewResetPassword(e.target.value)}
                      className="form-input w-full px-4 py-2.5 rounded-xl text-sm font-mono pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setResetShowPass(!resetShowPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {resetShowPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setResetModalUser(null)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetSubmitting}
                    className="btn-glow px-5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-glow-cyan"
                  >
                    {resetSubmitting ? 'Updating...' : 'Update Password Instantly'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Change Role Modal */}
        {roleChangeUser && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="glass-strong max-w-sm w-full p-6 rounded-2xl border border-white/20 shadow-2xl animate-scale-up">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Sliders size={18} className="text-brand-cyan" />
                  <h3 className="font-outfit font-bold text-base text-white">Change Staff Role</h3>
                </div>
                <button onClick={() => setRoleChangeUser(null)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-slate-300 mb-4 font-inter">
                Update access tier for <strong>{roleChangeUser.name}</strong>:
              </p>

              <div className="space-y-2">
                {ALL_ROLES.map(role => (
                  <button
                    key={role}
                    onClick={() => handleRoleChange(roleChangeUser.id, role)}
                    className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-colors ${
                      roleChangeUser.role === role 
                        ? 'border-brand-cyan bg-brand-cyan/10 text-white font-bold' 
                        : 'border-white/10 bg-white/[0.02] text-slate-300 hover:bg-white/[0.06]'
                    }`}
                  >
                    <span className="text-xs">{role}</span>
                    {roleChangeUser.role === role && <Check size={14} className="text-brand-cyan" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
