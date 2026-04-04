import React from 'react';
import { useNavigate } from 'react-router-dom';

const footerColumns = [
  {
    heading: 'Platform',
    links: ['Assessments', 'AI Analytics', 'Clinician Portal', 'API Access'],
  },
  {
    heading: 'Resources',
    links: ['Research Papers', 'Case Studies', 'Help Center', 'Privacy Hub'],
  },
  {
    heading: 'Company',
    links: ['About Us', 'Careers', 'Contact', 'Press Kit'],
  },
];

/**
 * Reusable landing / public-page footer with multi-column link grid.
 */
export default function LandingFooter() {
  const navigate = useNavigate();

  return (
    <footer className="py-20 px-8" style={{ background: 'var(--ls-surface-container-low)' }}>
      <div
        className="grid grid-cols-2 md:grid-cols-5 gap-12 pt-16"
        style={{
          maxWidth: 'var(--ls-max-width)',
          margin: '0 auto',
          borderTop: '1px solid rgba(193,198,215,.2)',
        }}
      >
        {/* Brand column */}
        <div className="col-span-2">
          <div
            className="flex items-center gap-2 mb-6 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <span className="material-symbols-outlined text-2xl" style={{ color: 'var(--ls-primary)' }}>
              psychology
            </span>
            <span className="text-2xl font-bold tracking-tight" style={{ color: '#1e40af' }}>
            Manasveda
            </span>
          </div>
          <p className="max-w-xs mb-8" style={{ color: 'var(--ls-on-surface-variant)' }}>
            Pioneering clinical-grade AI detection to secure the future of global cognitive health.
          </p>
          <div className="flex gap-4">
            <a href="#" className="ls-icon-circle" aria-label="Email">
              <span className="material-symbols-outlined">alternate_email</span>
            </a>
            <a href="#" className="ls-icon-circle" aria-label="Share">
              <span className="material-symbols-outlined">share</span>
            </a>
          </div>
        </div>

        {/* Link columns */}
        {footerColumns.map((col) => (
          <div key={col.heading}>
            <h4 className="font-bold mb-6" style={{ color: 'var(--ls-on-background)' }}>
              {col.heading}
            </h4>
            <ul className="space-y-4 text-sm" style={{ color: 'var(--ls-on-surface-variant)' }}>
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" className="ls-link">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div
        className="mt-20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
        style={{
          maxWidth: 'var(--ls-max-width)',
          margin: '5rem auto 0',
          borderTop: '1px solid rgba(193,198,215,.1)',
          fontSize: '10px',
          color: '#94a3b8',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
        }}
      >
        <span>© 2024 Manasveda. All Rights Reserved.</span>
        <div className="flex gap-8">
          <a href="#" className="ls-link">Terms of Service</a>
          <a href="#" className="ls-link">Cookie Policy</a>
        </div>
      </div>
    </footer>
  );
}
