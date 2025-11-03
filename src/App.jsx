import React, { useEffect } from 'react';
import VacancyList from './components/VacancyList';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  useEffect(() => {
    // Cek apakah disclaimer sudah pernah ditampilkan (pakai localStorage)
    const hasShownDisclaimer = localStorage.getItem('disclaimerShown');
    if (!hasShownDisclaimer) {
      toast.info(
        '📢 DISCLAIMER:\n\nData pada website ini diambil secara realtime dari API Maganghub resmi. Beberapa lowongan masih belum terverifikasi, jadi masih ada kemungkinan lowongan tidak dipublish saat pendaftaran.',
        {
          position: 'top-center',
          autoClose: 7000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'colored',
        }
      );
      localStorage.setItem('disclaimerShown', 'true');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Section */}
      <header class="relative overflow-hidden bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-600 bg-[length:400%_400%] animate-gradient-x text-white py-24 text-center">
        <div class="relative z-10">
          <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 animate-fade-up">
            💼 Lowongan Maganghub Batch 2
          </h1>
          <p class="text-lg sm:text-xl font-light opacity-90 animate-fade-up-delay">
            Spill lowongan Maganghub di Batch 2!
          </p>
        </div>

        <div class="absolute inset-0 z-0 overflow-hidden">
          <div class="absolute bg-white/10 w-72 h-72 rounded-full blur-3xl top-10 left-[-100px] animate-float-slow"></div>
          <div class="absolute bg-white/10 w-80 h-80 rounded-full blur-3xl bottom-10 right-[-120px] animate-float-fast"></div>
        </div>

        <div class="absolute bottom-0 left-0 right-0 overflow-hidden leading-[0]">
          <div class="animate-wave-move">
            <svg
              class="relative block w-[200%] h-24"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            ></svg>
          </div>
        </div>
      </header>

      <VacancyList />

      {/* Toast Container wajib ada */}
      <ToastContainer />
    </div>
  );
}

export default App;
