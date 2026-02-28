import React, { useState } from 'react';
import { saveInquiry } from '../services/supabaseClient';

const ContactSection: React.FC = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        try {
            await saveInquiry(formData);
            setStatus('success');
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            console.error('Failed to submit inquiry:', error);
            setStatus('error');
        }
    };

    return (
        <section id="contact-us" className="py-32 bg-[#050505] text-white overflow-hidden relative border-t border-white/5">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 rounded-lg mix-blend-overlay"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

                    {/* Left Column - Content */}
                    <div className="flex flex-col justify-center">
                        <h2 className="text-5xl font-black text-white tracking-tighter mb-6">Let's Elevate Your Listings.</h2>
                        <p className="text-gray-400 text-lg leading-relaxed mb-10 max-w-md">
                            Whether you need custom staging packages, API access for your brokerage, or just have a few questions, our team is ready to help you close deals faster.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <div className="bg-blue-600/20 text-blue-400 w-12 h-12 rounded-2xl flex items-center justify-center">
                                    <i className="fas fa-envelope text-xl"></i>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-300">Email Us</h4>
                                    <p className="text-blue-400 font-medium">hello@stagedai.com</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="bg-purple-600/20 text-purple-400 w-12 h-12 rounded-2xl flex items-center justify-center">
                                    <i className="fas fa-map-marker-alt text-xl"></i>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-300">Headquarters</h4>
                                    <p className="text-gray-500 font-medium">San Francisco, CA</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Form */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>

                        <h3 className="text-2xl font-black mb-8">Send us a message</h3>

                        {status === 'success' ? (
                            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8 text-center animate-fadeIn">
                                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <i className="fas fa-check text-white text-2xl"></i>
                                </div>
                                <h4 className="text-xl font-bold text-white mb-2">Message Sent!</h4>
                                <p className="text-gray-400">We'll get back to you within 24 hours.</p>
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="mt-6 text-sm font-bold text-blue-400 hover:text-blue-300 transition"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                {status === 'error' && (
                                    <div className="bg-red-500/10 border border-red-500/30 text-rose-400 px-4 py-3 rounded-xl text-sm mb-4">
                                        Could not send message. Please try again.
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition placeholder-gray-600"
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition placeholder-gray-600"
                                        placeholder="john@brokerage.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Message</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition placeholder-gray-600 resize-none"
                                        placeholder="How can we help you?"
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === 'submitting'}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-sm py-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                                >
                                    {status === 'submitting' ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
                        )}
                    </div>

                </div>
            </div>
        </section>
    );
};

export default ContactSection;
