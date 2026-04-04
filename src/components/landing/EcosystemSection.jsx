import React from 'react';
import FeatureCard from './FeatureCard';

/**
 * "Platform Ecosystem" section — renders a grid of FeatureCards.
 * The data is hard-coded here, but the underlying FeatureCard is fully reusable.
 */
const features = [
  {
    icon: 'extension',
    variant: 'primary',
    title: 'Precision Assessments',
    description: (
      <>
        Clinically-designed games like <strong>Pattern Recognition</strong>,{' '}
        <strong>Memory Sequence</strong>, and <strong>Neuro-Reflex</strong> measure fluid
        intelligence and reaction telemetry.
      </>
    ),
    chips: [
      { icon: 'check_circle', label: 'Visual Stimuli Latency Analysis' },
      { icon: 'check_circle', label: 'Rotational Logic Testing' },
    ],
  },
  {
    icon: 'insights',
    variant: 'secondary',
    title: 'Longitudinal Analytics',
    description: (
      <>
        Deep-dive into performance trends and <strong>Cognitive Resilience Risk</strong>. Lucid AI
        maps focus, memory, and logic across a 6-month vitality horizon.
      </>
    ),
    chips: [
      { icon: 'monitoring', label: 'Trend tracking across 30+ markers' },
      { icon: 'monitoring', label: 'Domain Mastery Spider-mapping' },
    ],
  },
  {
    icon: 'forum',
    variant: 'tertiary',
    title: 'Tailored Insight Chat',
    description: (
      <>
        Engage with <strong>Lucid AI Assistant</strong> for contextual feedback. Receive recovery
        plans based on sleep telemetry and daily cognitive fluctuations.
      </>
    ),
    chips: [
      { icon: 'auto_awesome', label: 'Instant Correlation Summaries' },
      { icon: 'auto_awesome', label: 'Personalized Lifestyle Suggestions' },
    ],
  },
];

export default function EcosystemSection() {
  return (
    <section id="platform" className="py-24" style={{ background: '#ffffff' }}>
      <div style={{ maxWidth: 'var(--ls-max-width)', margin: '0 auto', padding: '0 2rem' }}>
        {/* Header */}
        <div className="text-center mb-20">
          <span
            className="block text-xs font-bold uppercase mb-4"
            style={{ color: 'var(--ls-primary)', letterSpacing: '0.2em' }}
          >
            The Ecosystem
          </span>
          <h2 className="text-3xl md:text-5xl font-bold" style={{ color: 'var(--ls-on-background)' }}>
            A Comprehensive Care Framework
          </h2>
          <p
            className="max-w-2xl mx-auto mt-4"
            style={{ color: 'var(--ls-on-surface-variant)' }}
          >
            We combine clinical rigour with intuitive technology to provide a 360° view of your
            brain health.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={f.title} className={`ls-delay-${i + 1}`}>
              <FeatureCard {...f} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
