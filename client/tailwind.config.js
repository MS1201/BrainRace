/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            keyframes: {
                moveRoad: {
                    from: { transform: 'translateY(-50%)' },
                    to: { transform: 'translateY(0)' },
                }
            },
            animation: {
                moveRoad: 'moveRoad 0.5s linear infinite',
            }
        },
    },
    plugins: [],
}
