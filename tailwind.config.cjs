// tailwind.config.cjs
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.html", "./public/**/*.js"],
  presets: [require("./tailwind-preset-yensao.cjs")],
  theme: { extend: {} },
  plugins: []
};
