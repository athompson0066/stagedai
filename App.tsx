import React, { useState } from 'react';
import Layout from './components/Layout.tsx';
import IntakeForm from './components/IntakeForm.tsx';
import ProcessingState from './components/ProcessingState.tsx';
import ResultsView from './components/ResultsView.tsx';
import SettingsManager from './components/SettingsManager.tsx';
import SalesTeamSection from './components/SalesTeamSection.tsx';
import ContactSection from './components/ContactSection.tsx';
import DemoGallery from './components/DemoGallery.tsx';
import AuthView from './components/AuthView.tsx';
import Spline from '@splinetool/react-spline';
import { StagingProject, PropertyType, UserProfile } from './types.ts';
import { PRICING_TIERS } from './constants.ts';
import { stageRoom } from './services/geminiService.ts';
import { saveProject, markAsPaid, getSupabase, getUserProfile } from './services/supabaseClient.ts';

enum AppStep {
  LANDING,
  AUTH,
  INTAKE,
  PROCESSING,
  RESULTS,
  SUCCESS
}

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.LANDING);
  const [currentProject, setCurrentProject] = useState<StagingProject | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Auth state
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  React.useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    const fetchProfile = async (userId: string, email: string) => {
      const data = await getUserProfile(userId);
      setUserProfile({
        id: userId,
        email: email,
        avatarUrl: data?.avatar_url as string | undefined,
        credits: data?.credits || 0,
      });
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setUserProfile(null);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const startIntake = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (session) {
      setStep(AppStep.INTAKE);
    } else {
      setStep(AppStep.AUTH);
    }
  };

  const scrollToSection = (id: string) => {
    if (step !== AppStep.LANDING) {
      setStep(AppStep.LANDING);
      setTimeout(() => {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleIntakeComplete = async (data: Partial<StagingProject>) => {
    setStep(AppStep.PROCESSING);
    try {
      if (!data.originalImage) throw new Error("Image required");

      const stagedUrl = await stageRoom(
        data.originalImage,
        data.goal!,
        data.propertyType!,
        data.persona!,
        data.style!,
        data.notes,
        data.marketPositioning,
        data.emotionalTone,
        data.usagePlatform,
        data.isDeepCleanRequired
      );

      const project: StagingProject = {
        id: Math.random().toString(36).substr(2, 9),
        originalImage: data.originalImage,
        stagedImage: stagedUrl,
        goal: data.goal!,
        propertyType: data.propertyType || PropertyType.HOUSE,
        persona: data.persona!,
        style: data.style!,
        marketPositioning: data.marketPositioning,
        usagePlatform: data.usagePlatform,
        emotionalTone: data.emotionalTone,
        isDeepCleanRequired: data.isDeepCleanRequired,
        notes: data.notes,
        status: 'completed'
      };

      const supabase = getSupabase();
      if (supabase) {
        try {
          await saveProject(project);
        } catch (dbError) {
          console.warn("Could not save to Supabase.", dbError);
        }
      }

      setCurrentProject(project);
      setStep(AppStep.RESULTS);
    } catch (error: any) {
      console.error("UI Intake Error:", error);
      alert(`Staging Failed: ${error.message || "An unexpected error occurred."}\n\nCheck the console for full technical details.`);
      setStep(AppStep.INTAKE);
    }
  };

  const handlePaymentSuccess = async (details: any) => {
    if (currentProject) {
      try {
        await markAsPaid(currentProject.id);
      } catch (dbError) {
        console.error("Failed to update payment status in DB:", dbError);
      }
    }
    setStep(AppStep.SUCCESS);
  };

  return (
    <Layout
      onHome={() => setStep(AppStep.LANDING)}
      onOpenSettings={() => setIsSettingsOpen(true)}
      onNavigateToSection={scrollToSection}
      onStartIntake={startIntake}
      userProfile={userProfile}
      onSignOut={async () => {
        const supabase = getSupabase();
        if (supabase) await supabase.auth.signOut();
      }}
    >
      <SettingsManager isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {step === AppStep.LANDING && (
        <div className="bg-[#0a0a0a] text-white selection:bg-blue-500/30">
          {/* Hero Section */}
          <section className="relative overflow-hidden pt-20 pb-32 md:pt-32 md:pb-48">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]"></div>
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]"></div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="text-left animate-fadeInUp">
                  <div className="inline-flex items-center space-x-2 bg-blue-600/10 text-blue-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8 border border-blue-600/20">
                    <span>Multi-Agent AI Staging Now Live</span>
                  </div>

                  <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-8">
                    See what your property <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">could become.</span>
                  </h1>

                  <p className="text-xl md:text-2xl text-gray-400 max-w-xl mb-12 font-medium leading-relaxed">
                    Turn cold, empty rooms into scroll-stopping, sell-ready spaces. Instant, persona-driven staging for owners who want results.
                  </p>

                  <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                    <button onClick={startIntake} className="bg-blue-600/90 hover:bg-blue-500 text-white px-10 py-6 rounded-3xl font-black text-xl shadow-[0_0_40px_rgba(37,99,235,0.3)] transition-all transform hover:-translate-y-1 active:scale-95 uppercase tracking-tighter backdrop-blur-sm border border-blue-500/50">
                      Stage Your Property Now
                    </button>
                    <button onClick={() => scrollToSection('live-demo')} className="group flex items-center justify-center space-x-3 bg-white/5 text-white border border-white/10 px-10 py-6 rounded-3xl font-black text-xl hover:bg-white/10 transition-all backdrop-blur-md">
                      <span>View Live Demo</span>
                      <i className="fas fa-play-circle text-blue-400 group-hover:scale-125 transition"></i>
                    </button>
                  </div>
                </div>

                <div className="relative h-[600px] w-full animate-fadeInUp delay-200 lg:block hidden">
                  <div className="absolute inset-0 rounded-[40px] overflow-hidden border border-white/10 shadow-2xl glass-card z-10 bg-white/5 backdrop-blur-3xl p-4">
                    <div className="w-full h-full rounded-[24px] overflow-hidden bg-black/20 relative group">
                      <img
                        src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1200"
                        alt="Luxury Staged Interior"
                        className="w-full h-full object-cover rounded-[24px] group-hover:scale-105 transition-transform duration-1000"
                      />
                      {/* Soft gradient overlay to blend perfectly with the dark theme */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,10,0.8)] via-transparent to-[rgba(10,10,10,0.2)]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="how-it-works" className="py-32 bg-[#050505] text-white overflow-hidden relative border-t border-white/5">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 rounded-lg mix-blend-overlay"></div>
            <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
              <h2 className="text-4xl md:text-6xl font-black mb-16 tracking-tighter">The Multi-Agent AI Crew</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { agent: "Deep Clean Specialist", icon: "fa-sparkles", desc: "Virtually removes clutter, trash, and stains." },
                  { agent: "Room Analyst", icon: "fa-vector-square", desc: "Maps space layout and floor textures." },
                  { agent: "Persona Strategist", icon: "fa-brain", desc: "Curates specific decor trends for buyers." },
                  { agent: "Lighting Specialist", icon: "fa-sun", desc: "Matches exact sun-angles and light bounces." }
                ].map((agent, i) => (
                  <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[40px] hover:bg-white/10 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(37,99,235,0.15)] transition-all duration-500 group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="bg-blue-500/20 text-blue-400 w-16 h-16 rounded-3xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                      <i className={`fas ${agent.icon}`}></i>
                    </div>
                    <h3 className="text-2xl font-black mb-2 tracking-tight text-gray-100">{agent.agent}</h3>
                    <p className="text-gray-400 text-sm font-medium leading-relaxed">{agent.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <DemoGallery />

          <section id="landing-pricing" className="py-32 bg-[#0a0a0a] relative border-t border-white/5">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[150px]"></div>
            </div>
            <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
              <h2 className="text-5xl font-black text-white tracking-tighter mb-20">Choose Your Staging Pack</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {PRICING_TIERS.map((tier, i) => (
                  <div key={i} className={`p-10 rounded-[48px] border transition-all duration-500 bg-white/5 backdrop-blur-xl relative overflow-hidden group ${tier.recommended ? 'border-blue-500/50 shadow-[0_20px_60px_-15px_rgba(37,99,235,0.3)] scale-105 z-10' : 'border-white/10 hover:border-white/20'}`}>
                    {tier.recommended && (
                      <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-600 to-indigo-600 text-white text-xs font-bold uppercase tracking-widest py-2 px-6 rounded-bl-3xl">Most Popular</div>
                    )}
                    <h3 className="text-2xl font-black text-white mb-2">{tier.name}</h3>
                    <div className="text-5xl font-black text-white mb-2 tracking-tighter">{tier.price}</div>
                    <div className="flex items-center justify-center space-x-2 bg-blue-500/10 text-blue-400 font-bold py-1.5 px-4 rounded-full w-fit mx-auto mb-6 border border-blue-500/20">
                      <i className="fas fa-coins text-yellow-400"></i>
                      <span>{tier.credits} Image Credits</span>
                    </div>
                    <ul className="space-y-4 mb-10 text-left">
                      {tier.features.map((f, j) => (
                        <li key={j} className="flex items-center text-sm font-medium text-gray-300">
                          <i className="fas fa-check-circle text-blue-400 mr-3"></i>{f}
                        </li>
                      ))}
                    </ul>
                    <button onClick={startIntake} className={`w-full py-5 rounded-2xl font-black text-sm uppercase transition-all flex items-center justify-center space-x-2 ${tier.recommended ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm'}`}>
                      <span>Get Started</span>
                      <i className="fas fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <SalesTeamSection />
          <ContactSection />
        </div>
      )}

      {step === AppStep.AUTH && (
        <AuthView
          onAuthSuccess={() => setStep(AppStep.INTAKE)}
          onCancel={() => setStep(AppStep.LANDING)}
        />
      )}

      {step === AppStep.INTAKE && (
        <IntakeForm onComplete={handleIntakeComplete} onCancel={() => setStep(AppStep.LANDING)} />
      )}

      {step === AppStep.PROCESSING && <ProcessingState />}

      {step === AppStep.RESULTS && currentProject && (
        <ResultsView
          project={currentProject}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {step === AppStep.SUCCESS && currentProject && (
        <div className="max-w-3xl mx-auto px-4 py-24 text-center animate-fadeInUp">
          <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center text-green-600 text-4xl mx-auto mb-8 shadow-inner">
            <i className="fas fa-check"></i>
          </div>
          <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">Purchase Complete!</h2>
          <div className="relative rounded-[40px] overflow-hidden shadow-2xl mb-12 border-[16px] border-white">
            <img src={currentProject.stagedImage} alt="Final Result" className="w-full" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={currentProject.stagedImage} download={`staged-${currentProject.id}.png`} className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-xl shadow-2xl">
              <i className="fas fa-download mr-2"></i> Download Marketing Kit
            </a>
            <button onClick={() => setStep(AppStep.LANDING)} className="bg-gray-100 text-gray-800 px-10 py-5 rounded-2xl font-black text-xl">
              Stage Another Room
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;