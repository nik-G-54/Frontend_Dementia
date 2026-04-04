import React from 'react';

/**
 * Full-width hero section with headline, subtitle, dual CTAs, social proof,
 * and a decorative image panel.  Accepts callback props so the parent page
 * can wire up navigation.
 */
export default function HeroSection({ onStartAssessment, onLearnMore }) {
  return (
    <section className="relative min-h-[90vh] flex items-center px-6 md:px-24 overflow-hidden ls-hero-gradient">
      <div
        className="grid lg:grid-cols-2 gap-16 items-center z-10 w-full"
        style={{ maxWidth: 'var(--ls-max-width)', margin: '0 auto' }}
      >
        {/* ---- Left: Copy ---- */}
        <div className="max-w-2xl ls-animate-fade-up">
          <span className="ls-badge mb-8 inline-block">The Gold Standard in Cognitive Care</span>

          <h1
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-8"
            style={{ lineHeight: 1.05, color: 'var(--ls-on-background)' }}
          >
            Pioneering Early{' '}
            <span
              style={{
                backgroundImage: `linear-gradient(135deg, var(--ls-primary), var(--ls-secondary))`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Dementia Detection
            </span>
          </h1>

          <p
            className="text-lg md:text-xl mb-10 leading-relaxed max-w-lg"
            style={{ color: 'var(--ls-on-surface-variant)' }}
          >
            Lucid Sanctuary utilizes clinically-validated AI to transform behavioral markers into
            actionable neurological insights. Experience the future of proactive brain health
            management.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <button className="ls-btn ls-btn-primary" onClick={onStartAssessment}>
              Start Your Assessment
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </button>
            <button className="ls-btn ls-btn-secondary" onClick={onLearnMore}>
              Clinical Research
            </button>
          </div>

          {/* Social Proof */}
          <div className="mt-12 flex items-center gap-6">
            <div className="flex -space-x-3">
              <img
                alt="User"
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRuHQGVnDhuLKKqh9wtq2DZTToxCxd4gU_RzUhDlGtYdxz2KnCLk6yH0P1YeBqK8KRIMwnPQgmpg4WMelzsJPd0yAt0urmFzkFkxoyR6e1P443k_fikFEFqZ-mer7LgBXpOcJX0WHUt0IBO4IlYjyNYLePD4riW_DgpOyqKrQFAG0Kj6INvk_Idv6eE4CAtUXarm-PLvXlTxP-leK6WWwq7x-gyIN26mzQ4C1wqE6HYQoYK8oay2onXXHfDasDhiEYmb9R6ZgOchg"
              />
              <img
                alt="User"
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGAM7DoKVOr5-O-JEp4s5lv0NPS0SyXrG4pxmKPPDH5JIXpbF7SDgnt2BNzorErljLnN0IAkHxEol6TKGg8r8-KX6JwF_uPP1ykmHL9MzVLRmpSId_nmXjD20LFIOLhUzXE4iuL2aL3M62G__iSZFVOHHQl3Mlf7VsAHpCQc8Kt3ILHgJ5wlkXOGpxCRSE9v8t_Xn_H7wE-G2d37nRMwhvgqFuIlupGCgWg6CqfpnUQHfd7rM-to2yXwlMKgAMvd5Sd7f1TEFrEq0"
              />
              <div
                className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold"
                style={{ background: 'var(--ls-secondary-container, #86f2e4)', color: '#006f66' }}
              >
                +50k
              </div>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--ls-on-surface-variant)' }}>
              Trusted by users &amp; neurological professionals worldwide.
            </p>
          </div>
        </div>

        {/* ---- Right: Visual ---- */}
        <div className="relative hidden lg:block ls-animate-fade-up ls-delay-2">
          <div
            className="w-full rounded-3xl overflow-hidden relative shadow-2xl"
            style={{ aspectRatio: '4/5', border: '8px solid white' }}
          >
            <img
              alt="Brain visualization"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4kdB2J-s_487FxeAaOGNwulWqSjUUhQXWXBW0hwyrho6qSRZy6JGJKEDxxmwOunCpq-eCEXocWkbNW_B7PKlFAkH9S-o32KqB1041z1vOfwwe97-gZXp5ExN5Ta28Y2dgj0qrlc-zn_fNjTwi_h1zX4jTetpimrPDcCFWigApwNE-AjSSj35TMlZdyG2vkqH0roSX13_w27NjlrrhrRgErSqczUBxFOh8LaOnswp3SXceiGeDcUZusX-tb6jBII30nN2QXVVIuYw"
            />
            {/* Floating glass card */}
            <div className="absolute bottom-8 left-8 right-8 ls-glass p-6 rounded-2xl" style={{ boxShadow: 'var(--ls-shadow-xl)' }}>
              <div className="flex items-start gap-4">
                <div
                  className="p-3 rounded-xl text-white"
                  style={{ background: 'var(--ls-primary)' }}
                >
                  <span className="material-symbols-outlined">auto_awesome</span>
                </div>
                <div>
                  <h4 className="font-bold" style={{ color: 'var(--ls-on-surface)' }}>
                    Cognitive Baseline Set
                  </h4>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--ls-on-surface-variant)' }}>
                    AI detected a 4% clarity increase in your spatial reasoning patterns since last
                    week's baseline assessment.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative blobs */}
          <div
            className="ls-blob"
            style={{
              width: '10rem', height: '10rem',
              top: '-2.5rem', left: '-2.5rem',
              background: 'rgba(0,106,97,.10)',
            }}
          />
          <div
            className="ls-blob"
            style={{
              width: '15rem', height: '15rem',
              bottom: '-2.5rem', right: '-2.5rem',
              background: 'rgba(0,88,191,.10)',
            }}
          />
        </div>
      </div>
    </section>
  );
}
