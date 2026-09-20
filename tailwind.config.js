/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tartan: {
          navy: "#0C1B33",
          dark: "#070E1B",
          card: "#112240",
          accent: "#D4AF37",
          gold: "#F3C954",
          goldLight: "#FDE68A",
          red: "#991B1B",
          green: "#065F46",
          border: "#1E3A8A",
          slate: "#334155",
          muted: "#94A3B8"
        }
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      backgroundImage: {
        'tartan-pattern': "radial-gradient(ellipse at top, #112240, #070E1B)",
        'gold-gradient': "linear-gradient(135deg, #D4AF37 0%, #F3C954 50%, #B89726 100%)",
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}

