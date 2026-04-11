import React from 'react';
import './index.css';

const Splash: React.FC = () => {
  const icons = Array.from({length: 5});

  return (
    <div className="flex w-full flex-col min-h-screen items-center justify-center bg-gradient-to-r from-purple-500 to-blue-400">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-white text-4xl font-bold mb-4 font-source-code">Chat chat chat !</h1>
        {/* <p className="text-white text-lg mb-4">Đang tải dữ liệu, vui lòng chờ...</p> */}

        <div className="flex space-x-4 py-10">
          {icons.map((_, index) => (
            <div key={index} className={`loader animation-${index} bg-white`} />
          ))}
        </div>

        {/* <p className="text-white text-lg font-source-code">Chúng tôi sẽ mang đến những dịch vụ tốt nhất cho bạn!</p> */}
      </div>
    </div>
  );
};

export default Splash;
