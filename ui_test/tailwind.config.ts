import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  safelist: [
    // Safelist dynamic opacity values
    'bg-primary/20',
    'bg-primary/30',
    'bg-primary/50',
    'bg-primary/90',
    'bg-card/30',
    'bg-card/50',
    'bg-background/50',
    'bg-background/80',
    'border-border/40',
    'border-border/50',
    'border-border/60',
    'text-primary-foreground/50',
    'text-muted-foreground/70',
    'text-muted-foreground/80',
    'text-foreground/80',
    // Panel background colors
    'bg-blue-50/50',
    'bg-purple-50/50',
    'bg-emerald-50/50',
    'bg-amber-50/50',
    'bg-slate-50/50',
    // Dark mode panel backgrounds
    'dark:bg-blue-950/20',
    'dark:bg-purple-950/20',
    'dark:bg-emerald-950/20',
    'dark:bg-amber-950/20',
    'dark:bg-slate-950/20',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },

        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },

        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Add Tailwind's default blue colors for explicit usage
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },

        emerald: {
          50: '#ecfdf5',
          200: '#a7f3d0',
          700: '#047857',
          900: '#064e3b',
          950: '#022c22',
        },

        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
    },
  },
  plugins: [],
} satisfies Config;
