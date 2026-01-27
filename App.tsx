import React, { useState } from 'react';
import Layout from './components/Layout.tsx';
import IntakeForm from './components/IntakeForm.tsx';
import ProcessingState from './components/ProcessingState.tsx';
import ResultsView from './components/ResultsView.tsx';
import SettingsManager from './components/SettingsManager.tsx';
import SalesTeamSection from './components/SalesTeamSection.tsx';
import DemoGallery from './components/DemoGallery.tsx';
import { StagingProject, PropertyType } from './types.ts';
import { PRICING_TIERS } from './constants.ts';
import { stageRoom } from './services/geminiService.ts';
import { saveProject, markAsPaid, getSupabase } from './services/supabaseClient.ts';

enum AppStep {
  LANDING,
  INTAKE,
  PROCESSING,
  RESULTS,
  SUCCESS
}

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.LANDING);
  const [currentProject, setCurrentProject] = useState<StagingProject | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const startIntake = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(AppStep.INTAKE);
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
    >
      <SettingsManager isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      
      {step === AppStep.LANDING && (
        <div className="bg-white">
          {/* Hero Section */}
          <section className="hero-gradient relative overflow-hidden pt-20 pb-32 md:pt-32 md:pb-48">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="text-left animate-fadeInUp">
                  <div className="inline-flex items-center space-x-2 bg-blue-600/10 text-blue-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8 border border-blue-600/20">
                    <span>Multi-Agent AI Staging Now Live</span>
                  </div>
                  
                  <h1 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tighter leading-[0.9] mb-8">
                    See what your property <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">could become.</span>
                  </h1>
                  
                  <p className="text-xl md:text-2xl text-gray-500 max-w-xl mb-12 font-medium leading-relaxed">
                    Turn cold, empty rooms into scroll-stopping, sell-ready spaces. Instant, persona-driven staging for owners who want results.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                    <button onClick={startIntake} className="bg-blue-600 text-white px-10 py-6 rounded-3xl font-black text-xl shadow-xl hover:bg-blue-700 transition transform hover:-translate-y-1 active:scale-95 uppercase tracking-tighter">
                      Stage Your Property Now
                    </button>
                    <button onClick={() => scrollToSection('live-demo')} className="group flex items-center justify-center space-x-3 bg-white text-gray-900 border-2 border-gray-100 px-10 py-6 rounded-3xl font-black text-xl hover:border-blue-600 transition shadow-sm">
                      <span>View Live Demo</span>
                      <i className="fas fa-play-circle text-blue-600 group-hover:scale-125 transition"></i>
                    </button>
                  </div>
                </div>

                <div className="relative animate-fadeInUp delay-200">
                  <div className="animate-float">
                    <div className="relative rounded-[40px] overflow-hidden shadow-2xl border-[12px] border-white z-10">
                      <img src="https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&q=80&w=1200" alt="Staged Room" className="w-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="how-it-works" className="py-32 bg-gray-900 text-white overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
              <h2 className="text-4xl md:text-6xl font-black mb-16 tracking-tighter italic">The Multi-Agent AI Crew</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { agent: "Deep Clean Specialist", icon: "fa-sparkles", desc: "Virtually removes clutter, trash, and stains." },
                  { agent: "Room Analyst", icon: "fa-vector-square", desc: "Maps space layout and floor textures." },
                  { agent: "Persona Strategist", icon: "fa-brain", desc: "Curates specific decor trends for buyers." },
                  { agent: "Lighting Specialist", icon: "fa-sun", desc: "Matches exact sun-angles and light bounces." }
                ].map((agent, i) => (
                  <div key={i} className="bg-gray-800/50 border border-gray-700 p-8 rounded-[40px] hover:border-blue-500 transition-all duration-500 group">
                    <div className="bg-blue-600/20 text-blue-500 w-16 h-16 rounded-3xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition duration-500">
                      <i className={`fas ${agent.icon}`}></i>
                    </div>
                    <h3 className="text-2xl font-black mb-2">{agent.agent}</h3>
                    <p className="text-gray-400 text-sm">{agent.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <DemoGallery />

          <section id="landing-pricing" className="py-32 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <h2 className="text-5xl font-black text-gray-900 tracking-tighter mb-20">Choose Your Staging Pack</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {PRICING_TIERS.map((tier, i) => (
                  <div key={i} className={`p-10 rounded-[48px] border-2 transition-all duration-500 bg-white ${tier.recommended ? 'border-blue-600 shadow-2xl scale-105 z-10' : 'border-gray-200'}`}>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">{tier.name}</h3>
                    <div className="text-5xl font-black text-gray-900 mb-6">{tier.price}</div>
                    <ul className="space-y-4 mb-10 text-left">
                      {tier.features.map((f, j) => (
                        <li key={j} className="flex items-center text-sm font-bold text-gray-700">
                          <i className="fas fa-check-circle text-blue-600 mr-3"></i>{f}
                        </li>
                      ))}
                    </ul>
                    <button onClick={startIntake} className="w-full py-5 rounded-2xl font-black text-xs uppercase bg-gray-900 text-white hover:bg-blue-600 transition">Get Started</button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <SalesTeamSection />
        </div>
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