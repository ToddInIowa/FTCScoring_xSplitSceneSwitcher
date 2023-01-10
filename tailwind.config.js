/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["*.html","js/*.js"],
  theme: {
    extend: {},
    container: {
      center: true,
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
  ],
}
