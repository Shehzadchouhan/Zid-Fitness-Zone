import React, { useState, useEffect } from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  UserPlus,
  Phone,
  MessageSquare,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  Trash2,
  Calendar,
  AlertCircle,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  LogOut,
  Flame,
  Award,
  Camera,
  CreditCard,
  Mail
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { GYM_INFO } from '../../data/gymData';
import { normalizeIndianMobile } from '../../../shared/phone.js';

export default function AdminDashboard({ onExitAdmin }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [members, setMembers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState({});
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountPhotos, setAccountPhotos] = useState([]);

  // Filters
  const [leadStatusFilter, setLeadStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Feedback
  const [toastMessage, setToastMessage] = useState('');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberForm, setNewMemberForm] = useState({
    name: '',
    phone: '',
    email: '',
    plan: 'Gold Pro Athlete',
    trainerAssigned: 'Head Coach Shehzad'
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, leadsData, membersData, classesData, accountsData, paymentsData] = await Promise.all([
        api.getStats(),
        api.getLeads(),
        api.getMembers(),
        api.getClasses(),
        api.getRegisteredAccounts(),
        api.getPayments()
      ]);
      setStats(statsData);
      setLeads(leadsData);
      setMembers(membersData);
      setClasses(classesData);
      setAccounts(accountsData);
      setPayments(paymentsData);
    } catch (err) {
      console.error('Error fetching admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update Lead Status
  const handleUpdateLeadStatus = async (leadId, newStatus) => {
    try {
      const res = await api.updateLead(leadId, { status: newStatus });
      if (res.success) {
        setLeads(prev => prev.map(l => l.id === leadId ? res.lead : l));
        showToast(`Lead status updated to ${newStatus}`);
      }
    } catch {
      showToast('Failed to update status');
    }
  };

  // Convert Lead to Member
  const handleConvertLead = async (lead) => {
    try {
      const res = await api.createMember({
        name: lead.name,
        phone: lead.phone,
        email: lead.email || '',
        plan: lead.planInterest || 'Gold Pro Athlete',
        trainerAssigned: 'Mohd. Shehzad'
      });

      await api.updateLead(lead.id, { status: 'enrolled' });

      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.5 } });
      } catch {}

      showToast(`🎉 ${lead.name} converted to Member successfully!`);
      loadData();
    } catch {
      showToast('Conversion failed');
    }
  };

  // Delete / Archive Lead
  const handleDeleteLead = async (leadId) => {
    if (!confirm('Are you sure you want to remove this lead?')) return;
    try {
      await api.deleteLead(leadId);
      setLeads(prev => prev.filter(l => l.id !== leadId));
      showToast('Lead archived');
    } catch {
      showToast('Error deleting lead');
    }
  };

  // Check-In Member
  const handleCheckinMember = async (memberId) => {
    try {
      const res = await api.checkinMember(memberId);
      if (res.success) {
        showToast(`⚡ ${res.message}`);
        loadData();
      }
    } catch {
      showToast('Check-in error');
    }
  };

  // Add Member Manual
  const handleCreateMemberSubmit = async (e) => {
    e.preventDefault();
    const phone = normalizeIndianMobile(newMemberForm.phone);
    if (!phone) {
      showToast('Enter a valid Indian mobile number.');
      return;
    }
    try {
      const res = await api.createMember({ ...newMemberForm, phone });
      if (res.success) {
        showToast(`Member ${res.member.name} registered (${res.member.id})`);
        setShowAddMemberModal(false);
        setNewMemberForm({
          name: '',
          phone: '',
          email: '',
          plan: 'Gold Pro Athlete',
          trainerAssigned: 'Head Coach Shehzad'
        });
        loadData();
      }
    } catch {
      showToast('Failed to add member');
    }
  };

  const handleRecordPayment = async (leadId) => {
    const paymentMethod = paymentMethods[leadId] || 'cash';
    try {
      const result = await api.recordMembershipPayment(leadId, paymentMethod);
      setLeads(previous => previous.map(lead => lead.id === leadId ? result.lead : lead));
      setMembers(previous => [result.member, ...previous.filter(member => member.id !== result.member.id)]);
      setPayments(previous => [result.payment, ...previous]);
      showToast(`Payment recorded and membership activated for ${result.member.name}.`);
    } catch (err) {
      showToast(err.message || 'Could not record payment');
    }
  };

  const handleOpenAccount = async (account) => {
    setSelectedAccount(account);
    setAccountPhotos([]);
    const images = await Promise.all((account.progress || []).slice(0, 8).map(async (entry) => {
      try {
        return { ...entry, url: await api.getOwnerProgressPhoto(account.id, entry.id) };
      } catch {
        return { ...entry, url: '' };
      }
    }));
    setAccountPhotos(images);
  };

  const handleCloseAccount = () => {
    accountPhotos.forEach(photo => photo.url && URL.revokeObjectURL(photo.url));
    setAccountPhotos([]);
    setSelectedAccount(null);
  };

  // Export CSV
  const handleExportCSV = async () => {
    try {
      const fileUrl = URL.createObjectURL(await api.exportLeads());
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = 'SFZ_Leads_Report.csv';
      link.click();
      URL.revokeObjectURL(fileUrl);
    } catch (err) {
      showToast(err.message || 'Failed to export leads');
    }
  };

  // Filtered Leads
  const filteredLeads = leads.filter(l => {
    const matchStatus = leadStatusFilter === 'all' || l.status.toLowerCase() === leadStatusFilter.toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchSearch = !searchQuery ||
      l.name.toLowerCase().includes(q) ||
      l.phone.toLowerCase().includes(q) ||
      (l.locality && l.locality.toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  const membershipRequests = leads.filter(lead => lead.membershipRequest);
  const pendingFeeRequests = membershipRequests.filter(lead => lead.membershipRequest.paymentStatus === 'pending');
  const pendingFees = pendingFeeRequests.reduce((total, lead) => total + lead.membershipRequest.amount, 0);
  const recordedFees = payments.reduce((total, payment) => total + payment.amount, 0);

  return (
    <div className="min-h-screen bg-[#07080b] text-slate-100 font-sans pb-20">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-5 py-3 rounded-xl bg-amber-500 text-black font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0e1017]/95 border-b border-amber-500/20 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-black font-black">
            ZID
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bebas text-xl text-white">ZID</span>
              <span className="font-bebas text-xl text-amber-400">OWNER PORTAL</span>
            </div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block -mt-1">
              Manage inquiries, members, and classes
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onExitAdmin}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Return to Public Site</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-4 mb-8 border-b border-white/5 scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('leads')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'leads'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Inquiries ({leads.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('accounts')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'accounts'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Accounts ({accounts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('fees')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'fees'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Fees ({pendingFeeRequests.length} pending)</span>
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'members'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Members ({members.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('classes')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'classes'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Classes ({classes.length})</span>
          </button>
        </div>

        {/* Tab 1: Overview & KPIs */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <section className="flex flex-col gap-4 rounded-xl border border-white/10 bg-slate-900/60 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-bold text-white">Today's overview</h1>
                <p className="mt-1 text-sm text-slate-400">Start with a task, or review how the gym is doing.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTab('leads')}
                  className="rounded-lg border border-amber-500/40 px-4 py-2 text-sm font-semibold text-amber-300 hover:bg-amber-500/10"
                >
                  View inquiries ({leads.filter(lead => lead.status?.toLowerCase() === 'new').length} new)
                </button>
                <button
                  onClick={() => setActiveTab('members')}
                  className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/5"
                >
                  Check in a member
                </button>
                <button
                  onClick={() => setShowAddMemberModal(true)}
                  className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-black hover:bg-amber-400"
                >
                  Add member
                </button>
              </div>
            </section>
            
            {/* 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              <div className="glass-card rounded-2xl p-5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Active Members
                  </span>
                  <div className="text-3xl font-bebas text-white tracking-wide">
                    {stats?.totalMembers || 482}
                  </div>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" /> 94.2% renewal rate
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="glass-card rounded-2xl p-5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Today's Check-ins
                  </span>
                  <div className="text-3xl font-bebas text-amber-400 tracking-wide">
                    {stats?.activeToday || 74} Athletes
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Current on floor: <strong className="text-white">{stats?.currentFloorOccupancy || 28} / 60 max</strong>
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Flame className="w-6 h-6" />
                </div>
              </div>

              <div className="glass-card rounded-2xl p-5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Fees recorded this month
                  </span>
                  <div className="text-3xl font-bebas text-emerald-400 tracking-wide">
                    ₹{(stats?.monthlyRevenue || 0).toLocaleString('en-IN')}
                  </div>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
                    <CreditCard className="w-3 h-3" /> {stats?.paymentsThisMonth || 0} payments recorded
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              <div className="glass-card rounded-2xl p-5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Inquiries enrolled
                  </span>
                  <div className="text-3xl font-bebas text-purple-400 tracking-wide">
                    {stats?.calculatedConversion || 36.8}%
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {leads.length} inquiries received
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Activity className="w-6 h-6" />
                </div>
              </div>

            </div>

            {/* Arena Floor Capacity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Floor Occupancy Meter */}
              <div className="lg:col-span-7 glass-card rounded-2xl p-6 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Live Floor Capacity & Traffic</h3>
                    <p className="text-xs text-slate-400">Sensors connected to turnstile biometric entry</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    🟢 OPTIMAL FLOW
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Current Occupancy</span>
                    <span>{stats?.currentFloorOccupancy || 28} / 60 Athletes (46%)</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500"
                      style={{ width: `${((stats?.currentFloorOccupancy || 28) / 60) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">Free Weight Area</span>
                    <strong className="text-white">12 Athletes</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">CrossFit Turf</span>
                    <strong className="text-white">9 Athletes</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">Cardio / Sauna</span>
                    <strong className="text-white">7 Athletes</strong>
                  </div>
                </div>
              </div>

              {/* Recent Real-Time Check-in Feed */}
              <div className="lg:col-span-5 glass-card rounded-2xl p-6 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Recent Attendance Logs</h3>
                  <span className="text-xs text-slate-400 font-mono">LIVE FEED</span>
                </div>

                <div className="divide-y divide-white/5 space-y-2">
                  {(stats?.recentCheckins || []).map((chk) => (
                    <div key={chk.id} className="pt-2 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-white block">{chk.memberName}</strong>
                        <span className="text-slate-400">{chk.plan}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                        {chk.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Tab 2: Leads Pipeline & Management */}
        {activeTab === 'leads' && (
          <div className="space-y-6">
            
            {/* Filter Bar & Export */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-card p-4 rounded-2xl border border-white/10">
              
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Status:
                </span>
                {['all', 'new', 'trial_scheduled', 'contacted', 'enrolled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setLeadStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                      leadStatusFilter === st
                        ? 'bg-amber-500 text-black'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, phone..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>

            </div>

            {/* Leads Table */}
            <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase border-b border-white/10">
                    <tr>
                      <th className="py-3.5 px-4">Lead Name</th>
                      <th className="py-3.5 px-4">Contact</th>
                      <th className="py-3.5 px-4">Locality & Goal</th>
                      <th className="py-3.5 px-4">Plan Interest</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4">
                          <strong className="text-white text-sm block">{lead.name}</strong>
                          <span className="text-[10px] text-slate-400">
                            Age: {lead.age || 'N/A'} • {lead.gender || 'N/A'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-slate-300 font-medium">{lead.phone}</div>
                          <div className="text-slate-500 text-[10px]">{lead.email || 'No email'}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-slate-200">{lead.locality || 'Ludhiana'}</div>
                          <div className="text-amber-400 font-semibold">{lead.goal}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                            {lead.planInterest || 'Standard'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <select
                            value={lead.status}
                            onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value)}
                            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-[11px] font-bold text-amber-300 focus:outline-none"
                          >
                            <option value="new">NEW INQUIRY</option>
                            <option value="trial_scheduled">TRIAL BOOKED</option>
                            <option value="contacted">CONTACTED</option>
                            <option value="enrolled">ENROLLED</option>
                            <option value="lost">LOST</option>
                          </select>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* WhatsApp follow-up button */}
                            <a
                              href={`https://wa.me/${lead.phone.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(lead.name)},%20this%20is%20Coach%20Shehzad%20from%20Shehzad%20Fitness%20Zone.%20We%20received%20your%20inquiry%20regarding%20${encodeURIComponent(lead.goal)}!`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-500/30"
                              title="Message Lead on WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>

                            {/* Direct Call */}
                            <a
                              href={`tel:${lead.phone}`}
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                              title="Call Lead"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>

                            {/* Convert to Member */}
                            {lead.membershipRequest?.paymentStatus === 'pending' ? (
                              <button type="button" onClick={() => setActiveTab('fees')} className="rounded-lg border border-amber-500/40 px-2 py-1 text-[10px] font-bold text-amber-300 hover:bg-amber-500/10">Fees</button>
                            ) : lead.status !== 'enrolled' && !lead.membershipRequest && (
                              <button
                                onClick={() => handleConvertLead(lead)}
                                className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[10px]"
                                title="Promote lead to Member"
                              >
                                Convert
                              </button>
                            )}

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteLead(lead.id)}
                              className="p-1.5 rounded-lg bg-slate-900 text-rose-400 hover:bg-rose-950"
                              title="Archive Lead"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'accounts' && (
          <section className="space-y-6">
            <div className="flex flex-col gap-2 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">Registered member accounts</p>
                <h1 className="mt-1 text-2xl font-bold text-white">Profiles & progress</h1>
                <p className="mt-1 text-xs text-slate-400">Account details and member-submitted training photos. Photos are private account data.</p>
              </div>
              <div className="text-xs text-slate-400">{accounts.length} registered accounts · {accounts.reduce((total, account) => total + account.progress.length, 0)} progress entries</div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0e1115]">
              <table className="w-full min-w-[760px] text-left text-xs">
                <thead className="border-b border-white/10 bg-slate-900/90 uppercase text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Member account</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Goal</th>
                    <th className="px-4 py-3">Progress</th>
                    <th className="px-4 py-3">Account since</th>
                    <th className="px-4 py-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {accounts.map((account) => (
                    <tr key={account.id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3.5"><strong className="block text-sm text-white">{account.name}</strong><span className="mt-1 block text-[10px] text-slate-500">{account.currentStreak} day streak · best {account.longestStreak}</span></td>
                      <td className="px-4 py-3.5"><span className="block text-slate-300">{account.profile.phone || 'No phone added'}</span><span className="mt-1 block text-[10px] text-slate-500">{account.email}</span></td>
                      <td className="px-4 py-3.5 text-slate-300">{account.profile.goal || 'Not set'}</td>
                      <td className="px-4 py-3.5"><span className="inline-flex items-center gap-1.5 text-emerald-300"><Camera className="h-3.5 w-3.5" />{account.progress.length} entries</span></td>
                      <td className="px-4 py-3.5 text-slate-400">{new Date(account.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3.5 text-right"><button type="button" onClick={() => handleOpenAccount(account)} className="rounded-md border border-slate-700 px-3 py-1.5 font-semibold text-slate-300 hover:border-emerald-400/50 hover:text-emerald-200">View progress</button></td>
                    </tr>
                  ))}
                  {accounts.length === 0 && <tr><td colSpan="6" className="px-4 py-12 text-center text-slate-500">No member accounts have registered yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'fees' && (
          <section className="space-y-6">
            <div className="flex flex-col gap-2 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">Membership billing</p>
                <h1 className="mt-1 text-2xl font-bold text-white">Fees & payments</h1>
                <p className="mt-1 text-xs text-slate-400">Only requests and payments recorded here are included. No online payment is processed by this demo.</p>
              </div>
              <button type="button" onClick={loadData} className="flex items-center gap-2 self-start rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-amber-400/50 hover:text-amber-200 sm:self-auto"><RefreshCw className="h-3.5 w-3.5" />Refresh ledger</button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="border-l-2 border-amber-400 bg-[#101317] px-4 py-4"><span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Fees outstanding</span><div className="mt-2 text-2xl font-black text-amber-300">₹{pendingFees.toLocaleString('en-IN')}</div><div className="mt-1 text-xs text-slate-500">{pendingFeeRequests.length} pending requests</div></div>
              <div className="border-l-2 border-emerald-400 bg-[#101317] px-4 py-4"><span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Payments recorded</span><div className="mt-2 text-2xl font-black text-emerald-300">₹{recordedFees.toLocaleString('en-IN')}</div><div className="mt-1 text-xs text-slate-500">{payments.length} recorded payments</div></div>
              <div className="border-l-2 border-sky-400 bg-[#101317] px-4 py-4"><span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Membership requests</span><div className="mt-2 text-2xl font-black text-white">{membershipRequests.length}</div><div className="mt-1 text-xs text-slate-500">Monthly and annual plans</div></div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0e1115]">
              <table className="w-full min-w-[850px] text-left text-xs">
                <thead className="border-b border-white/10 bg-slate-900/90 uppercase text-slate-400">
                  <tr><th className="px-4 py-3">Applicant</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Billing</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {membershipRequests.map((lead) => {
                    const fee = lead.membershipRequest;
                    const message = `Hi ${lead.name}, your ${lead.planInterest} ${fee.billingCycle} membership request is pending. The fee is ₹${fee.amount.toLocaleString('en-IN')}. Please contact ZID or visit the front desk to complete payment.`;
                    return (
                      <tr key={lead.id} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3.5"><strong className="block text-sm text-white">{lead.name}</strong><span className="text-[10px] text-slate-500">{lead.phone} · {new Date(fee.requestedAt).toLocaleDateString()}</span></td>
                        <td className="px-4 py-3.5 text-slate-200">{lead.planInterest}</td>
                        <td className="px-4 py-3.5 capitalize text-slate-300">{fee.billingCycle}</td>
                        <td className="px-4 py-3.5 font-bold text-white">₹{fee.amount.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3.5"><span className={`rounded px-2 py-1 text-[10px] font-bold uppercase ${fee.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-amber-500/10 text-amber-300'}`}>{fee.paymentStatus}</span>{fee.paymentMethod && <span className="ml-2 text-[10px] capitalize text-slate-500">{fee.paymentMethod}</span>}</td>
                        <td className="px-4 py-3.5">
                          {fee.paymentStatus === 'pending' ? (
                            <div className="flex items-center justify-end gap-2">
                              <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 px-2.5 py-1.5 text-emerald-300 hover:bg-emerald-500/10"><MessageSquare className="h-3.5 w-3.5" />Reminder</a>
                              <select aria-label={`Payment method for ${lead.name}`} value={paymentMethods[lead.id] || 'cash'} onChange={(event) => setPaymentMethods(previous => ({ ...previous, [lead.id]: event.target.value }))} className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-slate-200"><option value="cash">Cash</option><option value="upi">UPI</option><option value="card">Card</option><option value="bank transfer">Bank transfer</option></select>
                              <button type="button" onClick={() => handleRecordPayment(lead.id)} className="rounded-md bg-amber-500 px-2.5 py-1.5 font-bold text-black hover:bg-amber-400">Record payment</button>
                            </div>
                          ) : <div className="text-right text-[10px] text-slate-500">Paid {new Date(fee.paidAt).toLocaleDateString()} · member {fee.memberId}</div>}
                        </td>
                      </tr>
                    );
                  })}
                  {membershipRequests.length === 0 && <tr><td colSpan="6" className="px-4 py-12 text-center text-slate-500">No plan requests yet. Plan requests from the public site will appear here.</td></tr>}
                </tbody>
              </table>
            </div>

            <div className="border-t border-white/10 pt-5">
              <h2 className="mb-3 text-sm font-bold text-white">Recorded payment history</h2>
              {payments.length ? <div className="divide-y divide-white/5">{payments.slice(0, 10).map(payment => <div key={payment.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-xs"><div><strong className="text-white">{payment.name}</strong><span className="ml-2 text-slate-400">{payment.plan} · {payment.method}</span></div><div className="flex items-center gap-3"><span className="font-bold text-emerald-300">₹{payment.amount.toLocaleString('en-IN')}</span><span className="text-slate-500">{new Date(payment.paidAt).toLocaleDateString()}</span></div></div>)}</div> : <p className="text-xs text-slate-500">No payments have been recorded yet.</p>}
            </div>
          </section>
        )}

        {/* Tab 3: Members & Front Desk Attendance Check-In */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            
            <div className="flex items-center justify-between glass-card p-4 rounded-2xl border border-white/10">
              <div>
                <h3 className="text-base font-bold text-white">Active Member Roster & Attendance</h3>
                <p className="text-xs text-slate-400">Simulate front-desk biometric or QR code entry</p>
              </div>

              <button
                onClick={() => setShowAddMemberModal(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Member</span>
              </button>
            </div>

            <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase border-b border-white/10">
                  <tr>
                    <th className="py-3.5 px-4">Member ID</th>
                    <th className="py-3.5 px-4">Athlete Name</th>
                    <th className="py-3.5 px-4">Tier</th>
                    <th className="py-3.5 px-4">Assigned Coach</th>
                    <th className="py-3.5 px-4">Attendance Streak</th>
                    <th className="py-3.5 px-4 text-right">Attendance Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-white/[0.02]">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                        {m.id}
                      </td>

                      <td className="py-3.5 px-4">
                        <strong className="text-white text-sm block">{m.name}</strong>
                        <span className="text-slate-400 text-[10px]">{m.phone}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded bg-slate-800 text-amber-300 font-semibold">
                          {m.plan}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        {m.trainerAssigned || 'Head Coach Shehzad'}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-rose-400" />
                          <span className="font-bold text-white">{m.streak || 1} Days</span>
                          <span className="text-[10px] text-slate-500">({m.checkinCount} total)</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleCheckinMember(m.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1 ml-auto"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Punch In</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* Tab 4: Class Capacity Monitor */}
        {activeTab === 'classes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => {
              const spotsLeft = cls.capacity - cls.enrolled;
              const fillPct = Math.round((cls.enrolled / cls.capacity) * 100);

              return (
                <div key={cls.id} className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase">
                      {cls.category}
                    </span>
                    <span className="text-xs text-slate-400">{cls.time}</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">{cls.title}</h3>
                    <p className="text-xs text-slate-400">Coach: {cls.instructor}</p>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Class Fill</span>
                      <strong className="text-amber-400">{cls.enrolled}/{cls.capacity} ({fillPct}%)</strong>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-amber-500"
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                    <span>Days: {cls.days.join(', ')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {selectedAccount && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && handleCloseAccount()}>
          <section role="dialog" aria-modal="true" aria-labelledby="member-progress-title" className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-emerald-500/30 bg-[#0d1114] p-5 shadow-2xl sm:p-7">
            <button type="button" onClick={handleCloseAccount} aria-label="Close member progress" className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"><X className="h-5 w-5" /></button>
            <div className="flex flex-col gap-4 border-b border-white/10 pb-5 pr-10 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">Registered member account</p>
                <h2 id="member-progress-title" className="mt-1 text-2xl font-bold text-white">{selectedAccount.name}</h2>
                <p className="mt-1 text-xs text-slate-400">{selectedAccount.email} · {selectedAccount.profile.phone || 'No phone provided'}</p>
                {selectedAccount.profile.goal && <p className="mt-2 text-sm text-slate-300">Goal: {selectedAccount.profile.goal}</p>}
              </div>
              <div className="flex gap-5 text-xs">
                <div><span className="block text-slate-500">Current streak</span><strong className="mt-1 block text-lg text-amber-300">{selectedAccount.currentStreak} days</strong></div>
                <div><span className="block text-slate-500">Longest streak</span><strong className="mt-1 block text-lg text-emerald-300">{selectedAccount.longestStreak} days</strong></div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
              <div className="border-l border-slate-700 pl-3"><span className="block text-slate-500">Height</span><strong className="mt-1 block text-slate-200">{selectedAccount.profile.heightCm ? `${selectedAccount.profile.heightCm} cm` : 'Not set'}</strong></div>
              <div className="border-l border-slate-700 pl-3"><span className="block text-slate-500">Starting weight</span><strong className="mt-1 block text-slate-200">{selectedAccount.profile.startingWeightKg ? `${selectedAccount.profile.startingWeightKg} kg` : 'Not set'}</strong></div>
              <div className="border-l border-slate-700 pl-3"><span className="block text-slate-500">Progress entries</span><strong className="mt-1 block text-slate-200">{selectedAccount.progress.length}</strong></div>
              <div className="border-l border-slate-700 pl-3"><span className="block text-slate-500">Account created</span><strong className="mt-1 block text-slate-200">{new Date(selectedAccount.createdAt).toLocaleDateString()}</strong></div>
            </div>

            <div className="mt-7 border-t border-white/10 pt-5">
              <div className="mb-4 flex items-center gap-2"><Camera className="h-4 w-4 text-emerald-300" /><h3 className="text-sm font-bold text-white">Member-submitted progress</h3></div>
              {selectedAccount.progress.length === 0 ? (
                <p className="border-y border-white/5 py-8 text-center text-xs text-slate-500">This member has not uploaded progress yet.</p>
              ) : accountPhotos.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-500">Loading private progress photos...</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {accountPhotos.map((photo) => (
                    <article key={photo.id} className="overflow-hidden rounded-lg border border-white/10 bg-[#111519]">
                      <div className="aspect-[4/3] bg-slate-900">{photo.url ? <img src={photo.url} alt={`${selectedAccount.name} progress from ${photo.date}`} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-slate-500">Photo unavailable</div>}</div>
                      <div className="p-3"><div className="flex items-center justify-between gap-2 text-xs"><strong className="text-white">{new Date(`${photo.date}T00:00:00Z`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</strong>{photo.weightKg && <span className="text-sky-300">{photo.weightKg} kg</span>}</div><p className="mt-1 min-h-8 text-[11px] leading-relaxed text-slate-400">{photo.note || 'Progress logged'}</p></div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md glass-card rounded-2xl border border-amber-500/30 p-6 shadow-2xl">
            <button
              onClick={() => setShowAddMemberModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-4">Enroll New Member</h3>

            <form onSubmit={handleCreateMemberSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 uppercase mb-1 font-semibold">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newMemberForm.name}
                  onChange={(e) => setNewMemberForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                  placeholder="e.g. Navjot Sandhu"
                />
              </div>

              <div>
                <label className="block text-slate-300 uppercase mb-1 font-semibold">Phone *</label>
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={16}
                  required
                  value={newMemberForm.phone}
                  onChange={(e) => setNewMemberForm(p => ({ ...p, phone: e.target.value }))}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                  placeholder="98765 43210 or +91"
                />
              </div>

              <div>
                <label className="block text-slate-300 uppercase mb-1 font-semibold">Membership Plan</label>
                <select
                  value={newMemberForm.plan}
                  onChange={(e) => setNewMemberForm(p => ({ ...p, plan: e.target.value }))}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                >
                  <option value="Silver Starter">Silver Starter</option>
                  <option value="Gold Pro Athlete">Gold Pro Athlete</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 uppercase mb-1 font-semibold">Assigned coach</label>
                <div className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white">
                  Mohd. Shehzad
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 text-black font-extrabold uppercase tracking-wider mt-4"
              >
                Register & Issue ID
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
