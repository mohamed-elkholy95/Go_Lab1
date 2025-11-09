/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        border: 'var(--border)',
        text: 'var(--text)',
        textMuted: 'var(--text-muted)',
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          subtle: 'var(--accent-subtle)',
          fg: 'var(--accent-fg)',
        },
        success: {
          DEFAULT: 'var(--success)',
          subtle: 'var(--success-subtle)',
          fg: 'var(--success-fg)',
        },
        error: {
          DEFAULT: 'var(--error)',
          subtle: 'var(--error-subtle)',
          fg: 'var(--error-fg)',
        },
        info: {
          DEFAULT: 'var(--info)',
          subtle: 'var(--info-subtle)',
          fg: 'var(--info-fg)',
        },
        focus: 'var(--focus)',
        selection: 'var(--selection)',
        // Keep primary for backwards compatibility
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '75ch',
            color: 'var(--text)',
            a: {
              color: 'var(--accent)',
              '&:hover': {
                color: 'var(--accent-hover)',
              },
            },
            h1: {
              color: 'var(--text)',
            },
            h2: {
              color: 'var(--text)',
            },
            h3: {
              color: 'var(--text)',
            },
            h4: {
              color: 'var(--text)',
            },
            code: {
              color: 'var(--text)',
              backgroundColor: 'var(--surface)',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
