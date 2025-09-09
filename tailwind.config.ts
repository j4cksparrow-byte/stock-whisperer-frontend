
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: '1rem',
				sm: '1.5rem',
				lg: '2rem',
				xl: '2.5rem',
				'2xl': '3rem'
			},
			screens: {
				sm: '640px',
				md: '768px',
				lg: '1024px',
				xl: '1280px',
				'2xl': '1400px'
			}
		},
		extend: {
			screens: {
				'xs': '475px',
				'3xl': '1600px',
				'4xl': '1920px'
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
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
				},
				// Enhanced Financial theme colors
				finance: {
					primary: {
						DEFAULT: '#1E3A8A',
						50: '#EFF6FF',
						100: '#DBEAFE',
						200: '#BFDBFE',
						300: '#93C5FD',
						400: '#60A5FA',
						500: '#3B82F6',
						600: '#2563EB',
						700: '#1D4ED8',
						800: '#1E3A8A',
						900: '#1E3A8A',
						950: '#172554'
					},
					secondary: {
						DEFAULT: '#065F46',
						50: '#ECFDF5',
						100: '#D1FAE5',
						200: '#A7F3D0',
						300: '#6EE7B7',
						400: '#34D399',
						500: '#10B981',
						600: '#059669',
						700: '#047857',
						800: '#065F46',
						900: '#064E3B',
						950: '#022C22'
					},
					accent: {
						DEFAULT: '#0EA5E9',
						50: '#F0F9FF',
						100: '#E0F2FE',
						200: '#BAE6FD',
						300: '#7DD3FC',
						400: '#38BDF8',
						500: '#0EA5E9',
						600: '#0284C7',
						700: '#0369A1',
						800: '#075985',
						900: '#0C4A6E',
						950: '#082F49'
					},
					success: {
						DEFAULT: '#10B981',
						50: '#ECFDF5',
						100: '#D1FAE5',
						200: '#A7F3D0',
						300: '#6EE7B7',
						400: '#34D399',
						500: '#10B981',
						600: '#059669',
						700: '#047857',
						800: '#065F46',
						900: '#064E3B'
					},
					warning: {
						DEFAULT: '#F59E0B',
						50: '#FFFBEB',
						100: '#FEF3C7',
						200: '#FDE68A',
						300: '#FCD34D',
						400: '#FBBF24',
						500: '#F59E0B',
						600: '#D97706',
						700: '#B45309',
						800: '#92400E',
						900: '#78350F'
					},
					danger: {
						DEFAULT: '#EF4444',
						50: '#FEF2F2',
						100: '#FEE2E2',
						200: '#FECACA',
						300: '#FCA5A5',
						400: '#F87171',
						500: '#EF4444',
						600: '#DC2626',
						700: '#B91C1C',
						800: '#991B1B',
						900: '#7F1D1D'
					},
					neutral: {
						DEFAULT: '#6B7280',
						50: '#F9FAFB',
						100: '#F3F4F6',
						200: '#E5E7EB',
						300: '#D1D5DB',
						400: '#9CA3AF',
						500: '#6B7280',
						600: '#4B5563',
						700: '#374151',
						800: '#1F2937',
						900: '#111827',
						950: '#030712'
					}
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				xl: 'calc(var(--radius) + 4px)',
				'2xl': 'calc(var(--radius) + 8px)',
				'3xl': 'calc(var(--radius) + 12px)'
			},
			spacing: {
				'18': '4.5rem',
				'88': '22rem',
				'128': '32rem',
				'144': '36rem'
			},
			fontSize: {
				'2xs': ['0.625rem', { lineHeight: '0.75rem' }],
				'3xl': ['1.875rem', { lineHeight: '2.25rem' }],
				'4xl': ['2.25rem', { lineHeight: '2.5rem' }],
				'5xl': ['3rem', { lineHeight: '1' }],
				'6xl': ['3.75rem', { lineHeight: '1' }],
				'7xl': ['4.5rem', { lineHeight: '1' }],
				'8xl': ['6rem', { lineHeight: '1' }],
				'9xl': ['8rem', { lineHeight: '1' }]
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'pulse-subtle': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' }
				},
				'slide-in-from-top': {
					'0%': { transform: 'translateY(-100%)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'slide-in-from-bottom': {
					'0%': { transform: 'translateY(100%)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'slide-in-from-left': {
					'0%': { transform: 'translateX(-100%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				'slide-in-from-right': {
					'0%': { transform: 'translateX(100%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'bounce-subtle': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' }
				},
				'glow': {
					'0%, 100%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' },
					'50%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' }
				},
				'chart-line': {
					'0%': { strokeDasharray: '0 1000' },
					'100%': { strokeDasharray: '1000 0' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-subtle': 'pulse-subtle 2s infinite ease-in-out',
				'slide-in-from-top': 'slide-in-from-top 0.3s ease-out',
				'slide-in-from-bottom': 'slide-in-from-bottom 0.3s ease-out',
				'slide-in-from-left': 'slide-in-from-left 0.3s ease-out',
				'slide-in-from-right': 'slide-in-from-right 0.3s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'bounce-subtle': 'bounce-subtle 2s infinite ease-in-out',
				'glow': 'glow 2s infinite ease-in-out',
				'chart-line': 'chart-line 1.5s ease-out'
			},
			backdropBlur: {
				xs: '2px'
			},
			boxShadow: {
				'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
				'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.37)',
				'glow': '0 0 20px rgba(59, 130, 246, 0.5)',
				'glow-lg': '0 0 40px rgba(59, 130, 246, 0.3)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
