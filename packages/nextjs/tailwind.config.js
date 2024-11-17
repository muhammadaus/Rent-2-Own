// eslint-disable-next-line @typescript-eslint/no-var-requires
const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./utils/**/*.{js,ts,jsx,tsx}"],
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".bg-texture": {
          backgroundSize: "auto", // Default size
          backgroundRepeat: "repeat", // Ensure texture repeats
          backgroundPosition: "top left", // Optional for alignment
        },
      });
    }),
    require("daisyui"),
  ],
  darkTheme: "forest",
  darkMode: ["selector", "[data-theme='forest']"],
  // DaisyUI theme colors
  daisyui: {
    themes: [
      {
        pastel: {
          primary: "#F4B183", // Matte light orange (soft terracotta)
          "primary-content": "#2D2D2D", // Dark gray for contrast
          secondary: "#F7D7B4", // Muted peach for a secondary tone
          "secondary-content": "#2D2D2D",
          accent: "#F3C29B", // Subtle variation of light orange
          "accent-content": "#2D2D2D",
          neutral: "#F9E8D8", // Warm matte beige for neutral backgrounds
          "neutral-content": "#2D2D2D",
          "base-100": "#FFF9F3", // Light off-white
          "base-200": "#F9E8D8", // Slightly darker beige
          "base-300": "#F7D7B4", // Warm peach tone
          "base-content": "#2D2D2D", // Dark for readable text
          info: "#F8CBAE", // Muted light orange for informational elements
          success: "#B7D6A5", // Soft green for success
          warning: "#E7C86B", // Warm matte gold for warnings
          error: "#D79B8B", // Muted matte coral for errors

          "--rounded-btn": "0.5rem", // Subtle rounding for buttons

          ".tooltip": {
            "--tooltip-tail": "4px",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "85%",
          },
        },
      },
      {
        forest: {
          primary: "#4A5A50", // Matte dark green (deep olive green)
          "primary-content": "#E7EAE5", // Light for contrast
          secondary: "#6C7A6F", // Muted moss green
          "secondary-content": "#E7EAE5",
          accent: "#5D7168", // Subtle mid-tone green
          "accent-content": "#E7EAE5",
          neutral: "#39473E", // Darker matte green-gray for neutral backgrounds
          "neutral-content": "#D7E0D9",
          "base-100": "#39473E", // Dark matte olive
          "base-200": "#2E3B34", // Slightly darker tone
          "base-300": "#1E2722", // Very dark green-gray
          "base-content": "#D7E0D9", // Light green-gray for text
          info: "#5D7168", // Muted dark green for informational elements
          success: "#81A784", // Subtle moss green for success
          warning: "#C9B574", // Matte gold-green for warnings
          error: "#A76D66", // Muted brick-red for errors

          "--rounded-btn": "0.5rem", // Subtle rounding for buttons

          ".tooltip": {
            "--tooltip-tail": "4px",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "85%",
          },
        },
      },
    ],
  },
  theme: {
    extend: {
      boxShadow: {
        center: "0 0 12px -2px rgb(0 0 0 / 0.05)",
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      colors: {
        zinc: {
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#71717a",
          600: "#52525b",
          700: "#3f3f46",
          800: "#27272a",
          900: "#18181b",
        },
      },
      backgroundImage: {
        "forest-texture": "url('/textures/forest-branches.svg')",
        "pastel-texture": "url('/textures/pastel-leaves.svg')",
      },
    },
  },
};
