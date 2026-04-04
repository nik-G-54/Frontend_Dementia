import React from 'react';

const flowSteps = [
  {
    icon: 'person_add',
    title: '1. Create Account',
    description: 'Sign up securely to personalize your cognitive health journey and save your progress.',
  },
  {
    icon: 'sports_esports',
    title: '2. Baseline Assessment',
    description: 'Play 3 fun, clinically-designed games to establish your baseline cognitive profile.',
  },
  {
    icon: 'monitoring',
    title: '3. Receive AI Insights',
    description: 'Our AI analyzes your performance to generate a comprehensive, easy-to-understand report.',
  },
  {
    icon: 'calendar_month',
    title: '4. Daily Monitoring',
    description: 'Engage in 2-minute daily check-ins to track your brain health and build resilience over time.',
  },
];

export default function UserFlowSection() {
  return (
    <section className="py-20" style={{ background: 'var(--ls-surface-container-low)' }}>
      <div style={{ maxWidth: 'var(--ls-max-width)', margin: '0 auto', padding: '0 2rem' }}>
        
        <div className="text-center mb-16 ls-animate-fade-up">
          <span 
            className="block text-xs font-bold uppercase mb-4" 
            style={{ color: 'var(--ls-primary)', letterSpacing: '0.2em' }}
          >
            Getting Started
          </span>
          <h2 className="text-3xl md:text-5xl font-bold" style={{ color: 'var(--ls-on-background)' }}>
            Your Journey Begins Here
          </h2>
          <p className="max-w-2xl mx-auto mt-4" style={{ color: 'var(--ls-on-surface-variant)' }}>
            Follow our simple, streamlined path to better cognitive health. Discover how easy it is to start tracking and improving your brain vitality today.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line (hidden on mobile) */}
          <div 
            className="hidden md:block absolute top-[4rem] left-0 w-full h-1 -translate-y-1/2" 
            style={{ background: 'rgba(193, 198, 215, 0.4)', zIndex: 0 }}
          />

          <div className="grid md:grid-cols-4 gap-8 relative z-10">
            {flowSteps.map((step, index) => (
              <div 
                key={index} 
                className={`ls-animate-fade-up ls-delay-${index + 1} flex flex-col items-center text-center p-6 ls-glass rounded-2xl transition-transform hover:-translate-y-2`}
                style={{ background: '#ffffff', boxShadow: 'var(--ls-shadow-md)', border: '1px solid rgba(193,198,215, 0.2)' }}
              >
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-6 relative"
                  style={{ 
                    background: 'var(--ls-primary)', 
                    color: '#ffffff',
                    boxShadow: '0 8px 16px rgba(0,106,97,.2)'
                  }}
                >
                  <span className="material-symbols-outlined text-2xl">{step.icon}</span>
                </div>
                <h3 className="font-bold text-lg mb-3" style={{ color: 'var(--ls-on-surface)' }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--ls-on-surface-variant)' }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
