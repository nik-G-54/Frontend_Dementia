import React from 'react';

const steps = [
  {
    num: 1,
    title: 'Engage in Assessments',
    desc: 'Perform 5-minute digital checkups through immersive, low-stress cognitive games designed by neuroscientists.',
  },
  {
    num: 2,
    title: 'Advanced AI Analysis',
    desc: 'Lucid AI processes millions of data points to identify subtle behavioral changes before symptoms even appear.',
  },
  {
    num: 3,
    title: 'Continuous Improvement',
    desc: 'Receive personalized recovery protocols and lifestyle adjustments to optimize your brain\'s resilience every day.',
  },
];

/**
 * "Your Path to Cognitive Clarity" — numbered steps + dashboard insight mockup.
 */
export default function JourneySection() {
  return (
    <section id="science" className="py-24" style={{ background: 'var(--ls-surface-container-low)' }}>
      <div
        style={{ maxWidth: 'var(--ls-max-width)', margin: '0 auto', padding: '0 2rem' }}
        className="grid lg:grid-cols-2 gap-16 items-center"
      >
        {/* Left: Steps */}
        <div className="ls-animate-fade-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-8" style={{ color: 'var(--ls-on-background)' }}>
            Your Path to Cognitive Clarity
          </h2>
          <p className="text-lg mb-12" style={{ color: 'var(--ls-on-surface-variant)' }}>
            We've streamlined the journey from clinical data to life-enhancing improvements. No
            complex medical jargon — just clarity.
          </p>

          <div className="flex flex-col gap-10">
            {steps.map((s) => (
              <div key={s.num} className="flex gap-6">
                <div className={`ls-step-circle ls-step-circle--${s.num}`}>{s.num}</div>
                <div>
                  <h4 className="text-xl font-bold mb-2" style={{ color: 'var(--ls-on-surface)' }}>
                    {s.title}
                  </h4>
                  <p style={{ color: 'var(--ls-on-surface-variant)' }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Dashboard Preview */}
        <div className="relative ls-animate-fade-up ls-delay-2">
          <div
            className="p-8"
            style={{
              background: '#ffffff',
              borderRadius: 'var(--ls-radius-2xl)',
              boxShadow: 'var(--ls-shadow-xl)',
              border: '1px solid rgba(193,198,215,.1)',
            }}
          >
            <div className="flex items-center justify-between mb-8">
              <h5 className="font-bold" style={{ color: 'var(--ls-on-surface)' }}>
                Dashboard Insight
              </h5>
              <span
                className="text-xs font-bold uppercase"
                style={{ color: 'var(--ls-secondary)', letterSpacing: '0.15em' }}
              >
                Low Risk
              </span>
            </div>

            {/* SVG mini chart */}
            <div
              className="relative overflow-hidden flex items-end"
              style={{
                height: '12rem',
                borderRadius: 'var(--ls-radius)',
                background: 'var(--ls-surface-container-low)',
              }}
            >
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 200">
                <path
                  d="M0,150 Q100,120 200,160 T400,80 T600,100 T800,40"
                  fill="none"
                  stroke="var(--ls-primary)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
              <div
                className="flex justify-between w-full p-4 text-[10px] font-bold uppercase"
                style={{ color: 'var(--ls-on-surface-variant)', letterSpacing: '-0.02em' }}
              >
                <span>Baseline</span>
                <span>Week 2</span>
                <span>Week 4</span>
                <span>Current</span>
              </div>
            </div>

            {/* Insight tip */}
            <div
              className="mt-8 p-4 flex items-center gap-4 ls-glass"
              style={{ borderRadius: 'var(--ls-radius-sm)' }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{
                  background: 'rgba(75,65,225,.1)',
                  color: 'var(--ls-tertiary)',
                }}
              >
                <span className="material-symbols-outlined">lightbulb</span>
              </div>
              <p className="text-xs font-medium" style={{ color: 'var(--ls-on-surface-variant)' }}>
                Cognitive speed increased by 5% in the last 14 days following your hydration protocol.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
