import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Reusable top navigation bar for public-facing / landing pages.
 * Pass `onLogin` and `onGetStarted` callbacks to customise CTA behaviour.
 */
export default function LandingNavbar({ onLogin, onGetStarted }) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogin = () => (onLogin ? onLogin() : navigate('/login'));
  const handleGetStarted = () => (onGetStarted ? onGetStarted() : navigate('/signup'));

  const navLinks = [
    // { label: 'Platform', href: '#platform' },
    // { label: 'Science', href: '#science' },
    // { label: 'Pricing', href: '#pricing' },
  ];

  return (
    <header
      id="landing-navbar"
      className={`fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-12 h-20 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl shadow-md'
          : 'bg-white/70 backdrop-blur-xl shadow-sm'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
        <span className="material-symbols-outlined text-3xl" style={{ color: 'var(--ls-primary)' }}>
          psychology
        </span>
        <span className="text-2xl font-bold tracking-tight" style={{ color: '#1e40af' }}>
         Manasveda
        </span>
      </div>

      {/* Desktop nav */}
      <div className="flex items-center gap-6">
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold" style={{ color: 'var(--ls-on-surface-variant)' }}>
          {navLinks.map((l) => (
            <a key={l.label} href={l.href} className="ls-link hover:text-primary transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <button className="ls-btn ls-btn-ghost ls-btn-sm" onClick={handleLogin}>
            Login
          </button>
          <button className="ls-btn ls-btn-primary ls-btn-sm" onClick={handleGetStarted}>
            Get Started
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined text-2xl" style={{ color: 'var(--ls-on-surface)' }}>
            {mobileOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="absolute top-20 left-0 right-0 bg-white/95 backdrop-blur-xl shadow-lg border-t border-gray-100 md:hidden ls-animate-fade-in">
          <nav className="flex flex-col p-6 gap-4">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-base font-semibold ls-link py-2"
                style={{ color: 'var(--ls-on-surface-variant)' }}
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <hr className="border-gray-100 my-2" />
            <button className="ls-btn ls-btn-ghost w-full justify-center" onClick={handleLogin}>
              Login
            </button>
            <button className="ls-btn ls-btn-primary w-full justify-center" onClick={handleGetStarted}>
              Get Started
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
