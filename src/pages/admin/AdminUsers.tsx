import { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, Check, X, ShieldAlert, Mail } from 'lucide-react';
import AdminLayout from './AdminLayout';

type UserRole = 'Super Admin' | 'Sub Admin' | 'Database Admin';

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'pending';
  created_at: string;
};

const dummyUsers: AdminUser[] = [
  { id: '1', name: 'Master Admin', email: 'admin@digi8solutions.com', role: 'Super Admin', status: 'active', created_at: new Date().toISOString() },
];

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>(dummyUsers);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // New User Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('Sub Admin');

  const loadData = async () => {
    // In future, fetch from API
  };

  useEffect(() => { loadData(); }, []);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newUser: AdminUser = {
        id: Math.random().toString(),
        name: newName,
        email: newEmail,
        role: newRole,
        status: 'pending',
        created_at: new Date().toISOString()
      };
      setUsers([...users, newUser]);
      setNewName('');
      setNewEmail('');
      setNewRole('Sub Admin');
      setIsAdding(false);
      setLoading(false);
    }, 600);
  };

  const handleRemoveUser = (id: string) => {
    // Prevent removing self (dummy logic)
    if (id === '1') return alert("Cannot remove the master admin account.");
    if (confirm("Are you sure you want to remove this user?")) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-outfit font-black text-white text-3xl mb-1">User Management</h1>
            <p className="text-slate-400 text-sm font-inter">Manage administrators and database access roles.</p>
          </div>
          <button 
            onClick={() => setIsAdding(!isAdding)} 
            className="btn-glow px-4 py-2 rounded-xl text-sm font-inter flex items-center gap-2"
          >
            {isAdding ? <X size={16} /> : <UserPlus size={16} />}
            {isAdding ? 'Cancel' : 'Add New User'}
          </button>
        </div>

        {/* Add User Form */}
        {isAdding && (
          <form onSubmit={handleAddUser} className="glass-panel p-6 mb-8 animate-slide-up border border-brand-cyan/30">
            <h2 className="text-xl font-outfit font-bold text-white mb-6 flex items-center gap-2">
              <Shield size={20} className="text-brand-cyan" /> Invite New Administrator
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-xs text-slate-400 mb-2 font-inter">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-white font-inter text-sm outline-none focus:border-brand-cyan/50"
                  placeholder="e.g. Sarah Connor"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-2 font-inter">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-white font-inter text-sm outline-none focus:border-brand-cyan/50"
                  placeholder="sarah@digi8solutions.com"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-2 font-inter">Role</label>
                <select
                  className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-white font-inter text-sm outline-none focus:border-brand-cyan/50 cursor-pointer"
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as UserRole)}
                >
                  <option value="Sub Admin">Sub Admin</option>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Database Admin">Database Admin</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={loading}
                className="bg-brand-cyan hover:bg-brand-cyan/80 text-black font-bold px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2"
              >
                {loading ? 'Sending Invite...' : 'Send Invitation'} <Mail size={16} />
              </button>
            </div>
          </form>
        )}

        {/* Users Table */}
        <div className="glass-panel border border-white/10 overflow-hidden">
          <div className="p-5 border-b border-white/10 bg-white/[0.02]">
            <h2 className="font-outfit font-bold text-xl text-white flex items-center gap-2">
              <Users size={20} className="text-slate-400" /> Active Users
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-inter">
              <thead className="bg-[#0f0f13]">
                <tr className="border-b border-white/10">
                  <th className="text-left px-6 py-4 text-xs text-slate-400 font-medium uppercase tracking-wider">User</th>
                  <th className="text-left px-6 py-4 text-xs text-slate-400 font-medium uppercase tracking-wider">Role</th>
                  <th className="text-left px-6 py-4 text-xs text-slate-400 font-medium uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs text-slate-400 font-medium uppercase tracking-wider">Added On</th>
                  <th className="text-right px-6 py-4 text-xs text-slate-400 font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-cyan/20 to-brand-blue/20 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-white font-medium">{user.name}</div>
                          <div className="text-slate-400 text-xs">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1.5 px-3 py-1 w-max rounded-full text-xs font-bold ${
                        user.role === 'Super Admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                        user.role === 'Database Admin' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {user.role === 'Super Admin' && <ShieldAlert size={12} />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1 px-2.5 py-1 w-max rounded-md text-[11px] font-bold uppercase tracking-wider ${
                        user.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'
                      }`}>
                        {user.status === 'active' ? <Check size={12} /> : null} {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.id !== '1' && (
                        <button 
                          onClick={() => handleRemoveUser(user.id)}
                          className="text-slate-500 hover:text-red-400 transition-colors p-2"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
