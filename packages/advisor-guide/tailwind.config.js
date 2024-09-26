import typography from "@tailwindcss/typography";
import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{ts,css,html,svelte}"],
    theme: {
        extend: {},
    },
    plugins: [daisyui, typography],
};
