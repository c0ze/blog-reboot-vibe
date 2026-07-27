import typography from '@tailwindcss/typography';

/**
 * "The Weekly Page" — see DESIGN.md.
 * Two families and no third; radius 0; no shadow scale at all. The colour
 * names are the same contract src/styles/global.css publishes per rendition,
 * so `@apply bg-card` and the `prose-*` chain keep resolving.
 */

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["variant", [".beta &", ".beta-hc &"]],
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1480px",
      },
    },
    extend: {
      fontFamily: {
        // Gothic for titling and dialogue, mincho for narration: the actual
        // manga convention. Both faces carry full CJK and real Latin — but
        // neither ships ğ/ş/İ, so the stacks name a Turkish-capable fallback
        // rather than letting the browser pick one.
        display: ['"Zen Kaku Gothic New"', '"Helvetica Neue"', 'Arial', '"Hiragino Kaku Gothic ProN"', '"Noto Sans JP"', 'system-ui', 'sans-serif'],
        sans: ['"Zen Kaku Gothic New"', '"Helvetica Neue"', 'Arial', '"Hiragino Kaku Gothic ProN"', '"Noto Sans JP"', 'system-ui', 'sans-serif'],
        serif: ['"Zen Old Mincho"', '"Times New Roman"', 'Times', '"Hiragino Mincho ProN"', '"Yu Mincho"', '"Noto Serif JP"', 'serif'],
        // Not a third brand family: the platform's own mono, for code only.
        mono: ['ui-monospace', 'SFMono-Regular', '"SF Mono"', 'Menlo', 'Consolas', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          ink: "hsl(var(--accent-ink))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      // The Flat Ink Rule: no elevation anywhere, in any state.
      boxShadow: {
        none: "none",
      },
      // Radius is 0. A printed panel has no radius.
      borderRadius: {
        none: "0px",
        sm: "0px",
        DEFAULT: "0px",
        md: "0px",
        lg: "0px",
        xl: "0px",
        "2xl": "0px",
        "3xl": "0px",
        full: "0px",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'var(--ink)',
            fontFamily: 'var(--mincho)',
            fontSize: '1.0625rem',
            lineHeight: '1.75',
            '--tw-prose-bullets': 'var(--trim)',
            '--tw-prose-counters': 'var(--ink-grey)',
            a: {
              color: 'var(--ink)',
              fontWeight: '400',
              textDecoration: 'underline',
              textDecorationColor: 'var(--trim)',
              textDecorationThickness: '1px',
              textUnderlineOffset: '0.18em',
              '&:hover': {
                textDecorationColor: 'var(--ink)',
                textDecorationThickness: '2px',
              },
            },
            strong: { color: 'var(--ink)', fontWeight: '700' },
            'h1, h2, h3, h4, h5, h6': {
              fontFamily: 'var(--gothic)',
              color: 'var(--ink)',
              letterSpacing: '-0.01em',
            },
            h2: { fontSize: '1.5rem', fontWeight: '700', lineHeight: '1.15' },
            h3: { fontSize: '1.15rem', fontWeight: '700', lineHeight: '1.2' },
            h4: { fontSize: '1rem', fontWeight: '700' },
            code: {
              color: 'var(--ink)',
              fontWeight: '400',
              fontSize: '0.875em',
              background: 'var(--pulp-deep)',
              padding: '0.1em 0.32em',
              borderRadius: '0',
            },
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            pre: {
              color: 'var(--ink)',
              background: 'var(--pulp-deep)',
              border: '1px solid var(--trim)',
              borderRadius: '0',
              fontSize: '0.8125rem',
              lineHeight: '1.6',
            },
            'pre code': { background: 'transparent', padding: '0' },
            blockquote: {
              color: 'var(--ink)',
              fontStyle: 'normal',
              fontWeight: '400',
              borderLeftWidth: '2px',
              borderLeftColor: 'var(--ink)',
              paddingLeft: '1rem',
            },
            'blockquote p:first-of-type::before': { content: '""' },
            'blockquote p:last-of-type::after': { content: '""' },
            hr: { borderColor: 'var(--trim)', borderTopWidth: '1px' },
            'ol > li::marker': { color: 'var(--ink-grey)' },
            'ul > li::marker': { color: 'var(--trim)' },
            table: { fontSize: '0.9rem' },
            'thead th': {
              fontFamily: 'var(--gothic)',
              fontWeight: '700',
              color: 'var(--ink)',
              borderBottomColor: 'var(--ink)',
            },
            'tbody tr': { borderBottomColor: 'var(--trim)' },
            figcaption: {
              fontFamily: 'var(--gothic)',
              fontSize: '0.7rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--ink-grey)',
            },
            img: { borderRadius: '0' },
          },
        },
      },
    },
  },
  plugins: [typography],
};
