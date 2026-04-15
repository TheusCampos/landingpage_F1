tailwind.config = {
    theme: {
        extend: {
            colors: {
                f1: {
                    red: '#FF1801',
                    black: '#15151E',
                    dark: '#1F1F27',
                    white: '#F3F3F3',
                    gray: '#8C8C8C',
                    papaya: '#FF8000'
                }
            },
            fontFamily: {
                display: ['"Titillium Web"', 'sans-serif'],
                body: ['Inter', 'sans-serif']
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite'
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(30px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' }
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' }
                }
            }
        }
    }
}