
import React, { useState } from 'react';

const DEMO_ITEMS = [
  {
    title: "Kitchen Refresh",
    before: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800",
    after: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&q=80&w=800",
    style: "Clean Chef's Kitchen",
    persona: "Culinary Enthusiast",
    description: "Deep Clean Crew: Removed cluttered photos, plants, and fridge-top items. Replaced counter clutter with a modern microwave."
  },
  {
    title: "Luxury Penthouse",
    before: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&q=80&w=800",
    after: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800",
    style: "Ultra-Luxury Modern",
    persona: "High-Net-Worth Executive",
    description: "Multi-Agent Staging: Virtualized high-end Italian furniture and optimized sunset lighting."
  },
  {
    title: "Industrial Loft",
    before: "https://images.unsplash.com/photo-1515542706656-8e6ef17a1521?auto=format&fit=crop&q=80&w=800",
    after: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800",
    style: "Warm Industrial",
    persona: "Creative Professional",
    description: "Persona Staging: Added custom shelving and warm accent lighting for a live-work vibe."
  },
  {
    title: "Family Suburban Home",
    before: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&q=80&w=800",
    after: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=800",
    style: "Cozy Transitional",
    persona: "Modern Family",
    description: "Conversion Staging: Transformed a cold living room into a cozy, family-focused gathering spot."
  }
];

const DemoGallery: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section id="live-demo" className="py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-xs mb-4 block">Interactive Showroom</span>
            <h2 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-none">
              Witness the <br /><span className="text-blue-600 italic">Transformation.</span>
            </h2>
          </div>
          <p className="text-gray-500 text-lg font-medium max-w-sm lg:text-right">
            Drag the slider to see how our Multi-Agent AI reimagines empty or cluttered spaces for specific buyer personas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Controls */}
          <div className="lg:col-span-4 space-y-4">
            {DEMO_ITEMS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className={`w-full text-left p-6 rounded-[32px] border-2 transition-all duration-500 flex items-center justify-between group ${
                  activeIdx === idx 
                    ? 'border-blue-600 bg-blue-50 shadow-xl shadow-blue-100' 
                    : 'border-gray-50 bg-white hover:border-gray-200'
                }`}
              >
                <div className="pr-4">
                  <h3 className={`font-black text-lg ${activeIdx === idx ? 'text-blue-600' : 'text-gray-900'}`}>{item.title}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{item.persona}</p>
                </div>
                <div className={`w-10 h-10 min-w-[40px] rounded-full flex items-center justify-center transition-all ${activeIdx === idx ? 'bg-blue-600 text-white rotate-90' : 'bg-gray-100 text-gray-400'}`}>
                  <i className="fas fa-chevron-right text-xs"></i>
                </div>
              </button>
            ))}
          </div>

          {/* Interactive Slider */}
          <div className="lg:col-span-8">
            <div 
              className="relative aspect-[16/10] rounded-[48px] overflow-hidden shadow-2xl border-[12px] border-white ring-1 ring-gray-100 group"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <img src={DEMO_ITEMS[activeIdx].after} alt="After" className="w-full h-full object-cover" />
              
              <div 
                className="absolute inset-0 overflow-hidden transition-all duration-300 ease-out" 
                style={{ width: isHovered ? '0%' : '50%', borderRight: isHovered ? '0px' : '4px solid white' }}
              >
                <img src={DEMO_ITEMS[activeIdx].before} alt="Before" className="w-[1000px] max-w-none h-full object-cover" />
              </div>

              {/* Labels */}
              <div className="absolute top-8 left-8 bg-gray-900/80 text-white px-6 py-2 rounded-2xl backdrop-blur-md text-xs font-black uppercase tracking-[0.2em] shadow-lg">
                Before
              </div>
              <div className="absolute top-8 right-8 bg-blue-600/90 text-white px-6 py-2 rounded-2xl backdrop-blur-md text-xs font-black uppercase tracking-[0.2em] shadow-lg">
                After: {DEMO_ITEMS[activeIdx].style}
              </div>

              {/* Slider UI */}
              {!isHovered && (
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
                  <div className="w-14 h-14 bg-white rounded-full shadow-2xl flex items-center justify-center text-blue-600 border-[6px] border-blue-50 z-20 animate-pulse">
                    <i className="fas fa-arrows-alt-h text-2xl"></i>
                  </div>
                </div>
              )}
              
              <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors pointer-events-none"></div>
              
              {/* Floating Meta */}
              <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center pointer-events-none">
                <div className="glass-card px-6 py-4 rounded-[24px] shadow-xl border-white/50 backdrop-blur-xl max-w-xs">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-1">Crew Summary</span>
                  <p className="text-xs font-bold text-gray-900 leading-tight">{DEMO_ITEMS[activeIdx].description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoGallery;
