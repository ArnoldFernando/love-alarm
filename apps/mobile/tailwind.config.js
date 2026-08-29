/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")], // ← missing, add this
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#e11d48",
          light: "#fb7185",
          dark: "#be123c",
        },
      },
    },
  },
  plugins: [],
};