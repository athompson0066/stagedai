
import React, { useState } from 'react';
import Layout from './components/Layout';
import IntakeForm from './components/IntakeForm';
import ProcessingState from './components/ProcessingState';
import ResultsView from './components/ResultsView';
import SettingsManager from './components/SettingsManager';
import SalesTeamSection from './components/SalesTeamSection';
import DemoGallery from './components/DemoGallery';
import { StagingProject, PropertyType } from './types';
import { PRICING_TIERS } from './constants';
import { stageRoom } from './services/geminiService';
import { saveProject, markAsPaid, getSupabase } from './services/supabaseClient';

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
      // Wait for re-render before scrolling
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
        data.usagePlatform
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
    } catch (error) {
      console.error(error);
      alert("Staging failed. Ensure your Gemini API Key is valid.");
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
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-50 rounded-full blur-[120px] -z-10 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-indigo-50 rounded-full blur-[100px] -z-10 opacity-50"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="text-left animate-fadeInUp">
                  <div className="inline-flex items-center space-x-2 bg-blue-600/10 text-blue-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8 border border-blue-600/20">
                    <span className="relative flex h-2 w-2 mr-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                    </span>
                    <span>Multi-Agent AI Staging Now Live</span>
                  </div>
                  
                  <h1 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tighter leading-[0.9] mb-8">
                    See what your property <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">could become.</span>
                  </h1>
                  
                  <p className="text-xl md:text-2xl text-gray-500 max-w-xl mb-12 font-medium leading-relaxed">
                    Turn cold, empty rooms into scroll-stopping, sell-ready spaces. Instant, persona-driven staging for owners who want results, not just images.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                    <button 
                      onClick={startIntake}
                      className="bg-blue-600 text-white px-10 py-6 rounded-3xl font-black text-xl shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:bg-blue-700 transition transform hover:-translate-y-1 active:scale-95 uppercase tracking-tighter"
                    >
                      Stage Your Property Now
                    </button>
                    <button 
                      onClick={() => scrollToSection('live-demo')}
                      className="group flex items-center justify-center space-x-3 bg-white text-gray-900 border-2 border-gray-100 px-10 py-6 rounded-3xl font-black text-xl hover:border-blue-600 transition shadow-sm"
                    >
                      <span>View Live Demo</span>
                      <i className="fas fa-play-circle text-blue-600 group-hover:scale-125 transition"></i>
                    </button>
                  </div>

                  <div className="mt-12 flex items-center space-x-8 opacity-60 grayscale hover:grayscale-0 transition duration-500">
                    <div className="flex -space-x-3">
                      {[1,2,3,4].map(i => (
                        <img key={i} className="w-10 h-10 rounded-full border-2 border-white" src={`https://i.pravatar.cc/150?u=${i+10}`} alt="User" />
                      ))}
                    </div>
                    <p className="text-sm font-bold text-gray-900">Trusted by 1,200+ Property Owners</p>
                  </div>
                </div>

                <div className="relative animate-fadeInUp delay-200">
                  <div className="animate-float">
                    <div className="relative rounded-[40px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] border-[12px] border-white z-10">
                      <img src="https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&q=80&w=1200" alt="Staged Room" className="w-full" />
                      <div className="absolute top-6 left-6 glass-card px-4 py-2 rounded-2xl flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-800">Persona: Luxury Professional</span>
                      </div>
                      <div className="absolute inset-y-0 left-1/2 w-1 bg-white/50 backdrop-blur-sm shadow-xl z-20">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-2xl flex items-center justify-center text-blue-600">
                           <i className="fas fa-arrows-alt-h"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* AI Crew Section */}
          <section id="how-it-works" className="py-32 bg-gray-900 text-white overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-4 relative z-10">
              <div className="text-center mb-24">
                <span className="text-blue-500 font-black uppercase tracking-[0.3em] text-xs mb-4 block">Engineered for Results</span>
                <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter italic">The Multi-Agent AI Crew</h2>
                <p className="text-gray-400 text-xl max-w-2xl mx-auto">
                  Standard AI generates a generic image. Our "Crew" approach assigns specific agents to solve marketing problems for your listing.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    agent: "Room Analyst",
                    role: "Architectural Integrity",
                    desc: "Maps space layout, window placements, and floor textures to ensure staging looks embedded, not added.",
                    icon: "fa-vector-square",
                    color: "blue"
                  },
                  {
                    agent: "Persona Strategist",
                    role: "Market Psychology",
                    desc: "Curates specific decor trends that trigger emotional responses in your target buyer demographic.",
                    icon: "fa-brain",
                    color: "indigo"
                  },
                  {
                    agent: "Lighting Specialist",
                    role: "Photorealism Engine",
                    desc: "Recreates sun-angles and artificial light bounces to match the exact conditions of your original photo.",
                    icon: "fa-sun",
                    color: "amber"
                  },
                  {
                    agent: "Strategy QC",
                    role: "Conversion Audit",
                    desc: "Ensures the final output adheres to MLS and short-term rental quality standards for maximum ROI.",
                    icon: "fa-shield-check",
                    color: "green"
                  }
                ].map((agent, i) => (
                  <div key={i} className="bg-gray-800/50 border border-gray-700 p-8 rounded-[40px] hover:bg-gray-800 hover:border-blue-500 transition-all duration-500 group">
                    <div className={`bg-${agent.color}-600/20 text-${agent.color}-500 w-16 h-16 rounded-3xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition duration-500 shadow-xl`}>
                      <i className={`fas ${agent.icon}`}></i>
                    </div>
                    <h3 className="text-2xl font-black mb-1 tracking-tight">{agent.agent}</h3>
                    <div className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-4">{agent.role}</div>
                    <p className="text-gray-400 text-sm leading-relaxed">{agent.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* New Live Demo Gallery */}
          <DemoGallery />

          {/* Dedicated Landing Pricing Section */}
          <section id="landing-pricing" className="py-32 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-20">
                <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-xs mb-4 block">Fair & Transparent</span>
                <h2 className="text-5xl font-black text-gray-900 tracking-tighter">Choose Your Staging Pack</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {PRICING_TIERS.map((tier, i) => (
                  <div key={i} className={`p-10 rounded-[48px] border-2 transition-all duration-500 flex flex-col h-full ${
                    tier.recommended ? 'border-blue-600 bg-white shadow-2xl scale-105 z-10' : 'border-gray-200 bg-white/50'
                  }`}>
                    {tier.recommended && (
                      <span className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full w-max mb-8">Best Value</span>
                    )}
                    <h3 className="text-2xl font-black text-gray-900 mb-2">{tier.name}</h3>
                    <div className="flex items-baseline mb-6">
                      <span className="text-5xl font-black text-gray-900">{tier.price}</span>
                      <span className="text-gray-400 text-sm font-bold ml-2">/ project</span>
                    </div>
                    <p className="text-gray-500 mb-8 font-medium">{tier.description}</p>
                    <ul className="space-y-4 mb-10 flex-grow">
                      {tier.features.map((f, j) => (
                        <li key={j} className="flex items-center text-sm font-bold text-gray-700">
                          <i className="fas fa-check-circle text-blue-600 mr-3 opacity-60"></i>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button 
                      onClick={startIntake}
                      className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition shadow-lg ${
                        tier.recommended ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                    >
                      Get Started
                    </button>
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
          <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center text-green-600 text-4xl mx-auto mb-8 shadow-inner animate-pulse">
            <i className="fas fa-check"></i>
          </div>
          <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">Purchase Complete!</h2>
          <p className="text-xl text-gray-500 mb-12 font-medium">Your high-resolution, persona-staged assets are ready for your listing.</p>
          
          <div className="relative rounded-[40px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] mb-12 border-[16px] border-white">
            <img src={currentProject.stagedImage} alt="Final Result" className="w-full" />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href={currentProject.stagedImage} 
              download={`staged-${currentProject.id}.png`}
              className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-xl shadow-2xl hover:bg-blue-700 transition active:scale-95"
            >
              <i className="fas fa-download mr-2"></i> Download Marketing Kit
            </a>
            <button 
              onClick={() => setStep(AppStep.LANDING)}
              className="bg-gray-100 text-gray-800 px-10 py-5 rounded-2xl font-black text-xl hover:bg-gray-200 transition"
            >
              Stage Another Room
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
