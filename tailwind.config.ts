import type { Config } from 'tailwindcss'

/**
 * Theme tokens extracted verbatim from the Google Stitch export
 * ("Obsidian Violet Precision"). Do not hand-edit colour or type values:
 * re-export from Stitch and regenerate instead so the visual design stays intact.
 */
const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
  "colors": {
    "surface-container-lowest": "#0b0e17",
    "on-secondary-container": "#00311f",
    "surface-variant": "#32343f",
    "on-primary-fixed": "#23005c",
    "on-primary-container": "#340080",
    "inverse-surface": "#e0e2ef",
    "on-tertiary-container": "#400071",
    "tertiary-container": "#b76dff",
    "secondary-fixed": "#6ffbbe",
    "surface-container-highest": "#32343f",
    "surface-container": "#1c1f29",
    "outline": "#958ea0",
    "primary-fixed": "#e9ddff",
    "outline-variant": "#494454",
    "background": "#10131c",
    "surface": "#10131c",
    "on-secondary-fixed": "#002113",
    "on-secondary": "#003824",
    "inverse-primary": "#6d3bd7",
    "secondary-container": "#00a572",
    "on-tertiary-fixed-variant": "#6900b3",
    "tertiary-fixed-dim": "#ddb7ff",
    "error": "#ffb4ab",
    "on-error-container": "#ffdad6",
    "tertiary-fixed": "#f0dbff",
    "primary-container": "#a078ff",
    "on-primary-fixed-variant": "#5516be",
    "surface-container-high": "#272a34",
    "error-container": "#93000a",
    "on-tertiary": "#490080",
    "surface-bright": "#363943",
    "secondary": "#4edea3",
    "on-error": "#690005",
    "inverse-on-surface": "#2d303a",
    "on-surface-variant": "#cbc3d7",
    "surface-container-low": "#181b25",
    "surface-tint": "#d0bcff",
    "on-secondary-fixed-variant": "#005236",
    "secondary-fixed-dim": "#4edea3",
    "on-primary": "#3c0091",
    "on-tertiary-fixed": "#2c0051",
    "primary": "#d0bcff",
    "on-surface": "#e0e2ef",
    "primary-fixed-dim": "#d0bcff",
    "surface-dim": "#10131c",
    "tertiary": "#ddb7ff",
    "on-background": "#e0e2ef"
  },
  "borderRadius": {
    "DEFAULT": "0.25rem",
    "lg": "0.5rem",
    "xl": "0.75rem",
    "full": "9999px"
  },
  "spacing": {
    "gutter-mobile": "1rem",
    "gutter": "1.5rem",
    "space-md": "1rem",
    "space-sm": "0.5rem",
    "margin": "2rem",
    "space-xl": "2.5rem",
    "margin-mobile": "1rem",
    "space-lg": "1.5rem",
    "space-xs": "0.25rem"
  },
  "fontFamily": {
    "body-lg": [
      "Plus Jakarta Sans",
      "ui-sans-serif",
      "system-ui",
      "sans-serif"
    ],
    "headline-lg-mobile": [
      "Plus Jakarta Sans",
      "ui-sans-serif",
      "system-ui",
      "sans-serif"
    ],
    "headline-xl-mobile": [
      "Plus Jakarta Sans",
      "ui-sans-serif",
      "system-ui",
      "sans-serif"
    ],
    "label-badge": [
      "Space Grotesk",
      "ui-sans-serif",
      "system-ui",
      "sans-serif"
    ],
    "label-data-lg": [
      "Space Grotesk",
      "ui-sans-serif",
      "system-ui",
      "sans-serif"
    ],
    "body-md": [
      "Plus Jakarta Sans",
      "ui-sans-serif",
      "system-ui",
      "sans-serif"
    ],
    "headline-xl": [
      "Plus Jakarta Sans",
      "ui-sans-serif",
      "system-ui",
      "sans-serif"
    ],
    "disclaimer-legal": [
      "Plus Jakarta Sans",
      "ui-sans-serif",
      "system-ui",
      "sans-serif"
    ],
    "label-data-md": [
      "Space Grotesk",
      "ui-sans-serif",
      "system-ui",
      "sans-serif"
    ],
    "body-sm": [
      "Plus Jakarta Sans",
      "ui-sans-serif",
      "system-ui",
      "sans-serif"
    ],
    "headline-lg": [
      "Plus Jakarta Sans",
      "ui-sans-serif",
      "system-ui",
      "sans-serif"
    ],
    "headline-sm": [
      "Plus Jakarta Sans",
      "ui-sans-serif",
      "system-ui",
      "sans-serif"
    ],
    "headline-md": [
      "Plus Jakarta Sans",
      "ui-sans-serif",
      "system-ui",
      "sans-serif"
    ],
    "sans": [
      "Plus Jakarta Sans",
      "ui-sans-serif",
      "system-ui",
      "sans-serif"
    ],
    "mono": [
      "Space Grotesk",
      "ui-monospace",
      "SFMono-Regular",
      "Menlo",
      "monospace"
    ]
  },
  "fontSize": {
    "body-lg": [
      "18px",
      {
        "lineHeight": "28px",
        "fontWeight": "400"
      }
    ],
    "headline-lg-mobile": [
      "26px",
      {
        "lineHeight": "34px",
        "letterSpacing": "-0.01em",
        "fontWeight": "700"
      }
    ],
    "headline-xl-mobile": [
      "32px",
      {
        "lineHeight": "40px",
        "letterSpacing": "-0.015em",
        "fontWeight": "700"
      }
    ],
    "label-badge": [
      "11px",
      {
        "lineHeight": "14px",
        "letterSpacing": "0.06em",
        "fontWeight": "700"
      }
    ],
    "label-data-lg": [
      "16px",
      {
        "lineHeight": "20px",
        "letterSpacing": "0.02em",
        "fontWeight": "600"
      }
    ],
    "body-md": [
      "15px",
      {
        "lineHeight": "24px",
        "fontWeight": "400"
      }
    ],
    "headline-xl": [
      "48px",
      {
        "lineHeight": "56px",
        "letterSpacing": "-0.02em",
        "fontWeight": "700"
      }
    ],
    "disclaimer-legal": [
      "11px",
      {
        "lineHeight": "16px",
        "letterSpacing": "0.01em",
        "fontWeight": "400"
      }
    ],
    "label-data-md": [
      "13px",
      {
        "lineHeight": "16px",
        "letterSpacing": "0.04em",
        "fontWeight": "500"
      }
    ],
    "body-sm": [
      "13px",
      {
        "lineHeight": "20px",
        "fontWeight": "400"
      }
    ],
    "headline-lg": [
      "36px",
      {
        "lineHeight": "44px",
        "letterSpacing": "-0.02em",
        "fontWeight": "700"
      }
    ],
    "headline-sm": [
      "20px",
      {
        "lineHeight": "28px",
        "fontWeight": "600"
      }
    ],
    "headline-md": [
      "24px",
      {
        "lineHeight": "32px",
        "letterSpacing": "-0.01em",
        "fontWeight": "600"
      }
    ]
  }
},
  },
  plugins: [],
}

export default config
