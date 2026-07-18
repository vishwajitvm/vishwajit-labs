'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Send, CheckCircle2 } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    company: '',
    job: '',
    budget: '',
    resume_url: ''
  });
  
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: async (payload: typeof formData) => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vishwajit-labs-backend.onrender.com';
      const res = await fetch(`${apiUrl}/api/contact/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        throw new Error('API failure');
      }
      return res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (submitted) {
    return (
      <section id="contact" className="py-24 px-6 max-w-lg mx-auto text-center font-mono">
        <div className="flex flex-col items-center p-8 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-4 animate-bounce" />
          <h3 className="text-white text-base font-bold">Connection Established</h3>
          <p className="text-zinc-300 text-sm mt-3 leading-relaxed">
            Message submitted successfully. Payload stored inside MongoDB telemetry collection, and email alerts dispatched via Resend.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="py-24 px-6 max-w-4xl mx-auto border-t border-white/5 font-mono">
      <div className="flex flex-col mb-12 text-center">
        <span className="text-xs font-mono tracking-widest text-blue-400 uppercase mb-3">03 // CONTACT_PIPELINE</span>
        <h2 className="text-4xl font-sans font-bold tracking-tight text-white">
          Secure Contact Interface
        </h2>
        <p className="text-zinc-400 text-sm mt-3 leading-relaxed">
          Submit pipeline targets. Data payloads write directly to MongoDB Atlas.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 border border-white/5 bg-white/2 p-8 sm:p-12 rounded-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2.5">
            <label htmlFor="contact-name" className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Ident Name *</label>
            <input
              id="contact-name"
              type="text"
              required
              placeholder="e.g. Alice HR"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-lg text-zinc-200 text-sm focus:outline-none focus:border-blue-500/30 font-mono"
            />
          </div>
          
          <div className="flex flex-col gap-2.5">
            <label htmlFor="contact-email" className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Target Email *</label>
            <input
              id="contact-email"
              type="email"
              required
              placeholder="e.g. alice@hr.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-lg text-zinc-200 text-sm focus:outline-none focus:border-blue-500/30 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2.5">
            <label htmlFor="contact-company" className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Company</label>
            <input
              id="contact-company"
              type="text"
              placeholder="e.g. Tech Corp"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-lg text-zinc-200 text-sm focus:outline-none focus:border-blue-500/30 font-mono"
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <label htmlFor="contact-job" className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Job Interest</label>
            <input
              id="contact-job"
              type="text"
              placeholder="e.g. Backend Lead"
              value={formData.job}
              onChange={(e) => setFormData({ ...formData, job: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-lg text-zinc-200 text-sm focus:outline-none focus:border-blue-500/30 font-mono"
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <label htmlFor="contact-budget" className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Project Budget</label>
            <input
              id="contact-budget"
              type="text"
              placeholder="e.g. $10k+"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-lg text-zinc-200 text-sm focus:outline-none focus:border-blue-500/30 font-mono"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <label htmlFor="contact-message" className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Description Payload *</label>
          <textarea
            id="contact-message"
            rows={5}
            required
            placeholder="Introduce system proposals, roles parameters, or general queries..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-lg text-zinc-200 text-sm focus:outline-none focus:border-blue-500/30 resize-none font-mono"
          />
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex items-center justify-center gap-2 py-3.5 rounded-lg bg-white hover:bg-zinc-200 text-[#030303] text-sm font-bold font-mono tracking-wider transition-all disabled:opacity-50 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>TRANSMIT_PAYLOAD</span>
        </button>
      </form>

      {/* Social & Contact Details Badge Section */}
      <div className="mt-12 p-8 border border-white/10 bg-white/2 rounded-2xl flex flex-col md:flex-row justify-between gap-8 items-start">
        <div className="flex flex-col gap-4">
          <h3 className="text-white text-lg font-bold uppercase tracking-wider font-mono">System Interfaces</h3>
          <div className="flex flex-col gap-2">
            <span className="text-zinc-400 text-xs uppercase font-mono tracking-wider">Direct Channels</span>
            <p className="text-zinc-200 text-sm font-mono">
              Email: <a href="mailto:vishwajitmall50@gmail.com" className="text-blue-400 hover:text-blue-300 transition-colors">vishwajitmall50@gmail.com</a>
            </p>
            <p className="text-zinc-200 text-sm font-mono">
              Phone: <a href="tel:+918920352115" className="text-blue-400 hover:text-blue-300 transition-colors">+91 8920352115</a>
            </p>
          </div>
          <p className="text-zinc-500 text-xs font-mono">
            Location node: New Delhi, India
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-white text-lg font-bold uppercase tracking-wider font-mono">Social Connections</h3>
          <div className="flex flex-wrap gap-2.5 max-w-md">
            <a href="https://www.linkedin.com/in/vishwajit-vm-179a61149" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" className="h-6" />
            </a>
            <a href="https://www.github.com/vishwajitvm" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" className="h-6" />
            </a>
            <a href="https://www.twitter.com/VishwajitVm" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <img src="https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white" alt="Twitter" className="h-6" />
            </a>
            <a href="https://hashnode.com/@Vishwajitvm" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <img src="https://img.shields.io/badge/Hashnode-2962FF?style=for-the-badge&logo=hashnode&logoColor=white" alt="Hashnode" className="h-6" />
            </a>
            <a href="https://www.codepen.io/vishwajitvm" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <img src="https://img.shields.io/badge/Codepen-000000?style=for-the-badge&logo=codepen&logoColor=white" alt="Codepen" className="h-6" />
            </a>
            <a href="https://www.codesandbox.com/vishwajitmall50" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <img src="https://img.shields.io/badge/Codesandbox-151515?style=for-the-badge&logo=codesandbox&logoColor=white" alt="Codesandbox" className="h-6" />
            </a>
            <a href="http://www.instagram.com/codeclickcraftsman" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <img src="https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram" className="h-6" />
            </a>
            <a href="https://www.youtube.com/channel/UCldd1WpTGf1uX1ZDdNH20IA" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <img src="https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="YouTube" className="h-6" />
            </a>
            <a href="https://www.twitch.tv/wolverinevm" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <img src="https://img.shields.io/badge/Twitch-9146FF?style=for-the-badge&logo=twitch&logoColor=white" alt="Twitch" className="h-6" />
            </a>
            <a href="https://www.facebook.com/unknown683" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <img src="https://img.shields.io/badge/Facebook-1877F2?style=for-the-badge&logo=facebook&logoColor=white" alt="Facebook" className="h-6" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
