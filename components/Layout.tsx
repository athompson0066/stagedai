
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  onHome: () => void;
  onOpenSettings: () => void;
  onNavigateToSection: (id: string) => void;
  onStartIntake: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onHome, onOpenSettings, onNavigateToSection, onStartIntake }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white/90 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center cursor-pointer group" onClick={onHome}>
              <div className="bg-blue-600 p-2.5 rounded-2xl mr-3 group-hover:rotate-12 transition-transform shadow-lg shadow-blue-200">
                <i className="fas fa-couch text-white text-xl"></i>
              </div>
              <span className="text-3xl font-black text-gray-900 tracking-tighter">Staged<span className="text-blue-600 italic">AI</span></span>
            </div>
            
            <nav className="hidden md:flex space-x-10 items-center">
              <button 
                onClick={() => onNavigateToSection('how-it-works')} 
                className="text-sm font-black uppercase tracking-widest text-gray-500 hover:text-blue-600 transition"
              >Our Engine</button>
              <button 
                onClick={() => onNavigateToSection('live-demo')} 
                className="text-sm font-black uppercase tracking-widest text-gray-500 hover:text-blue-600 transition"
              >Live Demo</button>
              <button 
                onClick={() => onNavigateToSection('landing-pricing')} 
                className="text-sm font-black uppercase tracking-widest text-gray-500 hover:text-blue-600 transition"
              >Pricing</button>
              
              <div className="h-6 w-px bg-gray-100"></div>
              
              <button 
                onClick={onOpenSettings}
                className="text-gray-400 hover:text-blue-600 transition-colors p-2"
                title="Admin Settings"
              >
                <i className="fas fa-cog text-xl"></i>
              </button>
              
              <button 
                onClick={onStartIntake} 
                className="bg-gray-900 text-white px-8 py-3.5 rounded-[20px] text-sm font-black uppercase tracking-widest hover:bg-blue-600 transition shadow-xl shadow-gray-200 active:scale-95"
              >
                Launch Studio
              </button>
            </nav>
            
            <button className="md:hidden text-gray-900">
               <i className="fas fa-bars text-2xl"></i>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-gray-900 text-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-gray-800 pb-20">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="bg-blue-600 p-2 rounded-xl mr-3">
                  <i className="fas fa-couch text-white text-lg"></i>
                </div>
                <span className="text-2xl font-black tracking-tighter uppercase">StagedAI</span>
              </div>
              <p className="text-gray-400 max-w-sm text-lg leading-relaxed">
                Empowering property owners to sell faster and smarter through intelligent multi-agent virtual staging and buyer-focused visualization.
              </p>
              <div className="flex space-x-6 mt-8">
                <a href="#" className="text-gray-500 hover:text-white transition"><i className="fab fa-instagram text-xl"></i></a>
                <a href="#" className="text-gray-500 hover:text-white transition"><i className="fab fa-twitter text-xl"></i></a>
                <a href="#" className="text-gray-500 hover:text-white transition"><i className="fab fa-linkedin text-xl"></i></a>
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
