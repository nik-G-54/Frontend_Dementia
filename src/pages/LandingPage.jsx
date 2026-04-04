import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/landing.css';

import {
  LandingNavbar,
  HeroSection,
  EcosystemSection,
  JourneySection,
  CTASection,
  LandingFooter,
} from '../components/landing';

/**
 * Public landing page — the very first page any visitor sees.
 *
 * Navigation rules (per requirements):
 *  • "Login" button  → /login
 *  • "Get Started"   → /login  (must sign up / sign in before testing)
 *  • "Start Assessment" (hero CTA)  → /login
 *  • "Start Cognitive Test" (bottom CTA) → /login
 *  • "Clinical Research" → #science anchor on this page
 */
export default function LandingPage() {
  const navigate = useNavigate();

  const goLogin   = () => navigate('/login');
  const goScience = () => {
    document.getElementById('science')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="ls-page">
      <LandingNavbar onLogin={goLogin} onGetStarted={goLogin} />

      <main style={{ paddingTop: '5rem' }}>
        <HeroSection onStartAssessment={goLogin} onLearnMore={goScience} />
        <EcosystemSection />
        <JourneySection />
        <CTASection onStartTest={goLogin} />
      </main>

      <LandingFooter />
    </div>
  );
}
