/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // We're using Poppins as the primary font for its clean, professional look
        sans: ['"Google Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // A professional, dark-mode-first color palette
        "brand-dark": "#121212", // Very dark gray, almost black
        "brand-light-dark": "#1E1E1E", // Lighter dark for cards
        "brand-gray": "#282828", // Even lighter gray for accents
        "brand-text": "#FFFFFF",
        "brand-text-secondary": "#B3B3B3",
        "brand-green": "#1DB954", // Spotify-like green
      },
      keyframes: {
        fall: {
          "0%": { transform: "translateY(0) translateX(0)" },
          "100%": { transform: "translateY(110vh) translateX(50px)" },
        },
      }
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
