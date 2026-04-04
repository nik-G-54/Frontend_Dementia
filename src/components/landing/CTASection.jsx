import React from 'react';

/**
 * Final call-to-action banner.
 * @param {function} onStartTest – fires when the main CTA button is clicked.
 */
export default function CTASection({ onStartTest }) {
  return (
    <section className="py-32 relative overflow-hidden text-center" style={{ background: '#ffffff' }}>
      <div
        className="relative z-10 px-8"
        style={{ maxWidth: 'var(--ls-max-width)', margin: '0 auto' }}
      >
        <h2
          className="text-4xl md:text-6xl font-bold mb-8 tracking-tight ls-animate-fade-up"
          style={{ color: 'var(--ls-on-background)' }}
        >
          Invest in Your Cognitive Future.
        </h2>
        <p
          className="text-xl mb-12 max-w-2xl mx-auto ls-animate-fade-up ls-delay-1"
          style={{ color: 'var(--ls-on-surface-variant)' }}
        >
          Join a community of proactive individuals dedicated to maintaining lifelong mental vitality.
        </p>

        <div className="flex flex-col md:flex-row justify-center gap-6 items-center ls-animate-fade-up ls-delay-2">
          <button
            className="ls-btn ls-btn-primary text-xl px-12 py-5"
            style={{ boxShadow: 'var(--ls-shadow-xl)' }}
            onClick={onStartTest}
          >
            Start Cognitive Test
          </button>
          <div className="flex items-center gap-2 font-medium" style={{ color: 'var(--ls-on-surface-variant)' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--ls-secondary)' }}>
              verified
            </span>
            No credit card required for initial screening.
          </div>
        </div>
      </div>

      {/* Decorative blobs */}
      <div
        className="ls-blob"
        style={{
          width: '24rem', height: '24rem',
          bottom: '-10rem', left: '-10rem',
          background: 'rgba(0,88,191,.05)',
          filter: 'blur(100px)',
        }}
      />
      <div
        className="ls-blob"
        style={{
          width: '24rem', height: '24rem',
          top: '-10rem', right: '-10rem',
          background: 'rgba(0,106,97,.05)',
          filter: 'blur(100px)',
        }}
      />
    </section>
  );
}
