// tailwind-preset-yensao.cjs
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        ivory: "#F8F5EF",
        gold: "#C8A15A",
        espresso: "#4B3A2B",
        text: "#1D1D1F",
        muted: "#8E8E93",
        success: "#8FBF6F",
      },
      fontFamily: {
        heading: ['"Lora"', "serif"],
        body: ['"Be Vietnam Pro"', "system-ui", "Arial", "sans-serif"],
      },
      borderRadius: {
        xl: "16px",
        lg: "10px",
      },
      boxShadow: {
        sm: "0 2px 6px rgba(0,0,0,.08)",
        DEFAULT: "0 8px 24px rgba(0,0,0,.12)",
      }
    }
  }
};
