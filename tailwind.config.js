/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vc-primary': 'var(--color-vc-primary)',
        'vc-on-primary': 'var(--color-vc-on-primary)',
        'vc-ink': 'var(--color-vc-ink)',
        'vc-body': 'var(--color-vc-body)',
        'vc-mute': 'var(--color-vc-mute)',
        'vc-hairline': 'var(--color-vc-hairline)',
        'vc-hairline-strong': 'var(--color-vc-hairline-strong)',
        'vc-canvas': 'var(--color-vc-canvas)',
        'vc-canvas-soft': 'var(--color-vc-canvas-soft)',
        'vc-canvas-soft-2': 'var(--color-vc-canvas-soft-2)',
        'vc-link': 'var(--color-vc-link)',
        'vc-success': 'var(--color-vc-success)',
        'vc-error': 'var(--color-vc-error)',
      }
    },
  },
  plugins: [],
}

