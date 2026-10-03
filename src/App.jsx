import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Programs from './components/Programs';
import FitnessLab from './components/FitnessLab';
import MembershipPlans from './components/MembershipPlans';
import Trainers from './components/Trainers';
import Transformations from './components/Transformations';
import Amenities from './components/Amenities';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import JoinModal from './components/JoinModal';
import CheckoutModal from './components/CheckoutModal';
import AdminDashboard from './components/admin/AdminDashboard';
import AuthModal from './components/AuthModal';
import MemberDashboard from './components/MemberDashboard';
import { api } from './services/api';

export default function App() {
  const [isAdminView, setIsAdminView] = useState(false);
  const [isMemberView, setIsMemberView] = useState(false);
  const [user, setUser] = useState(null);
  const [authRole, setAuthRole] = useState('member');
  const [authInitialMode, setAuthInitialMode] = useState('login');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [backendMode, setBackendMode] = useState('checking');

  // Modals state
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinModalData, setJoinModalData] = useState({});

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedPlanData, setSelectedPlanData] = useState(null);

  useEffect(() => {
    let active = true;
    const openFirstVisitPrompt = () => {
      if (sessionStorage.getItem('sfz_auth_prompt_dismissed') === 'true') return;
      setAuthRole('member');
      setAuthInitialMode('choice');
      setIsAuthModalOpen(true);
    };

    api.getHealth()
      .then((health) => {
        if (!active) return;
        setBackendMode(health?.status === 'ok' ? 'live' : 'preview');
      })
      .catch(() => {
        if (!active) return;
        setBackendMode('preview');
      });

    api.auth.currentUser()
      .then((currentUser) => {
        if (!active) return;
        setUser(currentUser);
        if (!currentUser) openFirstVisitPrompt();
      })
      .catch(() => {
        if (!active) return;
        api.auth.logout();
        setUser(null);
        openFirstVisitPrompt();
      });
    return () => { active = false; };
  }, []);

  // Handlers
  const handleOpenJoinModal = (data = {}) => {
    setJoinModalData(data);
    setIsJoinModalOpen(true);
  };

  const handleSelectProgram = (program) => {
    handleOpenJoinModal({
      defaultGoal: `Program Enrollment: ${program.title}`
    });
  };

  const handleBookTrainer = (trainer) => {
    handleOpenJoinModal({
      defaultGoal: `1-on-1 Personal Training with ${trainer.name}`
    });
  };

  const handleConsultWithStats = ({ bmi, category }) => {
    handleOpenJoinModal({
      defaultGoal: `Free Consultation for BMI ${bmi} (${category})`
    });
  };

  const handleSelectPlan = (planData) => {
    setSelectedPlanData(planData);
    setIsCheckoutModalOpen(true);
  };

  const handleOpenAuth = (role = 'member', initialMode = 'choice') => {
    setAuthRole(role);
    setAuthInitialMode(initialMode);
    setIsAuthModalOpen(true);
  };

  const handleCloseAuth = () => {
    sessionStorage.setItem('sfz_auth_prompt_dismissed', 'true');
    setIsAuthModalOpen(false);
  };

  const handleAuthenticated = (authenticatedUser, isNewMember = false) => {
    setUser(authenticatedUser);
    setIsAuthModalOpen(false);
    if (authenticatedUser.role === 'owner') setIsAdminView(true);
    else if (isNewMember) setIsMemberView(true);
  };

  const handleOpenMemberDashboard = () => {
    if (user?.role === 'member') setIsMemberView(true);
    else handleOpenAuth('member', 'login');
  };

  const handleToggleAdmin = () => {
    if (isAdminView) {
      setIsAdminView(false);
    } else if (user?.role === 'owner') {
      setIsAdminView(true);
    } else {
      handleOpenAuth('owner', 'login');
    }
  };

  const handleLogout = () => {
    api.auth.logout();
    setUser(null);
    setIsAdminView(false);
  };

  // If in Admin Mode, render the full Gym Owner CRM Dashboard
  if (isAdminView) {
    return <AdminDashboard onExitAdmin={() => setIsAdminView(false)} />;
  }

  if (isMemberView && user?.role === 'member') {
    return <MemberDashboard user={user} onExit={() => setIsMemberView(false)} onLogout={handleLogout} onUserUpdated={setUser} />;
  }

  // Public Member Experience
  return (
    <div className="min-h-screen bg-[#0a0b0e] text-slate-100 font-sans selection:bg-amber-500 selection:text-black">
      {backendMode !== 'checking' && (
        <div className="fixed left-1/2 top-5 z-[60] -translate-x-1/2 rounded-full border border-white/10 bg-black/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-200 backdrop-blur-md">
          {backendMode === 'live' ? 'System Live' : 'Preview Mode • Local Demo Data'}
        </div>
      )}

      {/* Navbar */}
      <Navbar
        onOpenJoinModal={handleOpenJoinModal}
        onToggleAdmin={handleToggleAdmin}
        onOpenAuth={() => handleOpenAuth()}
        onOpenMemberDashboard={handleOpenMemberDashboard}
        onLogout={handleLogout}
        user={user}
        isAdminView={isAdminView}
      />

      {/* Hero Section */}
      <main>
        <Hero onOpenJoinModal={handleOpenJoinModal} />

        {/* Training Programs */}
        <Programs onSelectProgram={handleSelectProgram} />

        {/* Multi-Tool Fitness Lab (BMI, Macros, 1RM) */}
        <FitnessLab onConsultWithStats={handleConsultWithStats} />

        {/* Transparent Membership Plans */}
        <MembershipPlans onSelectPlan={handleSelectPlan} />

        {/* Certified Coaches */}
        <Trainers onBookTrainer={handleBookTrainer} />

        {/* Verified Results & Transformations */}
        <Transformations onOpenJoinModal={handleOpenJoinModal} />

        {/* World-Class Amenities & FAQ */}
        <Amenities />

        {/* Contact & Arena Location */}
        <ContactSection onLeadSubmitted={(lead) => console.log('New lead:', lead)} />
      </main>

      {/* Footer */}
      <Footer onToggleAdmin={handleToggleAdmin} />

      {/* Interactive Modals */}
      <JoinModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        initialData={joinModalData}
      />

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => {
          setIsCheckoutModalOpen(false);
          setSelectedPlanData(null);
        }}
        planData={selectedPlanData}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        initialRole={authRole}
        initialMode={authInitialMode}
        onClose={handleCloseAuth}
        onAuthenticated={handleAuthenticated}
      />

    </div>
  );
}
