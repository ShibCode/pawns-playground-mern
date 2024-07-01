/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "tile-green": "#739552",
        "tile-peach": "#EBECD0",
        "tile-picked": "#B9CA42",
      },
      width: {
        tile: "var(--tile-size)",
      },
      height: {
        tile: "var(--tile-size)",
      },
    },
  },
  plugins: [],
};
