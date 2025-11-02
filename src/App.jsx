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
      <header className="bg-gradient-to-r from-blue-500 to-indigo-600 py-12 mb-8 shadow-lg text-center text-white">
        <h1 className="text-3xl font-bold tracking-wide mb-4">
          Lowongan Maganghub Batch 2
        </h1>
        <p className="text-lg">Spill lowongan Maganghub di Batch 2!</p>
      </header>

      <VacancyList />

      {/* Toast Container wajib ada */}
      <ToastContainer />
    </div>
  );
}

export default App;
