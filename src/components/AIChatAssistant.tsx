import { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, MessageCircle } from 'lucide-react';
import { saveLead } from '../lib/api';

type Message = {
  role: 'ai' | 'user';
  text: string;
  options?: { label: string; action: string }[];
};

const aiResponses: Record<string, { text: string; options?: { label: string; action: string }[] }> = {
  'start': {
    text: "Hi! I'm Digi AI. I can help you with services, scheduling, and getting a custom quote. What are you interested in?",
    options: [
      { label: 'Web Development', action: 'web' },
      { label: 'Digital Marketing', action: 'marketing' },
      { label: 'Get a Quote', action: 'quote' },
      { label: 'Book a Meeting', action: 'meeting' },
    ],
  },
  'web': {
    text: "Our web development services are built with React, Next.js, and TypeScript for blazing-fast performance. We offer custom quotes based on your requirements. Would you like to know more?",
    options: [
      { label: 'Get a Quote', action: 'quote' },
      { label: 'See Portfolio', action: 'portfolio' },
      { label: 'Talk to Human', action: 'human' },
    ],
  },
  'marketing': {
    text: "Our digital marketing packages cover SEO, Google Ads, Meta Ads, and social media management. We provide custom quotes based on your goals. What's your main goal?",
    options: [
      { label: 'Get More Customers', action: 'quote' },
      { label: 'Improve SEO', action: 'seo' },
      { label: 'Social Media', action: 'social' },
    ],
  },
  'quote': {
    text: "I can connect you with our team for a custom quote! What type of project do you need?",
    options: [
      { label: 'Website', action: 'website_quote' },
      { label: 'Mobile App', action: 'app_quote' },
      { label: 'Branding', action: 'branding_quote' },
      { label: 'Full Package', action: 'full_quote' },
    ],
  },
  'website_quote': {
    text: "A professional website with our AI-powered design system includes hosting, SSL, and SEO optimization. Our team will prepare a custom quote based on your specific needs. Would you like to proceed?",
    options: [
      { label: 'Book Free Consultation', action: 'meeting' },
      { label: 'Talk to Human', action: 'human' },
      { label: 'Start Over', action: 'start' },
    ],
  },
  'app_quote': {
    text: "Mobile app development for cross-platform (iOS + Android) with backend typically takes 4-6 weeks. Shall I connect you with our team for a custom quote?",
    options: [
      { label: 'Book Free Consultation', action: 'meeting' },
      { label: 'Talk to Human', action: 'human' },
      { label: 'Start Over', action: 'start' },
    ],
  },
  'branding_quote': {
    text: "Our branding package includes logo design, brand guidelines, and visual identity. Delivery in 2-3 weeks. Would you like to proceed?",
    options: [
      { label: 'Book Free Consultation', action: 'meeting' },
      { label: 'Talk to Human', action: 'human' },
      { label: 'Start Over', action: 'start' },
    ],
  },
  'full_quote': {
    text: "Our complete digital package includes website + branding + marketing + hosting with a bundle discount. Shall we discuss details and get you a custom quote?",
    options: [
      { label: 'Book Free Consultation', action: 'meeting' },
      { label: 'Talk to Human', action: 'human' },
      { label: 'Start Over', action: 'start' },
    ],
  },
  'meeting': {
    text: "Great! I'll need your email to schedule a free consultation. Our team will reach out within 24 hours. You can also call us at +91 9000207739.",
    options: [
      { label: 'Start Over', action: 'start' },
    ],
  },
  'human': {
    text: "I'll connect you with our team. Please leave your email or phone number, and we'll reach out shortly!",
    options: [
      { label: 'Start Over', action: 'start' },
    ],
  },
  'portfolio': {
    text: "You can view our portfolio at the Portfolio page. We've completed 1200+ projects across 25+ countries. Would you like to see specific work?",
    options: [
      { label: 'Get a Quote', action: 'quote' },
      { label: 'Book a Meeting', action: 'meeting' },
      { label: 'Start Over', action: 'start' },
    ],
  },
  'seo': {
    text: "Our SEO services include keyword research, on-page optimization, and link building. Results typically show in 3-6 months. Interested in a custom quote?",
    options: [
      { label: 'Get a Quote', action: 'quote' },
      { label: 'Book a Meeting', action: 'meeting' },
      { label: 'Start Over', action: 'start' },
    ],
  },
  'social': {
    text: "We manage social media across all platforms — Instagram, Facebook, LinkedIn, Twitter — with content creation and scheduling. Shall we discuss a custom plan?",
    options: [
      { label: 'Get a Quote', action: 'quote' },
      { label: 'Book a Meeting', action: 'meeting' },
      { label: 'Start Over', action: 'start' },
    ],
  },
};

export default function AIChatAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const openChat = () => {
    setOpen(true);
    if (!hasGreeted) {
      setHasGreeted(true);
      setTimeout(() => {
        setMessages([{ role: 'ai', text: aiResponses.start.text, options: aiResponses.start.options }]);
      }, 500);
    }
  };

  const handleOption = (action: string) => {
    const response = aiResponses[action];
    if (!response) return;

    const optionLabel = aiResponses.start.options?.find(o => o.action === action)?.label || action;
    setMessages(prev => [...prev, { role: 'user', text: optionLabel }]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'ai', text: response.text, options: response.options }]);
    }, 800);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsTyping(true);

    // Simple keyword matching
    setTimeout(() => {
      setIsTyping(false);
      const lower = userText.toLowerCase();
      let action = 'start';
      if (lower.includes('website') || lower.includes('web')) action = 'web';
      else if (lower.includes('market') || lower.includes('seo') || lower.includes('social')) action = 'marketing';
      else if (lower.includes('quote') || lower.includes('price') || lower.includes('cost')) action = 'quote';
      else if (lower.includes('meeting') || lower.includes('call') || lower.includes('consult')) action = 'meeting';
      else if (lower.includes('app') || lower.includes('mobile')) action = 'app_quote';
      else if (lower.includes('brand') || lower.includes('logo')) action = 'branding_quote';
      else if (lower.includes('human') || lower.includes('talk') || lower.includes('person')) action = 'human';

      const response = aiResponses[action];
      setMessages(prev => [...prev, { role: 'ai', text: response.text, options: response.options }]);

      // Save lead if email/phone is mentioned
      if (lower.includes('@') || lower.match(/\d{10}/)) {
        saveLead({
          name: 'AI Chat Lead',
          email: lower.includes('@') ? userText : 'pending@chat.digi8',
          service: 'AI Chat',
          source: 'AI Chat Assistant',
          message: userText,
        }).catch(() => {});
      }
    }, 1000);
  };

  return (
    <>
      {/* Chat Widget Button */}
      {!open && (
        <button
          onClick={openChat}
          data-magnetic
          className="chat-widget w-14 h-14 rounded-full bg-gradient-to-br from-accent to-highlight flex items-center justify-center shadow-glow-accent hover:scale-110 transition-transform magnetic group"
          aria-label="Open AI Chat"
        >
          <div className="absolute inset-0 rounded-full border-2 border-accent/40 pulse-ring" />
          <MessageCircle size={24} className="text-white group-hover:scale-110 transition-transform" />
          {/* Notification badge */}
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent-green flex items-center justify-center text-[10px] font-sora font-bold text-primary">
            AI
          </span>
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div className="chat-widget w-[calc(100vw-3rem)] sm:w-96 h-[500px] glass-strong rounded-3xl border border-white/10 shadow-card flex flex-col overflow-hidden slide-in-up">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-accent/10 to-highlight/10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-highlight flex items-center justify-center shadow-glow-accent">
                  <Sparkles size={18} className="text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-accent-green border-2 border-primary" />
              </div>
              <div>
                <h3 className="font-sora font-bold text-white text-sm">Digi AI Assistant</h3>
                <p className="text-[10px] text-accent-green font-inter">Online — Always here to help</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close chat"
            >
              <X size={18} className="text-slate-400" />
            </button>
          </div>

          {/* Messages */}
          <div ref={chatRef} className="flex-1 overflow-y-auto chat-scroll p-4 space-y-3">
            {messages.length === 0 && !isTyping && (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                  <Sparkles size={20} className="text-accent" />
                </div>
                <p className="text-sm text-slate-400 font-inter">Starting AI Assistant...</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 slide-in-up ${
                    msg.role === 'ai' ? 'ai-bubble rounded-tl-sm' : 'user-bubble rounded-tr-sm'
                  }`}
                >
                  {msg.role === 'ai' && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <Sparkles size={10} className="text-accent" />
                      <span className="text-[9px] text-accent font-inter font-medium">DIGI AI</span>
                    </div>
                  )}
                  <p className={`text-xs font-inter ${msg.role === 'ai' ? 'text-slate-200' : 'text-white'}`}>
                    {msg.text}
                  </p>
                  {msg.options && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.options.map(opt => (
                        <button
                          key={opt.action}
                          onClick={() => handleOption(opt.action)}
                          className="text-[10px] px-2.5 py-1.5 rounded-full glass border border-accent/20 text-accent hover:bg-accent/10 transition-all font-inter"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="ai-bubble rounded-2xl rounded-tl-sm px-3 py-2">
                  <div className="typing-dots flex items-center">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="form-input flex-1 px-3 py-2.5 rounded-xl text-xs font-inter"
              />
              <button
                onClick={handleSend}
                className="btn-glow px-3 py-2.5 rounded-xl flex items-center justify-center"
                aria-label="Send message"
              >
                <Send size={14} className="text-white" />
              </button>
            </div>
            <p className="text-[9px] text-slate-500 font-inter text-center mt-2">
              Powered by Digi AI · Responses are automated
            </p>
          </div>
        </div>
      )}
    </>
  );
}
