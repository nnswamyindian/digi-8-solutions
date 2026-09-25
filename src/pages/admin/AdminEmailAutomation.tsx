import React, { useState, useEffect } from 'react';
import {
  Mail, Sparkles, Plus, Edit2, Trash2,
  Clock, RefreshCw, Send, Eye, X, ToggleLeft, ToggleRight
} from 'lucide-react';
import {
  type EmailTemplate,
  type AutomationRule,
  type EmailLog,
  type RecruitmentStage,
  fetchEmailTemplates,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  fetchAutomationRules,
  createAutomationRule,
  updateAutomationRule,
  deleteAutomationRule,
  fetchEmailLogs,
  fetchRecruitmentStages,
  checkSmtpStatus,
  testSmtpDispatch
} from '../../lib/api';
import AtsNavHeader from '../../components/admin/ats/AtsNavHeader';
import AdminLayout from './AdminLayout';

const AVAILABLE_VARIABLES = [
  { token: '{{candidate_name}}', desc: "Candidate's full name" },
  { token: '{{job_title}}', desc: 'Job opportunity title' },
  { token: '{{application_id}}', desc: 'Unique application ID' },
  { token: '{{company_name}}', desc: 'DIGI8 Solutions' },
  { token: '{{recruiter_name}}', desc: 'Assigned recruiter name' },
  { token: '{{stage_name}}', desc: 'Target pipeline stage' },
  { token: '{{interview_date}}', desc: 'Scheduled interview date' },
  { token: '{{interview_time}}', desc: 'Scheduled interview time' },
  { token: '{{meeting_link}}', desc: 'Video call link' },
  { token: '{{joining_date}}', desc: 'Expected joining date' },
];

export default function AdminEmailAutomation() {
  const [activeTab, setActiveTab] = useState<'templates' | 'rules' | 'logs'>('templates');
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [stages, setStages] = useState<RecruitmentStage[]>([]);
  const [loading, setLoading] = useState(true);

  // Template Modal Editor
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<number | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateBody, setTemplateBody] = useState('');
  const [templateCategory, setTemplateCategory] = useState<'acknowledgement' | 'shortlist' | 'interview' | 'offer' | 'rejection' | 'general'>('general');
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

  // Automation Rule Modal
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [ruleTrigger, setRuleTrigger] = useState<'stage_change' | 'interview_scheduled'>('stage_change');
  const [ruleStage, setRuleStage] = useState('applied');
  const [ruleTemplateId, setRuleTemplateId] = useState<number | ''>('');

  // Live SMTP Diagnostic State
  const [smtpStatus, setSmtpStatus] = useState<{ success: boolean; message: string; user?: string } | null>(null);
  const [testEmailTo, setTestEmailTo] = useState('');
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    loadAutomationData();
  }, []);

  const loadAutomationData = async () => {
    setLoading(true);
    try {
      const [tpls, rls, lgs, stgs, smtp] = await Promise.all([
        fetchEmailTemplates(),
        fetchAutomationRules(),
        fetchEmailLogs(),
        fetchRecruitmentStages(),
        checkSmtpStatus()
      ]);
      setTemplates(tpls);
      setRules(rls);
      setLogs(lgs);
      setStages(stgs);
      setSmtpStatus(smtp);
    } catch (err) {
      console.error('Error loading automation data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestingSmtp(true);
    setTestResult(null);
    try {
      const res = await testSmtpDispatch(testEmailTo.trim() || undefined);
      setTestResult(res);
      // Reload email logs to show the test email log
      const updatedLogs = await fetchEmailLogs();
      setLogs(updatedLogs);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Dispatch error' });
    } finally {
      setTestingSmtp(false);
    }
  };

  const handleOpenNewTemplate = () => {
    setEditingTemplateId(null);
    setTemplateName('');
    setTemplateSubject('');
    setTemplateBody('');
    setTemplateCategory('general');
    setShowTemplateModal(true);
  };

  const handleEditTemplate = (tpl: EmailTemplate) => {
    setEditingTemplateId(tpl.id);
    setTemplateName(tpl.name);
    setTemplateSubject(tpl.subject);
    setTemplateBody(tpl.body);
    setTemplateCategory(tpl.category);
    setShowTemplateModal(true);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim() || !templateSubject.trim() || !templateBody.trim()) return;

    try {
      if (editingTemplateId) {
        await updateEmailTemplate(editingTemplateId, {
          name: templateName,
          subject: templateSubject,
          body: templateBody,
          category: templateCategory
        });
      } else {
        await createEmailTemplate({
          name: templateName,
          subject: templateSubject,
          body: templateBody,
          category: templateCategory,
          variables: ['candidate_name', 'job_title', 'application_id']
        });
      }
      setShowTemplateModal(false);
      loadAutomationData();
    } catch (err) {
      console.error('Error saving template:', err);
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this email template?')) return;
    try {
      await deleteEmailTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error deleting template:', err);
    }
  };

  const handleToggleRule = async (rule: AutomationRule) => {
    const nextActive = !rule.is_active;
    try {
      await updateAutomationRule(rule.id, { is_active: nextActive ? 1 : 0 });
      setRules(prev => prev.map(r => r.id === rule.id ? { ...r, is_active: nextActive } : r));
    } catch (err) {
      console.error('Error toggling rule:', err);
    }
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim() || !ruleTemplateId) return;

    try {
      await createAutomationRule({
        name: ruleName.trim(),
        event_trigger: ruleTrigger,
        trigger_stage: ruleTrigger === 'stage_change' ? ruleStage : undefined,
        action_type: 'send_email',
        email_template_id: Number(ruleTemplateId),
        is_active: 1
      });
      setShowRuleModal(false);
      setRuleName('');
      setRuleTemplateId('');
      loadAutomationData();
    } catch (err) {
      console.error('Error creating rule:', err);
    }
  };

  const handleDeleteRule = async (id: number) => {
    if (!window.confirm('Delete this automated communication rule?')) return;
    try {
      await deleteAutomationRule(id);
      setRules(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Error deleting rule:', err);
    }
  };

  const insertVariableToken = (token: string) => {
    setTemplateBody(prev => `${prev} ${token} `);
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-20">
        {/* ATS Top Navigation Header */}
        <AtsNavHeader
          title="Communication & Automation"
          subtitle="Automated event-triggered email workflows, customizable templates with variable tokens, and dispatch auditing."
          badge="Auto-Notification Engine"
          actionButton={
            <button
              onClick={loadAutomationData}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Refresh automation rules"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          }
        />

      {/* SMTP Health & Live Test Dispatch Card */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${smtpStatus?.success ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-pulse' : 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]'}`} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">SMTP Email Gateway:</span>
              <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${smtpStatus?.success ? 'bg-emerald-950/60 border border-emerald-800/80 text-emerald-400' : 'bg-rose-950/60 border border-rose-800/80 text-rose-400'}`}>
                {smtpStatus?.success ? 'Connected & Authenticated' : 'Disconnected / Auth Error'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Dispatcher Account: <code className="text-cyan-400 font-mono">{smtpStatus?.user || 'digi8solutions@gmail.com'}</code> {smtpStatus?.success ? '(Ready to deliver)' : `— ${smtpStatus?.message || 'Check credentials'}`}
            </p>
          </div>
        </div>

        <form onSubmit={handleTestSmtp} className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="email"
            placeholder="Recipient email (optional)"
            value={testEmailTo}
            onChange={e => setTestEmailTo(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none w-full md:w-56 font-mono"
          />
          <button
            type="submit"
            disabled={testingSmtp}
            className="btn-glow whitespace-nowrap px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
          >
            <Send size={12} className={testingSmtp ? 'animate-spin' : ''} />
            {testingSmtp ? 'Sending...' : 'Test Dispatch'}
          </button>
        </form>
      </div>

      {testResult && (
        <div className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${testResult.success ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300' : 'bg-rose-950/40 border-rose-800/80 text-rose-300'}`}>
          <span>{testResult.message}</span>
          <button type="button" onClick={() => setTestResult(null)} className="text-slate-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 text-xs font-semibold gap-2">
        <button
          onClick={() => setActiveTab('templates')}
          className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'templates' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Mail size={14} /> Email Templates ({templates.length})
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'rules' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles size={14} /> Automation Rules ({rules.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'logs' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Clock size={14} /> Email Logs ({logs.length})
        </button>
      </div>

      {/* TAB 1: EMAIL TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Candidate Email Templates</h2>
            <button
              onClick={handleOpenNewTemplate}
              className="btn-glow px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md"
            >
              <Plus size={14} /> New Template
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map(tpl => (
              <div
                key={tpl.id}
                className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition-all shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-white text-sm">{tpl.name}</h3>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 mt-1 inline-block">
                        {tpl.category}
                      </span>
                    </div>
                    {Boolean(tpl.is_default) && (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        Default System
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 font-medium truncate">
                    Subject: <span className="text-white">{tpl.subject}</span>
                  </p>
                  <p className="text-xs text-slate-400 line-clamp-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60 leading-relaxed font-sans">
                    {tpl.body}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewTemplate(tpl)}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                  >
                    <Eye size={13} /> Preview Live
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditTemplate(tpl)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Edit Template"
                    >
                      <Edit2 size={14} />
                    </button>
                    {!tpl.is_default && (
                      <button
                        type="button"
                        onClick={() => handleDeleteTemplate(tpl.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                        title="Delete Template"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: AUTOMATION RULES */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Automated Event Triggers</h2>
            <button
              onClick={() => setShowRuleModal(true)}
              className="btn-glow px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
            >
              <Plus size={14} /> Create Automation Rule
            </button>
          </div>

          <div className="space-y-3">
            {rules.map(rule => (
              <div
                key={rule.id}
                className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-md hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleRule(rule)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {rule.is_active ? (
                      <ToggleRight size={28} className="text-emerald-400" />
                    ) : (
                      <ToggleLeft size={28} className="text-slate-600" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-sm">{rule.name}</h3>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.2 rounded-full ${
                        rule.is_active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {rule.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      <span>Trigger: <strong className="text-cyan-400">{rule.event_trigger.replace('_', ' ')}</strong></span>
                      {rule.trigger_stage && (
                        <span>&rarr; When stage is <strong className="text-white uppercase">{rule.trigger_stage}</strong></span>
                      )}
                      <span>&bull;</span>
                      <span>Action: <strong className="text-purple-400">Send Email</strong> ({rule.template_name || `Template #${rule.email_template_id}`})</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteRule(rule.id)}
                  className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Delete rule"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: EMAIL LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Recipient</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Template</th>
                  <th className="py-3.5 px-4">Dispatched By</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 italic">
                      No automated or manual emails logged yet.
                    </td>
                  </tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-900/50">
                      <td className="py-3.5 px-4 font-mono font-medium text-cyan-400">{log.candidate_email}</td>
                      <td className="py-3.5 px-4 text-white font-medium max-w-xs truncate">{log.subject}</td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          log.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{log.template_name || 'Custom'}</td>
                      <td className="py-3.5 px-4 text-slate-400">{log.sent_by}</td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">{new Date(log.sent_at).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit / Create Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-2xl w-full space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Mail size={16} className="text-cyan-400" /> {editingTemplateId ? 'Edit Email Template' : 'Create Email Template'}
              </h3>
              <button onClick={() => setShowTemplateModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Template Name</label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={e => setTemplateName(e.target.value)}
                    placeholder="e.g. Technical Round Invite"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <select
                    value={templateCategory}
                    onChange={e => setTemplateCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    <option value="acknowledgement">Acknowledgement</option>
                    <option value="shortlist">Shortlist</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejection">Rejection</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Subject Line</label>
                <input
                  type="text"
                  value={templateSubject}
                  onChange={e => setTemplateSubject(e.target.value)}
                  placeholder="e.g. Interview with DIGI8 Solutions - {{job_title}}"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  required
                />
              </div>

              {/* Variable Token Insertion Pills */}
              <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <p className="text-[11px] font-bold text-slate-400">Click to Insert Dynamic Variable:</p>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_VARIABLES.map(v => (
                    <button
                      key={v.token}
                      type="button"
                      onClick={() => insertVariableToken(v.token)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 text-[10px] font-mono transition-colors"
                      title={v.desc}
                    >
                      {v.token}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Template Body (Markdown / Plain Text)</label>
                <textarea
                  rows={8}
                  value={templateBody}
                  onChange={e => setTemplateBody(e.target.value)}
                  placeholder="Dear {{candidate_name}},&#10;&#10;We are pleased to inform you..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white font-sans leading-relaxed"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Eye size={16} className="text-cyan-400" /> Live Simulated Email Preview
              </h3>
              <button onClick={() => setPreviewTemplate(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Email Canvas Preview */}
            <div className="border border-slate-800 rounded-xl p-5 bg-slate-950 space-y-4 text-xs font-sans">
              <div className="border-b border-slate-800 pb-3">
                <p className="text-slate-500 text-[11px]">From: DIGI8 Solutions Careers &lt;careers@digi8solutions.com&gt;</p>
                <p className="text-slate-500 text-[11px]">To: Aarav Mehta &lt;aarav.mehta@example.com&gt;</p>
                <h4 className="text-white font-bold text-sm mt-2">
                  {previewTemplate.subject
                    .replace(/\{\{candidate_name\}\}/g, 'Aarav Mehta')
                    .replace(/\{\{job_title\}\}/g, 'Senior Frontend Developer')
                    .replace(/\{\{application_id\}\}/g, 'DIGI8-APP-2026-108241')}
                </h4>
              </div>

              <div className="text-slate-300 leading-relaxed whitespace-pre-line">
                {previewTemplate.body
                  .replace(/\{\{candidate_name\}\}/g, 'Aarav Mehta')
                  .replace(/\{\{job_title\}\}/g, 'Senior Frontend Developer')
                  .replace(/\{\{application_id\}\}/g, 'DIGI8-APP-2026-108241')
                  .replace(/\{\{company_name\}\}/g, 'DIGI8 Solutions')
                  .replace(/\{\{recruiter_name\}\}/g, 'Vikram Talent Lead')
                  .replace(/\{\{interview_date\}\}/g, 'Sep 15, 2026')
                  .replace(/\{\{interview_time\}\}/g, '03:00 PM IST')
                  .replace(/\{\{meeting_link\}\}/g, 'https://meet.google.com/dgi-eng-tech')
                  .replace(/\{\{joining_date\}\}/g, 'Oct 01, 2026')}
              </div>

              <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500">
                DIGI8 Solutions Talent Acquisition &bull; digi8solutions.com
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Automation Rule Modal */}
      {showRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles size={16} className="text-purple-400" /> New Automated Email Rule
              </h3>
              <button onClick={() => setShowRuleModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Rule Name</label>
                <input
                  type="text"
                  value={ruleName}
                  onChange={e => setRuleName(e.target.value)}
                  placeholder="e.g. Auto-reply on Application Shortlisted"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Trigger Event</label>
                <select
                  value={ruleTrigger}
                  onChange={e => setRuleTrigger(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  <option value="stage_change">Candidate Stage Changed</option>
                  <option value="interview_scheduled">Interview Round Scheduled</option>
                </select>
              </div>

              {ruleTrigger === 'stage_change' && (
                <div>
                  <label className="text-slate-400 block mb-1">When Candidate Moves to Stage:</label>
                  <select
                    value={ruleStage}
                    onChange={e => setRuleStage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white capitalize"
                  >
                    {stages.map(st => (
                      <option key={st.slug} value={st.slug}>{st.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-slate-400 block mb-1">Email Template to Dispatch</label>
                <select
                  value={ruleTemplateId}
                  onChange={e => setRuleTemplateId(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  required
                >
                  <option value="">-- Choose Template --</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRuleModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Activate Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
}
