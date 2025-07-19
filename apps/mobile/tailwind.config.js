/** @type {import('tailwindcss').Config} */
// tailwind.config.js
module.exports = {
    content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
    presets: [require('nativewind/preset')],
    theme: {
        extend: {
            // ===== New Color Palette =====
            colors: {
                lavender: '#AE8DE2', // Soft lavender
                peach: '#F9D3CA', // Warm peach
                accent: '#9C71DF', // Slightly darker lavender for accents
                text: '#4A5568', // Soft gray for text
                muted: '#718096', // Muted gray for secondary text
            },

            // ===== Gradient Background =====
            backgroundImage: {
                'pastel-gradient': 'linear-to-b from-purple-500 to-tint-500',
            },

            // ===== Typography =====
            fontFamily: {
                nunito: ['Nunito', 'sans-serif'], // Geist font for headings
                abel: ['Abel', 'serif'], // Geist Mono for code snippets
                sans: ['Inter', 'system-ui'], // Clean modern font
                serif: ['Lora', 'serif'], // For dream interpretations
            },

            // ===== Spacing & Shadows =====
            spacing: {
                0.5: '2px',
                1.5: '6px',
                2.5: '10px',
            },
            boxShadow: {
                soft: '0 4px 24px rgba(167, 139, 250, 0.1)', // Soft lavender shadow
            },
        },
    },
    // ===== Dark Mode (default) =====
    darkMode: 'class', // Use class-based dark mode (for consistency)
    plugins: [
        // Custom plugin for gradient backgrounds
        function ({ addUtilities }) {
            addUtilities({
                '.bg-dream-gradient': {
                    background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)',
                },
                '.text-gradient': {
                    background: 'linear-gradient(45deg, #6366F1 0%, #A855F7 100%)',
                    '-webkit-background-clip': 'text',
                    '-webkit-text-fill-color': 'transparent',
                },
            });
        },
    ],
};
