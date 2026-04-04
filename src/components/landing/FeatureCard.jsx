import React from 'react';

/**
 * Reusable feature / ecosystem card.
 *
 * @param {string}   icon      - Material Symbols Outlined icon name
 * @param {string}   variant   - 'primary' | 'secondary' | 'tertiary'
 * @param {string}   title     - Card heading
 * @param {React.ReactNode} description - Rich description (can include <span> highlights)
 * @param {Array}    chips     - Array of { icon, label } objects
 */
export default function FeatureCard({ icon, variant = 'primary', title, description, chips = [] }) {
  return (
    <div className="ls-card ls-animate-fade-up">
      <div className={`ls-card-icon ls-card-icon--${variant}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>

      <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--ls-on-surface)' }}>
        {title}
      </h3>

      <p
        className="text-sm leading-relaxed mb-8"
        style={{ color: 'var(--ls-on-surface-variant)' }}
      >
        {description}
      </p>

      {chips.length > 0 && (
        <div className="flex flex-col gap-3">
          {chips.map((c, i) => (
            <div key={i} className={`ls-chip ls-chip--${variant}`}>
              <span className="material-symbols-outlined text-sm">{c.icon}</span>
              {c.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
