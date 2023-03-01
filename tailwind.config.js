/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.ejs"],
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
      }

      },
      animation:{
        fadeInDown: "fadeInDown 1s"
      }
      
    },
  },
  plugins: [],
}
