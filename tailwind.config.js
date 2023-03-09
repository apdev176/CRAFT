/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.ejs",
            "./public/**/*.{html,js}"],
  theme: {
    extend: {
      keyframes :{
        fadeInDown: {
          '0%': {
              opacity: 0,
              transform: 'translateY(-20px)'
          },
          '100%': {
              opacity: 1,
              transform: 'translateY(0)'
          }
      },
      popIn: { 
        '0%': {
          opacity: 0,
          transform: 'scale(0)'
        },
        '90%': {  
          transform: 'scale(1.05)'
        },
        '100%': {
          opacity: 1,
          transform: 'scale(1)'
        }
      }

      },
      animation:{
        fadeInDown: "fadeInDown 0.5s",
        popIn: "popIn 0.3s",
      }
    },
  },
  plugins: [],
}
