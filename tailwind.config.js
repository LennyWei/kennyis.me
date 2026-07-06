

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [ // optimize for production by only including files that use tailwind classes
        "./app/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./lib/**/*.{js,ts,jsx,tsx}",
    ],

    theme:
    {
        extend: {
            fontFamily:
            {
                sans: ["Rubik", "Arial", "Helvetica", "sans-serif"],
            },
        }
    }

}