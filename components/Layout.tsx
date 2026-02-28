
import React from 'react';
import { UserProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  onHome: () => void;
  onOpenSettings: () => void;
  onNavigateToSection: (id: string) => void;
  onStartIntake: () => void;
  userProfile?: UserProfile | null;
  onSignOut?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onHome, onOpenSettings, onNavigateToSection, onStartIntake, userProfile, onSignOut }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#050505]">
      <header className="bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center cursor-pointer group" onClick={onHome}>
              <div className="bg-blue-600 p-2.5 rounded-2xl mr-3 group-hover:rotate-12 transition-transform shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                <i className="fas fa-couch text-white text-xl"></i>
              </div>
              <span className="text-3xl font-black text-white tracking-tighter drop-shadow-md">Staged<span className="text-blue-500 italic">AI</span></span>
            </div>

            <nav className="hidden md:flex space-x-10 items-center">
              <button
                onClick={() => onNavigateToSection('how-it-works')}
                className="text-sm font-black uppercase tracking-widest text-gray-400 hover:text-white transition drop-shadow"
              >Our Engine</button>
              <button
                onClick={() => onNavigateToSection('live-demo')}
                className="text-sm font-black uppercase tracking-widest text-gray-400 hover:text-white transition drop-shadow"
              >Live Demo</button>
              <button
                onClick={() => onNavigateToSection('landing-pricing')}
                className="text-sm font-black uppercase tracking-widest text-gray-400 hover:text-white transition drop-shadow"
              >Pricing</button>

              <div className="h-6 w-px bg-white/10"></div>

              <button
                onClick={onOpenSettings}
                className="text-gray-500 hover:text-white transition-colors p-2"
                title="Admin Settings"
              >
                <i className="fas fa-cog text-xl"></i>
              </button>

              {userProfile ? (
                <div className="flex items-center space-x-6">
                  <button
                    onClick={onStartIntake}
                    className="bg-blue-600/90 text-white px-6 py-2.5 rounded-[20px] text-xs font-black uppercase tracking-widest hover:bg-blue-500 transition shadow-[0_0_15px_rgba(37,99,235,0.4)] active:scale-95 backdrop-blur-sm border border-blue-500/50"
                  >
                    Stage Your Property
                  </button>

                  <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full cursor-help transition-colors hover:border-white/20" title="Available Credits">
                    <i className="fas fa-coins text-yellow-400"></i>
                    <span className="text-white font-bold text-sm tracking-wide">{userProfile.credits}</span>
                  </div>

                  <div className="flex items-center space-x-3 bg-white/5 border border-white/10 p-1.5 pr-4 rounded-full">
                    {userProfile.avatarUrl ? (
                      <img src={userProfile.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-white/20" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm border border-white/20">
                        {userProfile.email.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <button onClick={onSignOut} className="text-gray-400 hover:text-white transition text-sm font-semibold" title="Sign Out">
                      <i className="fas fa-sign-out-alt"></i>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={onStartIntake}
                  className="bg-blue-600/90 text-white px-8 py-3.5 rounded-[20px] text-sm font-black uppercase tracking-widest hover:bg-blue-500 transition shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-95 backdrop-blur-sm border border-blue-500/50"
                >
                  Log In
                </button>
              )}
            </nav>

            <button className="md:hidden text-white hover:text-blue-400 transition">
              <i className="fas fa-bars text-2xl"></i>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-[#050505] text-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-white/10 pb-20">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="bg-blue-600 p-2 rounded-xl mr-3 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                  <i className="fas fa-couch text-white text-lg"></i>
                </div>
                <span className="text-2xl font-black tracking-tighter uppercase">StagedAI</span>
              </div>
              <p className="text-gray-400 max-w-sm text-lg leading-relaxed font-medium">
                Empowering property owners to sell faster and smarter through intelligent multi-agent virtual staging and buyer-focused visualization.
              </p>
              <div className="flex space-x-6 mt-8">
                <a href="#" className="text-gray-500 hover:text-white transition transform hover:scale-110"><i className="fab fa-instagram text-xl"></i></a>
                <a href="#" className="text-gray-500 hover:text-white transition transform hover:scale-110"><i className="fab fa-twitter text-xl"></i></a>
                <a href="#" className="text-gray-500 hover:text-white transition transform hover:scale-110"><i className="fab fa-linkedin text-xl"></i></a>
              </div>
            </div>
            <div>
              <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-8 text-gray-500">Product</h4>
              <ul className="space-y-4 text-gray-400 font-bold">
                <li><button onClick={() => onNavigateToSection('how-it-works')} className="hover:text-blue-400 transition">Agent Workflow</button></li>
                <li><button onClick={() => onNavigateToSection('live-demo')} className="hover:text-blue-400 transition">Live Demo</button></li>
                <li><button onClick={() => onNavigateToSection('landing-pricing')} className="hover:text-blue-400 transition">Market Pricing</button></li>
                <li><a href="#" className="hover:text-blue-400 transition">API Access</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-8 text-gray-500">Legal</h4>
              <ul className="space-y-4 text-gray-400 font-bold">
                <li><button onClick={onOpenSettings} className="hover:text-blue-400 transition">Admin Console</button></li>
                <li><a href="#" className="hover:text-blue-400 transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 text-center text-gray-600 text-xs font-black uppercase tracking-widest">
            © {new Date().getFullYear()} StagedAI. Built for High-Performance Real Estate Marketing.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
