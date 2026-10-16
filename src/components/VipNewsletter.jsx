import React, { useState } from 'react';
import { Mail, Check, Sparkles } from 'lucide-react';

export default function VipNewsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section className="bg-obsidian-900 text-white py-14 border-b border-white/10">
      <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          Private Allocation Club
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">
          Join Our Exclusive VIP Concierge List
        </h2>

        <p className="text-white/60 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
          Receive priority notification on limited Clean &amp; VSF factory batch releases, custom tungsten gold pieces, and secret 10% coupon codes.
        </p>

        {subscribed ? (
          <div className="p-4 bg-emerald-900/50 border border-emerald-500 text-emerald-300 text-xs font-medium inline-flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Welcome to the VIP Concierge. Check your inbox for your 10% welcome voucher code.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
            <input
              type="email"
              placeholder="Enter your VIP email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 bg-obsidian-950 border border-white/20 text-white text-xs px-4 py-3 placeholder:text-white/40 focus:outline-none focus:border-gold-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
