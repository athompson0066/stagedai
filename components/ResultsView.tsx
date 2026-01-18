
import React, { useState, useEffect, useRef } from 'react';
import { StagingProject } from '../types';
import { PRICING_TIERS } from '../constants';
import { getSupabase } from '../services/supabaseClient';

interface ResultsViewProps {
  project: StagingProject;
  onPaymentSuccess: (details: any) => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ project, onPaymentSuccess }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const [viewMode, setViewMode] = useState<'slider' | 'sideBySide'>('slider');
  const [selectedTier, setSelectedTier] = useState(PRICING_TIERS[1]);
  const [sdkStatus, setSdkStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [isProcessing, setIsProcessing] = useState(false);
  const paypalRef = useRef<HTMLDivElement>(null);
  const paypalButtonInstance = useRef<any>(null);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPos(Number(e.target.value));
  };

  // Dynamically load PayPal SDK with robust error handling
  useEffect(() => {
    const loadPaypal = () => {
      // If already loaded, just set ready
      if ((window as any).paypal) {
        setSdkStatus('ready');
        return;
      }

      const clientId = localStorage.getItem('STAGEDAI_PAYPAL_CLIENT_ID') || 'sb';
      
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture&components=buttons`;
      script.async = true;
      script.crossOrigin = "anonymous"; 
      
      script.onload = () => {
        // Wait a tiny bit to ensure PayPal's internal bootstrapper doesn't crash
        setTimeout(() => {
          if ((window as any).paypal) {
            setSdkStatus('ready');
          } else {
            setSdkStatus('error');
          }
        }, 500);
      };

      script.onerror = () => {
        console.error("PayPal script failed to load completely.");
        setSdkStatus('error');
      };

      document.body.appendChild(script);
    };

    loadPaypal();

    // Global listener for PayPal's unhandled bootstrap errors (like "Can not read window host")
    const handlePaypalError = (event: ErrorEvent) => {
      if (event.message?.includes('paypal') || event.message?.includes('window host')) {
        console.warn("PayPal Bootstrap error caught. Switching to Fallback Mode.");
        setSdkStatus('error');
      }
    };

    window.addEventListener('error', handlePaypalError);
    return () => window.removeEventListener('error', handlePaypalError);
  }, []);

  useEffect(() => {
    const supabase = getSupabase();
    if (sdkStatus === 'ready' && paypalRef.current && (window as any).paypal) {
      if (paypalButtonInstance.current) {
        try {
          paypalButtonInstance.current.close();
        } catch (e) {
          console.warn("Cleanup error", e);
        }
      }

      paypalRef.current.innerHTML = "";
      
      try {
        const buttons = (window as any).paypal.Buttons({
          style: {
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'checkout'
          },
          createOrder: async () => {
            if (!supabase) {
              console.warn("Supabase not configured. Using fallback order ID for demo.");
              return "DEMO_ORDER_" + Date.now();
            }
            
            setIsProcessing(true);
            try {
              const { data, error } = await supabase.functions.invoke('create-paypal-order', {
                body: { 
                  amount: parseFloat(selectedTier.price.replace('$', '')),
                  planName: selectedTier.name,
                  userId: project.id,
                  userEmail: 'customer@stagedai.com' 
                }
              });

              if (error) throw error;
              return String(data.id || data.orderId); 
            } catch (err) {
              console.error("Order creation failed, using Demo ID", err);
              return "DEMO_ORDER_" + Date.now();
            }
          },
          onApprove: async (data: any) => {
            setIsProcessing(true);
            try {
              if (supabase) {
                await supabase.functions.invoke('capture-paypal-order', {
                  body: { orderId: data.orderID, userId: project.id }
                });
              }
              onPaymentSuccess({ status: 'COMPLETED', orderId: data.orderID });
            } catch (err) {
              console.error("Capture failed, proceeding anyway for demo", err);
              onPaymentSuccess({ status: 'DEMO_SUCCESS' });
            } finally {
              setIsProcessing(false);
            }
          },
          onError: (err: any) => {
            console.error('PayPal Runtime Error:', err);
            setSdkStatus('error');
            setIsProcessing(false);
          }
        });

        if (buttons.isEligible()) {
          paypalButtonInstance.current = buttons;
          buttons.render(paypalRef.current);
        } else {
          setSdkStatus('error');
        }
      } catch (err) {
        console.error("PayPal Initialization Error:", err);
        setSdkStatus('error');
      }
    }

    return () => {
      if (paypalButtonInstance.current) {
        try {
          paypalButtonInstance.current.close();
        } catch (e) {}
      }
    };
  }, [selectedTier, project, sdkStatus]);

  const handleDemoUnlock = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onPaymentSuccess({ mode: 'DEMO_UNLOCK' });
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-fadeInUp">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Comparison View */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-4xl font-black tracking-tighter text-gray-900 italic">Your Space, <span className="text-blue-600">Perfected.</span></h2>
            <div className="flex bg-gray-100 p-1.5 rounded-2xl">
              <button 
                onClick={() => setViewMode('slider')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'slider' ? 'bg-white shadow-lg text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >Slider</button>
              <button 
                onClick={() => setViewMode('sideBySide')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'sideBySide' ? 'bg-white shadow-lg text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >Compare</button>
            </div>
          </div>
          
          <div className="shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] rounded-[40px] overflow-hidden bg-gray-900 border-[10px] border-white ring-1 ring-gray-100">
            {viewMode === 'slider' ? (
              <div className="relative aspect-[4/3] group cursor-col-resize">
                <div className="absolute inset-0">
                  <img src={project.stagedImage} alt="Staged" className="w-full h-full object-cover" />
                  <div className="absolute top-6 right-6 glass-card px-4 py-2 rounded-2xl flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-800">AI Staged Result</span>
                  </div>
                </div>
                <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%`, borderRight: '3px solid white' }}>
                  <img src={project.originalImage} alt="Original" className="w-[1000px] max-w-none h-full object-cover grayscale-[0.2]" />
                  <div className="absolute top-6 left-6 bg-gray-900/80 text-white px-4 py-2 rounded-2xl backdrop-blur-md">
                     <span className="text-[10px] font-black uppercase tracking-widest">Raw Room Photo</span>
                  </div>
                </div>
                <input type="range" min="0" max="100" value={sliderPos} onChange={handleSliderChange} className="absolute inset-0 w-full h-full opacity-0 cursor-col-resize z-20"/>
                <div className="absolute top-0 bottom-0 pointer-events-none z-10 flex items-center justify-center" style={{ left: `calc(${sliderPos}% - 1.5px)` }}>
                  <div className="w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center text-blue-600 border-[4px] border-blue-50">
                    <i className="fas fa-arrows-alt-h text-xl"></i>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row aspect-[4/3] sm:aspect-[16/9]">
                <div className="relative flex-1 group">
                  <img src={project.originalImage} alt="Original" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition"></div>
                  <div className="absolute bottom-4 left-4 bg-gray-900 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">Empty Space</div>
                </div>
                <div className="relative flex-1 border-t-4 sm:border-t-0 sm:border-l-4 border-white group">
                  <img src={project.stagedImage} alt="Staged" className="w-full h-full object-cover" />
                  <div className="absolute bottom-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">StagedAI Engine</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Card */}
        <div id="pricing" className="bg-white rounded-[48px] p-8 md:p-12 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] border border-gray-50 flex flex-col h-full">
          <div className="text-center mb-10">
            <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Finalize Your Listing</span>
            <h3 className="text-3xl font-black mb-2 tracking-tighter">Ready to Sell?</h3>
            <p className="text-gray-400 text-sm font-medium">Download your high-resolution marketing assets instantly.</p>
          </div>

          <div className="space-y-4 mb-10 flex-grow">
            {PRICING_TIERS.map((tier) => (
              <div 
                key={tier.name}
                onClick={() => !isProcessing && setSelectedTier(tier)}
                className={`p-6 rounded-[32px] border-2 transition-all cursor-pointer relative group ${
                  selectedTier.name === tier.name 
                    ? 'border-blue-600 bg-blue-50/50 shadow-xl shadow-blue-100 scale-[1.02]' 
                    : 'border-gray-50 hover:border-gray-200 bg-gray-50/30'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {tier.recommended && (
                  <div className="absolute -top-3 right-8 bg-indigo-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
                    Most Popular
                  </div>
                )}
                <div className="flex justify-between items-center mb-1">
                  <h4 className={`font-black uppercase text-xs tracking-widest transition ${selectedTier.name === tier.name ? 'text-blue-600' : 'text-gray-500'}`}>{tier.name}</h4>
                  <div className="text-3xl font-black text-gray-900">{tier.price}</div>
                </div>
                <p className="text-[11px] text-gray-400 font-medium">{tier.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-white p-2 rounded-[40px] border border-gray-100 shadow-inner relative mt-auto">
            {isProcessing && (
              <div className="absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center rounded-[40px]">
                <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Verifying Assets...</span>
              </div>
            )}
            
            <div className="min-h-[160px] flex flex-col items-center justify-center p-6">
              {sdkStatus === 'loading' && (
                <div className="flex flex-col items-center justify-center py-8">
                  <i className="fas fa-spinner fa-spin text-blue-600 text-2xl mb-4"></i>
                  <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Waking Up Gateway...</span>
                </div>
              )}
              
              {sdkStatus === 'error' ? (
                <div className="text-center py-4 w-full animate-fadeInUp">
                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl mb-6">
                    <p className="text-[10px] text-amber-600 font-black uppercase tracking-widest mb-1">
                      <i className="fas fa-info-circle mr-1"></i> Demo Environment Active
                    </p>
                    <p className="text-xs text-amber-700 font-medium">Standard checkout is restricted in this preview. Use the unlock below to continue.</p>
                  </div>
                  
                  <button 
                    onClick={handleDemoUnlock}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-6 rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(37,99,235,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Unlock {selectedTier.name} Assets
                  </button>
                </div>
              ) : (
                <div ref={paypalRef} className={`w-full ${sdkStatus !== 'ready' ? 'hidden' : ''}`}></div>
              )}
            </div>

            <div className="flex items-center justify-center space-x-6 pb-6 pt-2">
               <div className="flex items-center space-x-2 grayscale opacity-40">
                 <i className="fas fa-shield-alt text-lg text-gray-900"></i>
                 <span className="text-[9px] font-black uppercase tracking-widest">SSL Encrypted</span>
               </div>
               <div className="flex items-center space-x-2 grayscale opacity-40">
                 <i className="fas fa-check-circle text-lg text-gray-900"></i>
                 <span className="text-[9px] font-black uppercase tracking-widest">Verified Merchant</span>
               </div>
            </div>
          </div>
          
          <p className="text-center text-[9px] text-gray-400 mt-6 font-bold uppercase tracking-widest">
            30-Day Happiness Guarantee. Not satisfied? We restage for free.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultsView;
