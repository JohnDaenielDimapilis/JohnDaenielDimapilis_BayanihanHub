/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bayani: {
          ink: "#122033",
          blue: "#2563eb",
          green: "#1f9d73",
          warm: "#f59e0b",
          cream: "#fff8ec",
          mist: "#eef7f3"
        }
      },
      fontFamily: {
        display: ["Manrope", "ui-sans-serif", "sans-serif"],
        body: ["Nunito Sans", "ui-sans-serif", "sans-serif"]
      },
      boxShadow: {
        soft: "0 20px 60px -30px rgba(18, 32, 51, 0.35)"
      }
    }
  },
  plugins: []
};
