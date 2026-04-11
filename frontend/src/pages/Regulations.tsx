import { Helmet } from 'react-helmet-async';

export const Regulations = () => {
  return (
    <>
      <Helmet>
        <title>Положение | Платформа конкурсов</title>
      </Helmet>
      
      <div className="w-full max-w-[1200px] mx-auto px-6 py-10 animate-fadeIn font-normal text-left">
        <h1 className="font-unbounded text-brand-dark-teal text-3xl md:text-4xl mb-10">
          Положение
        </h1>
        
        <div className="bg-brand-light-teal rounded-[40px] p-8 md:p-12 border border-brand-accent-teal shadow-[0_6px_0_0_#337D86]">
          <div className="space-y-8 font-roboto text-brand-dark-teal text-lg leading-relaxed opacity-90">
            <section>
              <h3 className="font-unbounded text-xl mb-4">1. Общие положения</h3>
              <p>Настоящее положение определяет порядок организации и проведения творческих конкурсов на платформе «Портфель».</p>
            </section>
            <section>
              <h3 className="font-unbounded text-xl mb-4">2. Участники</h3>
              <p>К участию допускаются лица, зарегистрированные на платформе и заполнившие профиль участника.</p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};