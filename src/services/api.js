// API client with seamless fallback to localStorage for offline / static previews

const API_BASE = '/api';
const AUTH_TOKEN_KEY = 'sfz_auth_token';

function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function setAuthToken(token) {
  if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
  else localStorage.removeItem(AUTH_TOKEN_KEY);
}

async function ownerRequest(path, options = {}) {
  const token = getAuthToken();
  if (!token) throw new Error('Sign in as the owner to continue.');
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
      Authorization: `Bearer ${token}`
    }
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Owner request failed.');
  return result;
}

async function authRequest(path, account) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(account)
    });
  } catch {
    throw new Error('Cannot reach the SFZ API. Start the backend with `npm run server`.');
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error(`The SFZ API returned an invalid response (HTTP ${response.status}). Ensure the backend is running with npm run server.`);
  }
  if (!response.ok) throw new Error(result.error || 'Authentication failed.');
  setAuthToken(result.token);
  return result;
}

async function memberRequest(path, options = {}) {
  const token = getAuthToken();
  if (!token) throw new Error('Sign in to view your member profile.');
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
        Authorization: `Bearer ${token}`
      }
    });
  } catch {
    throw new Error('Cannot reach the SFZ API. Start the backend with npm run server.');
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error(`The SFZ API returned an invalid response (HTTP ${response.status}).`);
  }
  if (!response.ok) throw new Error(result.error || 'Member request failed.');
  return result;
}

async function memberPhotoRequest(progressId) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}/member/progress/${encodeURIComponent(progressId)}/photo`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Could not load progress photo.');
  return URL.createObjectURL(await response.blob());
}

async function ownerPhotoRequest(accountId, progressId) {
  const token = getAuthToken();
  if (!token) throw new Error('Sign in as the owner to continue.');
  const response = await fetch(`${API_BASE}/owner/accounts/${encodeURIComponent(accountId)}/progress/${encodeURIComponent(progressId)}/photo`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Could not load the member progress photo.');
  return URL.createObjectURL(await response.blob());
}

// Initial local fallback seed data
const FALLBACK_SEED = {
  stats: {
    totalMembers: 482,
    activeToday: 74,
    currentFloorOccupancy: 28,
    maxFloorCapacity: 60,
    monthlyRevenue: 685000,
    monthlyRevenueGrowth: 14.5,
    conversionRate: 36.8,
    renewalRate: 94.2
  },
  leads: [
    {
      id: "lead-101",
      name: "Amanpreet Singh",
      email: "aman.singh88@gmail.com",
      phone: "+91 98140 23456",
      age: 26,
      gender: "male",
      locality: "Model Town, Ludhiana",
      goal: "Muscle Building & Hypertrophy",
      planInterest: "Gold Pro",
      timePreference: "Evening (6:00 PM - 8:00 PM)",
      status: "new",
      source: "Website Join Form",
      createdAt: "2026-09-30T10:15:00.000Z",
      notes: "Interested in 1-on-1 personal training with Head Coach Shehzad."
    },
    {
      id: "lead-102",
      name: "Priya Sharma",
      email: "priyasharma.fit@yahoo.com",
      phone: "+91 98722 89012",
      age: 24,
      gender: "female",
      locality: "Sarabha Nagar, Ludhiana",
      goal: "Weight Loss & HIIT",
      planInterest: "Diamond Elite",
      timePreference: "Morning (6:30 AM - 8:00 AM)",
      status: "trial_scheduled",
      source: "Free Trial Modal",
      createdAt: "2026-09-29T14:30:00.000Z",
      notes: "Trial pass booked for Thursday 7:00 AM HIIT class."
    },
    {
      id: "lead-103",
      name: "Harinder Dhillon",
      email: "harinder.dhillon@outlook.com",
      phone: "+91 98881 55678",
      age: 31,
      gender: "male",
      locality: "BRS Nagar, Ludhiana",
      goal: "Powerlifting & Strength",
      planInterest: "Gold Pro",
      timePreference: "Night (8:00 PM - 10:00 PM)",
      status: "contacted",
      source: "Website Join Form",
      createdAt: "2026-09-28T18:45:00.000Z",
      notes: "Discussed deadlift platform availability. Sent pricing brochure on WhatsApp."
    },
    {
      id: "lead-104",
      name: "Jasleen Kaur",
      email: "jasleen.kaur94@gmail.com",
      phone: "+91 97810 65432",
      age: 29,
      gender: "female",
      locality: "Pakhowal Road, Ludhiana",
      goal: "Flexibility & Posture Rehabilitation",
      planInterest: "Silver Starter",
      timePreference: "Afternoon (11:00 AM - 1:00 PM)",
      status: "enrolled",
      source: "Direct Walk-in / Contact",
      createdAt: "2026-09-27T11:20:00.000Z",
      notes: "Enrolled in 6-month Gold plan with Diet consultation."
    },
    {
      id: "lead-105",
      name: "Vikram Sethi",
      email: "vikram.sethi@gmail.com",
      phone: "+91 99150 44321",
      age: 35,
      gender: "male",
      locality: "Civil Lines, Ludhiana",
      goal: "Cardio & Stamina Endurance",
      planInterest: "Gold Pro",
      timePreference: "Morning (6:00 AM - 7:30 AM)",
      status: "new",
      source: "Website Calculator Lead",
      createdAt: "2026-09-30T17:40:00.000Z",
      notes: "Calculated BMI (28.4 Overweight). Requested fat loss roadmap."
    }
  ],
  members: [
    {
      id: "SFZ-001",
      name: "Mohit Varma",
      phone: "+91 98155 11223",
      email: "mohit.varma@gmail.com",
      plan: "Diamond Elite",
      status: "active",
      joinDate: "2025-11-15",
      expiryDate: "2026-11-15",
      checkinCount: 184,
      lastCheckin: "2026-09-30T07:15:00.000Z",
      streak: 5,
      trainerAssigned: "Mohd. Shehzad"
    },
    {
      id: "SFZ-002",
      name: "Simran Gill",
      phone: "+91 98765 99887",
      email: "simran.gill@gmail.com",
      plan: "Gold Pro",
      status: "active",
      joinDate: "2026-01-10",
      expiryDate: "2027-01-10",
      checkinCount: 142,
      lastCheckin: "2026-09-30T08:30:00.000Z",
      streak: 3,
      trainerAssigned: "Simran Kaur"
    },
    {
      id: "SFZ-003",
      name: "Rajiv Khanna",
      phone: "+91 98880 77665",
      email: "rajiv.khanna@bizcorp.in",
      plan: "Silver Starter",
      status: "active",
      joinDate: "2026-04-01",
      expiryDate: "2026-10-01",
      checkinCount: 68,
      lastCheckin: "2026-09-29T18:10:00.000Z",
      streak: 1,
      trainerAssigned: "Gurpreet Singh"
    },
    {
      id: "SFZ-004",
      name: "Navneet Sandhu",
      phone: "+91 99144 33221",
      email: "navneet.sandhu@gmail.com",
      plan: "Gold Pro",
      status: "active",
      joinDate: "2025-08-20",
      expiryDate: "2026-10-20",
      checkinCount: 210,
      lastCheckin: "2026-09-30T06:45:00.000Z",
      streak: 12,
      trainerAssigned: "Rohit Verma"
    },
    {
      id: "SFZ-005",
      name: "Ananya Rajput",
      phone: "+91 97790 88123",
      email: "ananya.rajput@gmail.com",
      plan: "Diamond Elite",
      status: "active",
      joinDate: "2026-06-15",
      expiryDate: "2027-06-15",
      checkinCount: 78,
      lastCheckin: "2026-09-30T09:10:00.000Z",
      streak: 4,
      trainerAssigned: "Mohd. Shehzad"
    }
  ],
  classes: [
    {
      id: "cls-1",
      title: "SFZ Spartan CrossFit",
      category: "CrossFit",
      time: "06:30 AM - 07:30 AM",
      days: ["Monday", "Wednesday", "Friday"],
      instructor: "Gurpreet Singh",
      capacity: 20,
      enrolled: 17,
      intensity: "High",
      calories: "650-800 kcal",
      level: "Intermediate / Advanced",
      description: "Functional Olympic lifting complexes, kettlebell circuits, rope climbs, and max anaerobic capacity."
    },
    {
      id: "cls-2",
      title: "Hypertrophy Beast Iron Club",
      category: "Strength",
      time: "07:30 AM - 08:30 AM",
      days: ["Monday", "Tuesday", "Thursday", "Saturday"],
      instructor: "Mohd. Shehzad",
      capacity: 15,
      enrolled: 14,
      intensity: "High",
      calories: "500-650 kcal",
      level: "All Levels",
      description: "Progressive overload barbell training focusing on chest, delts, back, and compound strength foundations."
    },
    {
      id: "cls-3",
      title: "Metabolic HIIT & Calorie Melt",
      category: "HIIT",
      time: "06:00 PM - 07:00 PM",
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      instructor: "Simran Kaur",
      capacity: 25,
      enrolled: 21,
      intensity: "Extreme",
      calories: "700-900 kcal",
      level: "All Levels",
      description: "Explosive plyometrics, ski-erg, assault bikes, battle ropes, and athletic agility drills."
    },
    {
      id: "cls-4",
      title: "Combat Boxing & Core Shred",
      category: "Combat",
      time: "07:00 PM - 08:00 PM",
      days: ["Tuesday", "Thursday", "Saturday"],
      instructor: "Rohit Verma",
      capacity: 18,
      enrolled: 15,
      intensity: "High",
      calories: "600-750 kcal",
      level: "Beginner to Advanced",
      description: "Heavy bag combos, speed drills, shadow boxing, footwork, and isometric core conditioning."
    },
    {
      id: "cls-5",
      title: "Olympic Power & Squat Clinic",
      category: "Powerlifting",
      time: "08:00 PM - 09:00 PM",
      days: ["Wednesday", "Friday"],
      instructor: "Mohd. Shehzad",
      capacity: 12,
      enrolled: 10,
      intensity: "Max Strength",
      calories: "450-550 kcal",
      level: "Intermediate",
      description: "Biomechanics deep dive, bar path optimization, chalk-and-iron 1RM peaking cycles."
    },
    {
      id: "cls-6",
      title: "Mobility, Yoga & Spinal Decompression",
      category: "Yoga",
      time: "08:00 AM - 09:00 AM",
      days: ["Saturday", "Sunday"],
      instructor: "Simran Kaur",
      capacity: 20,
      enrolled: 13,
      intensity: "Moderate",
      calories: "250-350 kcal",
      level: "All Levels",
      description: "Hip openers, thoracic spine articulation, active dynamic stretching, and breathwork recovery."
    }
  ],
  recentCheckins: [
    { id: "chk-1", memberName: "Mohit Varma", plan: "Diamond Elite", time: "Just now", timestamp: new Date().toISOString() },
    { id: "chk-2", memberName: "Ananya Rajput", plan: "Diamond Elite", time: "12 mins ago", timestamp: new Date(Date.now() - 12*60000).toISOString() },
    { id: "chk-3", memberName: "Simran Gill", plan: "Gold Pro", time: "35 mins ago", timestamp: new Date(Date.now() - 35*60000).toISOString() },
    { id: "chk-4", memberName: "Navneet Sandhu", plan: "Gold Pro", time: "1 hour ago", timestamp: new Date(Date.now() - 60*60000).toISOString() }
  ]
};

function getLocalData() {
  const stored = localStorage.getItem('sfz_gym_data');
  if (!stored) {
    localStorage.setItem('sfz_gym_data', JSON.stringify(FALLBACK_SEED));
    return FALLBACK_SEED;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return FALLBACK_SEED;
  }
}

function saveLocalData(data) {
  localStorage.setItem('sfz_gym_data', JSON.stringify(data));
}

// API Methods with automatic offline fallback
export const api = {
  auth: {
    async register(account) {
      return authRequest('/auth/register', account);
    },
    async login(credentials) {
      return authRequest('/auth/login', credentials);
    },
    async currentUser() {
      const token = getAuthToken();
      if (!token) return null;
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Your session has expired.');
      return (await response.json()).user;
    },
    logout() {
      setAuthToken(null);
    }
  },

  member: {
    getProfile() {
      return memberRequest('/member/profile');
    },
    updateProfile(profile) {
      return memberRequest('/member/profile', { method: 'PATCH', body: JSON.stringify(profile) });
    },
    uploadProgress(formData) {
      return memberRequest('/member/progress', { method: 'POST', body: formData });
    },
    getProgressPhoto: memberPhotoRequest
  },

  // Check backend availability
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) return await res.json();
    } catch {}
    return { status: 'mock-offline', gym: 'SFZ Local Mode' };
  },

  // Get Analytics stats
  async getStats() {
    try {
      return await ownerRequest('/stats');
    } catch {
      const local = getLocalData();
      return {
        totalMembers: local.stats?.totalMembers ?? 482,
        activeToday: local.stats?.activeToday ?? 74,
        currentFloorOccupancy: local.stats?.currentFloorOccupancy ?? 28,
        maxFloorCapacity: local.stats?.maxFloorCapacity ?? 60,
        monthlyRevenue: local.stats?.monthlyRevenue ?? 685000,
        monthlyRevenueGrowth: local.stats?.monthlyRevenueGrowth ?? 14.5,
        conversionRate: local.stats?.conversionRate ?? 36.8,
        renewalRate: local.stats?.renewalRate ?? 94.2,
        recentCheckins: local.recentCheckins || [],
        totalLeads: (local.leads || []).length,
        convertedLeads: (local.leads || []).filter(lead => lead.status === 'enrolled').length,
        calculatedConversion: 36.8,
        pendingFees: 0,
        paymentsThisMonth: 0
      };
    }
  },

  // Get Leads
  async getLeads(params = {}) {
    const query = new URLSearchParams(params).toString();
    try {
      return await ownerRequest(`/leads?${query}`);
    } catch {
      const local = getLocalData();
      let leads = [...(local.leads || [])];
      const status = params.status;
      const search = params.search;

      if (status && status !== 'all') {
        leads = leads.filter(lead => (lead.status || '').toLowerCase() === String(status).toLowerCase());
      }

      if (search) {
        const keyword = String(search).trim().toLowerCase();
        leads = leads.filter(lead =>
          [lead.name, lead.phone, lead.locality, lead.goal].join(' ').toLowerCase().includes(keyword)
        );
      }

      return leads;
    }
  },

  // Create new Lead
  async createLead(leadData) {
    let response;
    try {
      response = await fetch(`${API_BASE}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
        signal: AbortSignal.timeout(3000)
      });
    } catch {}
    if (response) {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not submit your request.');
      return result;
    }

    const local = getLocalData();
    const newLead = {
      id: `lead-${Date.now()}`,
      ...leadData,
      status: 'new',
      createdAt: new Date().toISOString()
    };
    local.leads.unshift(newLead);
    saveLocalData(local);
    return {
      success: true,
      message: 'Inquiry received successfully! An SFZ Fitness Consultant will contact you within 15 minutes.',
      lead: newLead
    };
  },

  // Update Lead
  async updateLead(id, updates) {
    try {
      return await ownerRequest(`/leads/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
    } catch {
      const local = getLocalData();
      const index = (local.leads || []).findIndex(lead => lead.id === id);
      if (index === -1) throw new Error('Lead not found.');
      local.leads[index] = { ...local.leads[index], ...updates, updatedAt: new Date().toISOString() };
      saveLocalData(local);
      return { success: true, lead: local.leads[index] };
    }
  },

  // Delete Lead
  async deleteLead(id) {
    try {
      return await ownerRequest(`/leads/${id}`, { method: 'DELETE' });
    } catch {
      const local = getLocalData();
      const lead = (local.leads || []).find(item => item.id === id);
      local.leads = (local.leads || []).filter(item => item.id !== id);
      saveLocalData(local);
      return { success: true, removed: lead };
    }
  },

  async exportLeads() {
    const token = getAuthToken();
    if (token) {
      try {
        const response = await fetch(`${API_BASE}/export/leads`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || 'Could not export leads.');
        }
        return response.blob();
      } catch {}
    }

    const local = getLocalData();
    const rows = (local.leads || []).map(lead => [
      lead.id || '',
      lead.name || '',
      lead.phone || '',
      lead.email || '',
      lead.age || '',
      lead.gender || '',
      lead.locality || '',
      lead.goal || '',
      lead.planInterest || '',
      lead.status || 'new',
      lead.createdAt || ''
    ]);
    const csv = [
      ['ID', 'Name', 'Phone', 'Email', 'Age', 'Gender', 'Locality', 'Goal', 'Plan Interest', 'Status', 'Created At'].join(','),
      ...rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    return new Blob([csv], { type: 'text/csv;charset=utf-8' });
  },

  // Get Members
  async getMembers() {
    try {
      return await ownerRequest('/members');
    } catch {
      return getLocalData().members || [];
    }
  },

  async getRegisteredAccounts() {
    try {
      return await ownerRequest('/owner/accounts');
    } catch {
      const local = getLocalData();
      return (local.members || []).map(member => ({
        id: member.id,
        name: member.name,
        email: member.email || '',
        createdAt: member.joinDate || new Date().toISOString(),
        profile: { phone: member.phone || '', goal: 'Performance coaching' },
        progress: [],
        currentStreak: member.streak || 0,
        longestStreak: member.streak || 0
      }));
    }
  },

  async getPayments() {
    try {
      return await ownerRequest('/payments');
    } catch {
      return [];
    }
  },

  async recordMembershipPayment(leadId, paymentMethod) {
    try {
      return await ownerRequest(`/leads/${encodeURIComponent(leadId)}/payment`, {
        method: 'PATCH',
        body: JSON.stringify({ paymentMethod })
      });
    } catch {
      const local = getLocalData();
      const lead = (local.leads || []).find(item => item.id === leadId);
      if (!lead) throw new Error('Membership fee request not found.');
      const member = {
        id: `SFZ-${String((local.members || []).length + 1).padStart(3, '0')}`,
        name: lead.name,
        phone: lead.phone,
        email: lead.email || '',
        plan: lead.planInterest || 'Gold Pro Athlete',
        status: 'active',
        joinDate: new Date().toISOString().slice(0, 10),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        checkinCount: 0,
        lastCheckin: null,
        streak: 0,
        trainerAssigned: 'Mohd. Shehzad'
      };
      lead.status = 'enrolled';
      lead.updatedAt = new Date().toISOString();
      local.members = [member, ...(local.members || [])];
      local.payments = [{ id: `payment-${Date.now()}`, memberId: member.id, name: lead.name, plan: lead.planInterest, amount: lead.membershipRequest?.amount || 2499, method: paymentMethod, paidAt: new Date().toISOString() }, ...(local.payments || [])];
      saveLocalData(local);
      return { success: true, lead, member, payment: local.payments[0] };
    }
  },

  getOwnerProgressPhoto: ownerPhotoRequest,

  // Add Member
  async createMember(memberData) {
    try {
      return await ownerRequest('/members', { method: 'POST', body: JSON.stringify(memberData) });
    } catch {
      const local = getLocalData();
      const member = {
        id: `SFZ-${String((local.members || []).length + 1).padStart(3, '0')}`,
        ...memberData,
        status: 'active',
        joinDate: new Date().toISOString().slice(0, 10),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        checkinCount: 1,
        lastCheckin: new Date().toISOString(),
        streak: 1,
        trainerAssigned: memberData.trainerAssigned || 'Mohd. Shehzad'
      };
      local.members = [member, ...(local.members || [])];
      saveLocalData(local);
      return { success: true, member };
    }
  },

  // Member Check-in
  async checkinMember(id) {
    try {
      return await ownerRequest(`/members/${id}/checkin`, { method: 'POST' });
    } catch {
      const local = getLocalData();
      const member = (local.members || []).find(item => item.id === id);
      if (!member) throw new Error('Member not found');
      member.checkinCount = (member.checkinCount || 0) + 1;
      member.lastCheckin = new Date().toISOString();
      member.streak = (member.streak || 0) + 1;
      local.recentCheckins = [{ id: `chk-${Date.now()}`, memberName: member.name, plan: member.plan, time: 'Just now', timestamp: new Date().toISOString() }, ...(local.recentCheckins || [])].slice(0, 8);
      saveLocalData(local);
      return { success: true, message: `Welcome ${member.name}! Check-in confirmed. Streak: ${member.streak} days 🔥`, member };
    }
  },

  // Get Classes
  async getClasses() {
    try {
      const res = await fetch(`${API_BASE}/classes`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) return await res.json();
    } catch {}
    return getLocalData().classes || [];
  },

  // Book Class Spot
  async bookClass(id, athleteInfo) {
    let response;
    try {
      response = await fetch(`${API_BASE}/classes/${id}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(athleteInfo),
        signal: AbortSignal.timeout(3000)
      });
    } catch {}
    if (response) {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not book this class.');
      return result;
    }
    const local = getLocalData();
    const gymClass = local.classes.find(c => c.id === id);
    if (!gymClass) return { error: 'Class not found' };
    if (gymClass.enrolled >= gymClass.capacity) return { error: 'Class is full' };

    gymClass.enrolled += 1;
    saveLocalData(local);
    return {
      success: true,
      message: `Spot confirmed in ${gymClass.title}!`,
      class: gymClass
    };
  }
};
