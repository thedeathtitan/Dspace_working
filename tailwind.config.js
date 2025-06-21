/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#F1F5F9',
        },
        surface: '#FFFFFF',
        separator: '#F3F4F6',
        accent: '#A6D0FF',
        text: {
          primary: '#1C1C1E',
          secondary: '#6E6E73',
        },
        // Legacy colors for backward compatibility
        diagnosis: '#007AFF',      // Apple blue
        differential: '#34C759',   // Apple green
        action: '#FF9500',         // Apple orange
        completed: '#4ade80',      // Light green
      },
      fontFamily: {
        sans: ['"SF Pro"', '"SF Pro Display"', '-apple-system', 'BlinkMacSystemFont', 'ui-sans-serif', 'system-ui'],
      },
      borderRadius: {
        DEFAULT: '16px',
        'lg': '20px',
        'xl': '24px',
        '2xl': '32px',
      },
      boxShadow: {
        elevation: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        'elevation-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      },
      letterSpacing: {
        tight: '-0.2px',
      },
      fontSize: {
        'title-large': ['34px', { lineHeight: '120%' }],
        'title-1': ['28px', { lineHeight: '120%' }],
        'title-2': ['22px', { lineHeight: '120%' }],
        'title-3': ['17px', { lineHeight: '120%' }],
        'body': ['15px', { lineHeight: '120%', letterSpacing: '-0.2px' }],
        'caption': ['13px', { lineHeight: '120%' }],
      },
      transitionTimingFunction: {
        'apple': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      transitionDuration: {
        'apple': '120ms',
      },
    },
  },
  plugins: [],
}