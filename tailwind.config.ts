import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        kalcer: {
          50: "#eef5ff",
          100: "#d9e8ff",
          200: "#bcd7ff",
          300: "#8ebeff",
          400: "#599bff",
          500: "#1d6ff2",
          600: "#024aad", // Exact Studio Kalcer Logo Cobalt Blue
          700: "#023b8a",
          800: "#052e6b",
          900: "#071d42",
          950: "#040d1f",
        },
        primary: {
          50: "#eef5ff",
          100: "#d9e8ff",
          500: "#1d6ff2",
          600: "#024aad",
          700: "#023b8a",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
