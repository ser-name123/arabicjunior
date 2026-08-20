import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/**/*.{js,ts,jsx,tsx,mdx}",
	],
	safelist: ['container-fluid'],
	theme: {
		screens: {
			sm: '640px',
			md: '768px',
			lg: '992px',
			xl: '1210px'
		},
		container: {
			center: true,
			padding: '1.25rem',
			screens: {
				sm: '640px',
				md: '768px',
				lg: '992px',
				xl: '1210px'
			}
		},
		extend: {
			colors: {
				background: 'var(--background)',
				foreground: 'var(--foreground)',
				transparent: 'transparent',
				white: '#FFFFFF',
				// The brand's black. Not #000000 — pure black on white is harsh to
				// read at body sizes, and this is the value the design calls for.
				black: '#434343',
				// True black, kept separately for modal backdrops. A scrim at
				// #434343/80 is visibly washed out and stops separating the dialog
				// from the page behind it, which is the only job it has.
				scrim: '#000000',
				orange: {
					'100': '#FFEFEB',
					'200': '#FEE0D7',
					'300': '#FDC0AF',
					'400': '#FDA188',
					'500': '#FB6238',
					'600': '#CB4F2D',
					'700': '#9B3C22',
					'800': '#6B2916',
					'900': '#531F11'
				},
				yellow: {
					'100': '#FEF7E7',
					'200': '#FDEFD0',
					'300': '#FCE7B8',
					'400': '#FBDFA1',
					'500': '#F5AE14',
					'600': '#573E07',
					'700': '#6D4E09',
					'800': '#6D4E09',
					'900': '#573E07'
				},
				'light-green': {
					'100': '#EDF5DB',
					'200': '#DBECB7',
					'300': '#CAE292',
					'400': '#B8D96E',
					'500': '#A6CF4A',
					'600': '#85A63B',
					'700': '#647C2C',
					'800': '#42531E',
					'900': '#323E16'
				},
				pink: {
					'100': '#FFEFF6',
					'200': '#FFCFE5',
					'300': '#FFA0CB',
					'400': '#FF80B9',
					'500': '#FF60A8',
					'600': '#D74D8B',
					'700': '#AF3A6F',
					'800': '#872652',
					'900': '#731D44'
				},
				neutral: {
					'100': '#EEEEF2',
					'200': '#C0CAD9',
					'300': '#A1A8B2',
					'400': '#8C95A3',
					'500': '#848D9B',
					'600': '#4A5463',
					'700': '#343C48',
					// 800 and 900 were #1E242D and #181D24 — two near-blacks nobody
					// could tell apart. Both now carry the brand black, so a heading
					// and the line under it stay the same colour.
					'800': '#434343',
					'900': '#434343'
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				chart: {
					"1": "hsl(var(--chart-1))",
					"2": "hsl(var(--chart-2))",
					"3": "hsl(var(--chart-3))",
					"4": "hsl(var(--chart-4))",
					"5": "hsl(var(--chart-5))",
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			// `font-sans` must resolve to Inter, the font loaded in layout.tsx.
			// Without this it falls back to Tailwind's system stack and silently
			// overrides the Inter set on <body> in globals.css.
			fontFamily: {
				sans: ['var(--inter-sans)', 'sans-serif']
			},
			boxShadow: {
				'3xl': '-8px 14px 56px 0px rgba(0, 0, 0, 0.10)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
