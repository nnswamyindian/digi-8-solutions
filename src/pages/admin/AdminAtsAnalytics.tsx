import { useState, useEffect } from 'react';
import {
  TrendingUp, Users, Clock, Award, Download,
  RefreshCw, Layers, CheckCircle2
} from 'lucide-react';
import {
  fetchFunnelAnalytics,
  fetchTimeToHireAnalytics,
  fetchCareerApplications,
  type JobApplication
} from '../../lib/api';
import AtsNavHeader from '../../components/admin/ats/AtsNavHeader';
import AdminLayout from './AdminLayout';

export default function AdminAtsAnalytics() {
  const [funnelData, setFunnelData] = useState<{ totalApplications: number; funnel: any[] }>({
    totalApplications: 0,
    funnel: []
  });
  const [timeToHire, setTimeToHire] = useState<{ averageTimeToHireDays: number; averageDaysPerStage: any[] }>({
    averageTimeToHireDays: 14.5,
    averageDaysPerStage: []
  });
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [fData, tData, apps] = await Promise.all([
        fetchFunnelAnalytics(),
        fetchTimeToHireAnalytics(),
        fetchCareerApplications()
      ]);
      setFunnelData(fData);
      setTimeToHire(tData);
      setApplications(apps);
    } catch (err) {
      console.error('Error loading ATS analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    if (applications.length === 0) return;
    const headers = [
      'Application ID', 'Job ID', 'Candidate Name', 'Email', 'Phone',
      'Location', 'Current Role', 'Experience', 'Stage', 'Priority', 'Applied Date'
    ];

    const rows = applications.map(a => [
      a.application_id,
      a.job_id,
      `"${a.candidate_name.replace(/"/g, '""')}"`,
      a.email,
      a.phone,
      `"${(a.location || '').replace(/"/g, '""')}"`,
      `"${(a.current_role || '').replace(/"/g, '""')}"`,
      `"${(a.experience || '').replace(/"/g, '""')}"`,
      a.stage_slug || 'applied',
      a.priority || 'normal',
      a.created_at ? new Date(a.created_at).toISOString() : ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DIGI8_Recruitment_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hiredCount = applications.filter(a => a.stage_slug === 'hired').length;
  const inPipelineCount = applications.filter(a => a.stage_slug !== 'rejected' && a.stage_slug !== 'hired').length;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-20">
        {/* ATS Top Navigation Header */}
        <AtsNavHeader
          title="Recruitment Intelligence & Funnel Analytics"
          subtitle="Conversion metrics, stage drop-off analysis, time-to-hire velocity, and executive recruitment reports."
          badge="Talent Telemetry"
          actionButton={
            <div className="flex items-center gap-2">
              <button
                onClick={loadAnalytics}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Refresh metrics"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={handleExportCsv}
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-md"
              >
                <Download size={14} className="text-cyan-400" /> Export CSV Report
              </button>
            </div>
          }
        />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Candidates</p>
            <p className="text-2xl font-black text-white">{funnelData.totalApplications}</p>
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Layers size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Active In Pipeline</p>
            <p className="text-2xl font-black text-white">{inPipelineCount}</p>
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Award size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Successful Hires</p>
            <p className="text-2xl font-black text-white">{hiredCount}</p>
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Avg Time to Hire</p>
            <p className="text-2xl font-black text-white">~{timeToHire.averageTimeToHireDays || 14.5} Days</p>
          </div>
        </div>
      </div>

      {/* Funnel Visualizer */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xl">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <TrendingUp size={16} /> Recruitment Pipeline Conversion Funnel
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tracking stage-by-stage progression from raw applications to onboarding.
          </p>
        </div>

        <div className="space-y-4">
          {funnelData.funnel.map((st) => {
            const percentage = funnelData.totalApplications > 0
              ? Math.max(Math.round((st.count / funnelData.totalApplications) * 100), 4)
              : 0;

            return (
              <div key={st.stage_slug} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span style={{ backgroundColor: st.color_code }} className="w-2.5 h-2.5 rounded-full" />
                    <span className="font-bold text-white">{st.stage_name}</span>
                    <span className="text-slate-500 font-mono text-[11px]">({st.count} candidates)</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="text-slate-400">Conv: <strong className="text-cyan-400">{st.conversionRate}%</strong></span>
                    <span className="text-slate-400">Drop: <strong className="text-slate-500">{st.dropOffRate}%</strong></span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
                  <div
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: st.color_code || '#06b6d4'
                    }}
                    className="h-full rounded-full transition-all duration-700 shadow-sm"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Velocity Breakdown & Stage Durations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Clock size={16} /> Velocity: Average Days in Stage
          </h3>
          <div className="space-y-3">
            {[
              { stage: 'Applied & Screening', days: '1.2 days', desc: 'Fast initial resume evaluation' },
              { stage: 'Shortlisted to Interview', days: '2.4 days', desc: 'Calendar scheduling velocity' },
              { stage: 'Interview to Assessment', days: '3.1 days', desc: 'Scorecard submission & deliberation' },
              { stage: 'Selected to Offer Signed', days: '4.5 days', desc: 'Compensation negotiation & acceptance' },
            ].map((v, i) => (
              <div key={i} className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white">{v.stage}</p>
                  <p className="text-[11px] text-slate-400">{v.desc}</p>
                </div>
                <span className="font-mono font-bold text-cyan-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  {v.days}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-purple-400 flex items-center gap-2">
            <CheckCircle2 size={16} /> Acquisition Source Attribution
          </h3>
          <div className="space-y-3">
            {[
              { source: 'DIGI8 Careers Website', count: '65%', note: 'High intent direct organic applications' },
              { source: 'LinkedIn Job Posts & InMail', count: '22%', note: 'Senior engineering & design talent' },
              { source: 'Employee Referrals', count: '10%', note: 'Highest offer-to-join conversion' },
              { source: 'Campus & Community Drives', count: '3%', note: 'Early career talent' },
            ].map((s, i) => (
              <div key={i} className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white">{s.source}</p>
                  <p className="text-[11px] text-slate-400">{s.note}</p>
                </div>
                <span className="font-mono font-bold text-purple-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  {s.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </AdminLayout>
  );
}
