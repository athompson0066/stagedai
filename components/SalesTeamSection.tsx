
import React, { useState, useRef, useEffect } from 'react';
import { getSalesCrewResponse } from '../services/geminiService';
import { saveInquiry } from '../services/supabaseClient';

const SalesTeamSection: React.FC = () => {
  const [isChatting, setIsChatting] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', parts: [{text: string}]}[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryData, setInquiryData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = inputValue.trim();
    setMessages(prev => [...prev, { role: 'user', parts: [{ text: userMsg }] }]);
    setInputValue('');
    setIsTyping(true);

    try {
      const responseText = await getSalesCrewResponse(userMsg, messages);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: responseText }] }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await saveInquiry(inquiryData);
      setSubmitStatus('success');
      setTimeout(() => {
        setShowInquiryForm(false);
        setSubmitStatus('idle');
        setInquiryData({ name: '', email: '', message: '' });
      }, 3000);
    } catch (err) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="sales-crew" className="py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-[48px] shadow-2xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left: The Crew Presentation */}
            <div className="lg:col-span-5 p-12 lg:p-16 bg-blue-600 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <div className="relative z-10">
                <span className="text-blue-200 font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Personalized Consultation</span>
                <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight tracking-tighter">Meet the <br />Success Crew</h2>
                <p className="text-blue-100 text-lg mb-12 font-medium">Our multi-agent sales team is here to help you scale your real estate business with AI.</p>
                
                <div className="space-y-6">
                  {[
                    { name: 'Alex', role: 'Sales Strategist', desc: 'Expert in property ROI and market trends.', icon: 'fa-chart-pie' },
                    { name: 'Sarah', role: 'Inquiry Manager', desc: 'Ensures your technical needs are met.', icon: 'fa-headset' },
                    { name: 'Marcus', role: 'Closer', desc: 'Helping you launch and see results today.', icon: 'fa-check-double' }
                  ].map((agent, i) => (
                    <div key={i} className="flex items-start space-x-4 bg-white/10 p-4 rounded-2xl border border-white/10 hover:bg-white/20 transition">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-lg">
                        <i className={`fas ${agent.icon} text-lg`}></i>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-sm uppercase tracking-wider">{agent.name}</span>
                          <span className="text-[10px] bg-blue-500 px-2 py-0.5 rounded-full font-bold">AGENT 0{i+1}</span>
                        </div>
                        <p className="text-xs text-blue-100 mt-1">{agent.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Interaction Hub */}
            <div className="lg:col-span-7 p-8 lg:p-16 flex flex-col min-h-[600px]">
              {!isChatting && !showInquiryForm ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center animate-fadeInUp">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 text-3xl mb-6 shadow-inner">
                    <i className="fas fa-comments"></i>
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter">Ready to take your listing to the next level?</h3>
                  <p className="text-gray-500 max-w-md mb-10 font-medium italic">"The quickest way to sell is to show. Let our crew guide your strategy."</p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                    <button 
                      onClick={() => setIsChatting(true)}
                      className="flex-grow bg-gray-900 text-white px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition shadow-xl"
                    >
                      Chat with the Crew
                    </button>
                    <button 
                      onClick={() => setShowInquiryForm(true)}
                      className="flex-grow bg-white text-gray-900 border-2 border-gray-100 px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:border-blue-600 transition"
                    >
                      Send Inquiry
                    </button>
                  </div>
                </div>
              ) : isChatting ? (
                <div className="flex flex-col h-full animate-fadeIn">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b">
                    <div className="flex items-center space-x-3">
                      <div className="flex -space-x-2">
                         <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">A</div>
                         <div className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">S</div>
                         <div className="w-8 h-8 rounded-full bg-gray-900 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">M</div>
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest text-gray-400">Consultation Session Active</span>
                    </div>
                    <button onClick={() => setIsChatting(false)} className="text-gray-400 hover:text-red-500 transition">
                      <i className="fas fa-times-circle text-xl"></i>
                    </button>
                  </div>
                  
                  <div className="flex-grow overflow-y-auto mb-6 space-y-4 pr-2 custom-scrollbar max-h-[400px]">
                    {messages.length === 0 && (
                      <div className="bg-blue-50 p-6 rounded-3xl text-sm text-blue-800 font-medium">
                        Alex: Welcome! We're the StagedAI Sales Crew. What's on your mind today? Whether it's pricing, style strategy, or bulk property staging, we have answers.
                      </div>
                    )}
                    {messages.map((m, idx) => (
                      <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-5 rounded-3xl text-sm leading-relaxed shadow-sm ${
                          m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-50 text-gray-800 rounded-tl-none border border-gray-100'
                        }`}>
                          {m.parts[0].text.split('\n').map((line, i) => (
                            <p key={i} className={i > 0 ? 'mt-3' : ''}>
                              {line.includes(':') ? (
                                <><span className="font-black uppercase text-[10px] tracking-widest mr-2 opacity-70">{line.split(':')[0]}:</span>{line.split(':')[1]}</>
                              ) : line}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 flex space-x-1">
                          <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-100"></div>
                          <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-200"></div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  
                  <form onSubmit={handleSendMessage} className="mt-auto relative">
                    <input 
                      type="text" 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask the crew anything..."
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 pr-16 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                    <button 
                      type="submit"
                      disabled={isTyping || !inputValue.trim()}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                      <i className="fas fa-paper-plane"></i>
                    </button>
                  </form>
                </div>
              ) : (
                <div className="animate-fadeIn">
                  <div className="flex justify-between items-center mb-8 pb-4 border-b">
                     <h3 className="text-xl font-black uppercase tracking-tighter">Direct Inquiry</h3>
                     <button onClick={() => setShowInquiryForm(false)} className="text-gray-400 hover:text-red-500 transition">
                      <i className="fas fa-times-circle text-xl"></i>
                    </button>
                  </div>
                  
                  {submitStatus === 'success' ? (
                    <div className="py-20 text-center animate-bounce">
                      <i className="fas fa-check-circle text-green-500 text-6xl mb-6"></i>
                      <h4 className="text-2xl font-black text-gray-900">Inquiry Received!</h4>
                      <p className="text-gray-500">Sarah will be in touch with you shortly.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitInquiry} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Your Name</label>
                          <input 
                            required
                            type="text" 
                            value={inquiryData.name}
                            onChange={(e) => setInquiryData({...inquiryData, name: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                          <input 
                            required
                            type="email" 
                            value={inquiryData.email}
                            onChange={(e) => setInquiryData({...inquiryData, email: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">How can we help?</label>
                        <textarea 
                          required
                          value={inquiryData.message}
                          onChange={(e) => setInquiryData({...inquiryData, message: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition h-32"
                          placeholder="Tell us about your property or project goals..."
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition"
                      >
                        {isSubmitting ? <i className="fas fa-spinner fa-spin mr-2"></i> : 'Submit Inquiry'}
                      </button>
                      {submitStatus === 'error' && <p className="text-center text-xs text-red-500 font-bold mt-2">Submission failed. Check Supabase connection in settings.</p>}
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SalesTeamSection;
