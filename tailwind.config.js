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
        stagecoach: {
          blue: "#002D62",
          navy: "#0A192F",
          darkblue: "#0B2545",
          orange: "#E65100",
          amber: "#FF6600",
          yellow: "#F59E0B",
          red: "#D32F2F",
          light: "#F8FAFC",
        }
      }
    },
  },
  plugins: [],
}
