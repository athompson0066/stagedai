
import React, { useState, useEffect } from 'react';
import { PropertyGoal, BuyerPersona, StagingStyle, StagingProject, PropertyType, StyleRecommendation, MarketPositioning } from '../types';
import { GOALS, PERSONAS, STYLES, PROPERTY_TYPES, POSITIONS, PLATFORMS, TONES } from '../constants';
import { getStyleRecommendations, fetchImageFromUrl } from '../services/geminiService';

interface IntakeFormProps {
  onComplete: (data: Partial<StagingProject>) => void;
  onCancel: () => void;
}

const IntakeForm: React.FC<IntakeFormProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState<Partial<StagingProject>>({
    goal: PropertyGoal.SELL,
    propertyType: PropertyType.HOUSE,
    persona: BuyerPersona.FIRST_TIME,
    style: StagingStyle.MODERN,
    marketPositioning: MarketPositioning.MID_RANGE,
    usagePlatform: [],
    emotionalTone: TONES[0],
    notes: ''
  });
  const [imageUrl, setImageUrl] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [recommendations, setRecommendations] = useState<StyleRecommendation[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, originalImage: reader.result as string }));
        setStep(2);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return;
    setIsFetchingUrl(true);
    try {
      const base64 = await fetchImageFromUrl(imageUrl);
      setFormData(prev => ({ ...prev, originalImage: base64 }));
      setStep(2);
    } catch (error) {
      console.error("URL Fetch Error:", error);
      alert("⚠️ Access Restricted: This website is blocking direct access to the image. \n\nTip: Download the image to your computer and use the 'Upload File' option instead.");
    } finally {
      setIsFetchingUrl(false);
    }
  };

  useEffect(() => {
    if (step === 4) {
      fetchRecs();
    }
  }, [step]);

  const fetchRecs = async () => {
    setIsLoadingRecs(true);
    try {
      const recs = await getStyleRecommendations(formData.goal!, formData.propertyType!, formData.persona!);
      setRecommendations(recs);
      if (recs.length > 0) {
        setFormData(prev => ({ ...prev, style: recs[0].style }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingRecs(false);
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const togglePlatform = (platform: string) => {
    const current = formData.usagePlatform || [];
    if (current.includes(platform)) {
      setFormData({ ...formData, usagePlatform: current.filter(p => p !== platform) });
    } else {
      setFormData({ ...formData, usagePlatform: [...current, platform] });
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center py-8">
            <h2 className="text-3xl font-bold mb-4">Upload Your Room Photo</h2>
            <p className="text-gray-600 mb-12 max-w-md mx-auto">
              Choose a clear photo of your room to begin. Empty spaces work best for virtual staging.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <label className="group relative border-4 border-dashed border-gray-100 hover:border-blue-500 rounded-[32px] p-10 flex flex-col items-center justify-center cursor-pointer transition-all bg-white hover:bg-blue-50/50 shadow-sm">
                <div className="bg-blue-100 p-6 rounded-full text-blue-600 mb-4 group-hover:scale-110 transition duration-300">
                  <i className="fas fa-file-image text-3xl"></i>
                </div>
                <span className="text-sm font-black text-gray-700 uppercase tracking-wide">Upload File</span>
                <span className="text-xs text-gray-400 mt-2">JPG, PNG up to 10MB</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
              
              <div className="border-4 border-gray-50 rounded-[32px] p-10 bg-white flex flex-col items-center justify-center shadow-sm">
                <div className="bg-indigo-100 p-6 rounded-full text-indigo-600 mb-4">
                  <i className="fas fa-link text-3xl"></i>
                </div>
                <form onSubmit={handleUrlSubmit} className="w-full">
                  <input 
                    type="url" 
                    placeholder="Paste image URL here..." 
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-xl p-3.5 mb-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                    required
                  />
                  <button 
                    type="submit" 
                    disabled={isFetchingUrl}
                    className="w-full bg-blue-600 text-white font-black py-3.5 rounded-xl hover:bg-blue-700 transition flex items-center justify-center shadow-lg shadow-blue-200 disabled:opacity-50"
                  >
                    {isFetchingUrl ? <i className="fas fa-spinner fa-spin mr-2"></i> : 'Use Image Link'}
                  </button>
                  <p className="text-[10px] text-gray-400 mt-3 italic">Some sites block direct linking. Uploading is recommended.</p>
                </form>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8 py-8 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold mb-6 text-center">What is your objective?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {GOALS.map((g) => (
                  <button
                    key={g.value}
                    onClick={() => setFormData({ ...formData, goal: g.value })}
                    className={`flex items-center p-5 rounded-[24px] border-2 text-left transition duration-300 ${
                      formData.goal === g.value ? 'border-blue-500 bg-blue-50 shadow-md ring-4 ring-blue-50' : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <div className={`p-4 rounded-xl mr-5 ${formData.goal === g.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <i className={`fas ${g.icon} text-lg`}></i>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{g.value}</div>
                      <div className="text-xs text-gray-400 mt-1">{g.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-6 text-center">Target Buyer Persona</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {PERSONAS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setFormData({ ...formData, persona: p.value })}
                    className={`flex flex-col items-center p-6 rounded-[24px] border-2 text-center transition duration-300 ${
                      formData.persona === p.value ? 'border-blue-500 bg-blue-50 shadow-md ring-4 ring-blue-50' : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${formData.persona === p.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <i className={`fas ${p.icon} text-xl`}></i>
                    </div>
                    <div className="font-bold text-gray-900 text-sm">{p.label}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-between pt-8 border-t">
              <button onClick={prevStep} className="text-gray-400 font-bold px-6 py-2 hover:text-gray-800 transition">Back</button>
              <button onClick={nextStep} className="bg-blue-600 text-white px-10 py-3 rounded-xl font-black shadow-xl shadow-blue-200 hover:bg-blue-700 transition">Next Step</button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8 py-8 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold mb-8 text-center">Property Layout</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {PROPERTY_TYPES.map((pt) => (
                  <button
                    key={pt.value}
                    onClick={() => setFormData({ ...formData, propertyType: pt.value })}
                    className={`flex flex-col items-center p-8 rounded-[32px] border-2 text-center transition group duration-300 ${
                      formData.propertyType === pt.value ? 'border-blue-500 bg-blue-50 shadow-md ring-4 ring-blue-50' : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${formData.propertyType === pt.value ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-50 text-gray-400'}`}>
                      <i className={`fas ${pt.icon} text-2xl`}></i>
                    </div>
                    <div className="font-bold text-gray-900">{pt.value}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-between pt-8 border-t">
              <button onClick={prevStep} className="text-gray-400 font-bold px-6 py-2 hover:text-gray-800 transition">Back</button>
              <button onClick={nextStep} className="bg-blue-600 text-white px-10 py-3 rounded-xl font-black shadow-xl shadow-blue-200 hover:bg-blue-700 transition">Next Step</button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-8 py-8 animate-fadeIn">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Preferred Staging Style</h2>
              <p className="text-gray-500 mb-8">Select a style or use our AI recommendations based on your goals.</p>
              
              {isLoadingRecs ? (
                <div className="flex flex-col items-center justify-center p-20 bg-blue-50/30 rounded-[32px] border-2 border-dashed border-blue-100 animate-pulse mb-10">
                  <i className="fas fa-robot text-blue-600 text-4xl mb-4 animate-bounce"></i>
                  <span className="text-blue-600 font-bold">AI Crew selecting best design fit...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                  {recommendations.map((rec, i) => (
                    <div 
                      key={i} 
                      className={`relative p-6 rounded-[24px] border-2 text-left transition cursor-pointer flex flex-col duration-300 ${
                        formData.style === rec.style ? 'border-blue-600 bg-blue-50 shadow-lg ring-4 ring-blue-50' : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                      onClick={() => setFormData({ ...formData, style: rec.style })}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-black text-blue-600 text-lg uppercase tracking-tight">{rec.style}</span>
                        {formData.style === rec.style ? (
                          <div className="bg-blue-600 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center"><i className="fas fa-check text-[10px]"></i></div>
                        ) : (
                          <div className="bg-blue-50 text-blue-500 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">AI Match</div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed italic">"{rec.rationale}"</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center space-x-4 mb-8">
                <div className="flex-grow h-px bg-gray-200"></div>
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Full Style Catalog</span>
                <div className="flex-grow h-px bg-gray-200"></div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
                {STYLES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setFormData({ ...formData, style: s.value })}
                    className={`group relative flex flex-col overflow-hidden rounded-[24px] border-2 transition duration-300 ${
                      formData.style === s.value ? 'border-blue-600 bg-blue-50 shadow-xl' : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img src={s.image} alt={s.label} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                      {formData.style === s.value && (
                        <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center">
                          <div className="bg-white text-blue-600 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transform scale-110">
                            <i className="fas fa-check text-lg"></i>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4 text-center">
                      <span className="font-bold text-gray-900 block">{s.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between pt-8 border-t">
              <button onClick={prevStep} className="text-gray-400 font-bold px-6 py-2 hover:text-gray-800 transition">Back</button>
              <button onClick={nextStep} className="bg-blue-600 text-white px-10 py-3 rounded-xl font-black shadow-xl shadow-blue-200 hover:bg-blue-700 transition">Review Design</button>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-8 py-8 animate-fadeIn">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Final Review & Refine</h2>
              <p className="text-gray-500 mb-10">Add specific touches to ensure your vision is perfectly captured.</p>
              
              <div className="bg-gray-50 rounded-[32px] p-8 mb-8 border border-gray-100">
                <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-[0.2em] mb-6 flex items-center justify-center">
                  Selected Strategy
                </h3>
                <div className="grid grid-cols-2 gap-3 text-left max-w-lg mx-auto">
                  {[
                    { label: 'Objective', value: formData.goal },
                    { label: 'Persona', value: formData.persona },
                    { label: 'Style', value: formData.style },
                    { label: 'Property', value: formData.propertyType }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-[20px] shadow-sm border border-gray-100">
                      <span className="text-[9px] text-blue-400 font-black block mb-1 uppercase tracking-wider">{item.label}</span>
                      <span className="font-bold text-gray-800 text-sm truncate block">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="max-w-xl mx-auto">
                <button 
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={`flex items-center justify-center space-x-2 font-black py-4 w-full rounded-2xl transition duration-300 border-2 ${
                    showAdvanced ? 'bg-white border-blue-600 text-blue-600' : 'bg-blue-50/50 border-dashed border-blue-100 text-blue-600 hover:bg-blue-50'
                  } mb-6`}
                >
                  <i className={`fas ${showAdvanced ? 'fa-chevron-up' : 'fa-sliders-h'}`}></i>
                  <span>{showAdvanced ? 'Collapse Details' : 'Add Advanced Refinements (Optional)'}</span>
                </button>

                <div className={`space-y-6 text-left transition-all duration-500 overflow-hidden ${showAdvanced ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h4 className="font-black text-gray-400 text-[10px] uppercase tracking-wider mb-4">Market Positioning</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {POSITIONS.map(p => (
                        <button
                          key={p.value}
                          onClick={() => setFormData({...formData, marketPositioning: p.value})}
                          className={`flex items-center p-3.5 rounded-xl border-2 transition duration-300 ${
                            formData.marketPositioning === p.value ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-50 bg-gray-50/50 text-gray-500'
                          }`}
                        >
                          <i className={`fas ${p.icon} mr-3 text-sm`}></i>
                          <span className="text-xs font-bold">{p.value}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h4 className="font-black text-gray-400 text-[10px] uppercase tracking-wider mb-4">Emotional Tone</h4>
                    <div className="flex flex-wrap gap-2">
                      {TONES.map(t => (
                        <button
                          key={t}
                          onClick={() => setFormData({...formData, emotionalTone: t})}
                          className={`px-5 py-2.5 rounded-full border-2 text-[11px] font-bold transition duration-300 ${
                            formData.emotionalTone === t ? 'border-blue-600 bg-blue-600 text-white shadow-lg' : 'border-gray-50 bg-gray-50/50 text-gray-500 hover:border-gray-200'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h4 className="font-black text-gray-400 text-[10px] uppercase tracking-wider mb-4">Platform Optimization</h4>
                    <div className="flex flex-wrap gap-2">
                      {PLATFORMS.map(p => (
                        <button
                          key={p}
                          onClick={() => togglePlatform(p)}
                          className={`px-5 py-2.5 rounded-full border-2 text-[11px] font-bold transition duration-300 ${
                            formData.usagePlatform?.includes(p) ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg' : 'border-gray-50 bg-gray-50/50 text-gray-500 hover:border-gray-200'
                          }`}
                        >
                          <i className={`fas ${formData.usagePlatform?.includes(p) ? 'fa-check-circle' : 'fa-plus'} mr-1.5 opacity-60`}></i>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h4 className="font-black text-gray-400 text-[10px] uppercase tracking-wider mb-4">Director's Notes</h4>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="e.g., Ensure the light hits the floorboards, emphasize the ceiling height..."
                      className="w-full border border-gray-100 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none h-32 text-sm transition"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between pt-8 border-t">
              <button onClick={prevStep} className="text-gray-400 font-bold px-6 py-2 hover:text-gray-800 transition">Back</button>
              <button
                onClick={() => onComplete(formData)}
                className="bg-blue-600 text-white px-12 py-4 rounded-[20px] font-black shadow-2xl shadow-blue-300 hover:bg-blue-700 transition transform hover:-translate-y-1 uppercase tracking-widest text-sm"
              >
                Launch Staging AI
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 mt-8 mb-20">
      <div className="bg-white rounded-[48px] shadow-[0_48px_80px_-24px_rgba(0,0,0,0.12)] p-8 md:p-14 relative overflow-hidden border border-gray-50">
        {step > 1 && (
          <div className="absolute top-0 left-0 w-full h-3 bg-gray-50">
            <div className="h-full bg-gradient-to-r from-blue-400 via-blue-600 to-indigo-600 transition-all duration-1000 ease-in-out" style={{ width: `${(step / 5) * 100}%` }}></div>
          </div>
        )}
        {renderStep()}
      </div>
      <div className="mt-10 text-center">
        <button onClick={onCancel} className="text-gray-300 hover:text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] transition">
          Exit Wizard & Discard Draft
        </button>
      </div>
    </div>
  );
};

export default IntakeForm;
