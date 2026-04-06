export const Footer = () => (
  <footer className="w-full flex justify-center mt-auto">
    <div className="w-full max-w-[1200px] bg-brand-dark-teal text-white pt-12 pb-10 px-6 rounded-t-[50px] flex flex-col items-center">
      <div className="bg-brand-orange px-12 py-3 rounded-2xl font-bold mb-8 font-roboto text-black shadow-md text-sm">
        Остались вопросы?
      </div>
      <div className="flex flex-wrap justify-center gap-x-16 gap-y-4 font-roboto text-sm opacity-80 tracking-normal">
        <p>Email: info@positivus.com</p>
        <p>Телефон: 555-567-8901</p>
        <p>Гимназия 17</p>
      </div>
    </div>
  </footer>
);