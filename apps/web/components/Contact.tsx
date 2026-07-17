'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Send, FileCheck, CheckCircle2 } from 'lucide-react';

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
      const res = await fetch('http://localhost:8000/api/contact', {
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
          <p className="text-zinc-500 text-xs mt-3 leading-relaxed">
            Message submitted successfully. Payload stored inside MongoDB telemetry collection, and email alerts dispatched via Resend.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="py-24 px-6 max-w-2xl mx-auto border-t border-white/5 font-mono">
      <div className="flex flex-col mb-12 text-center">
        <span className="text-[10px] font-mono tracking-widest text-blue-400 uppercase mb-3">07 // CONTACT_PIPELINE</span>
        <h2 className="text-3xl font-sans font-bold tracking-tight text-white">
          Secure contact Interface
        </h2>
        <p className="text-zinc-500 text-xs mt-3 leading-relaxed">
          Submit pipeline targets. Data payloads write directly to MongoDB Atlas.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 border border-white/5 bg-white/2 p-8 rounded-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="contact-name" className="text-[9px] text-zinc-400 uppercase tracking-wider">Ident Name *</label>
            <input
              id="contact-name"
              type="text"
              required
              placeholder="e.g. Alice HR"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-zinc-950 border border-white/10 rounded-lg text-zinc-200 text-xs focus:outline-none focus:border-blue-500/30 font-mono"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="contact-email" className="text-[9px] text-zinc-400 uppercase tracking-wider">Target Email *</label>
            <input
              id="contact-email"
              type="email"
              required
              placeholder="e.g. alice@hr.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 bg-zinc-950 border border-white/10 rounded-lg text-zinc-200 text-xs focus:outline-none focus:border-blue-500/30 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="contact-company" className="text-[9px] text-zinc-400 uppercase tracking-wider">Company</label>
            <input
              id="contact-company"
              type="text"
              placeholder="e.g. Tech Corp"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-4 py-2.5 bg-zinc-950 border border-white/10 rounded-lg text-zinc-200 text-xs focus:outline-none focus:border-blue-500/30 font-mono"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="contact-job" className="text-[9px] text-zinc-400 uppercase tracking-wider">Job Interest</label>
            <input
              id="contact-job"
              type="text"
              placeholder="e.g. Backend Lead"
              value={formData.job}
              onChange={(e) => setFormData({ ...formData, job: e.target.value })}
              className="w-full px-4 py-2.5 bg-zinc-950 border border-white/10 rounded-lg text-zinc-200 text-xs focus:outline-none focus:border-blue-500/30 font-mono"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="contact-budget" className="text-[9px] text-zinc-400 uppercase tracking-wider">Project Budget</label>
            <input
              id="contact-budget"
              type="text"
              placeholder="e.g. $10k+"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="w-full px-4 py-2.5 bg-zinc-950 border border-white/10 rounded-lg text-zinc-200 text-xs focus:outline-none focus:border-blue-500/30 font-mono"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="contact-message" className="text-[9px] text-zinc-400 uppercase tracking-wider">Description Payload *</label>
          <textarea
            id="contact-message"
            rows={5}
            required
            placeholder="Introduce system proposals, roles parameters, or general queries..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-lg text-zinc-200 text-xs focus:outline-none focus:border-blue-500/30 resize-none font-mono"
          />
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex items-center justify-center gap-2 py-3 rounded-lg bg-white hover:bg-zinc-200 text-[#030303] text-xs font-bold font-mono tracking-wider transition-all disabled:opacity-50 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>TRANSMIT_PAYLOAD</span>
        </button>
      </form>
    </section>
  );
}
