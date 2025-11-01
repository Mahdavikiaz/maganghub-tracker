// import React from 'react';

// function VacancyCard({ vacancy }) {
//   const peluang =
//     vacancy.jumlah_kuota > 0
//       ? ((vacancy.jumlah_terdaftar / vacancy.jumlah_kuota) * 100).toFixed(2)
//       : 0;

//   // Membuat URL dinamis untuk halaman detail lowongan
//   const detailLink = `https://maganghub.kemnaker.go.id/lowongan/view/${vacancy.id_posisi}`;

//   return (
//     <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-5 flex flex-col justify-between">
//       <div>
//         <div className="flex justify-between items-start mb-3">
//           <h2 className="text-lg font-bold text-blue-700">{vacancy.posisi}</h2>
//           <p className="text-gray-500 text-sm">
//             {vacancy.perusahaan.nama_perusahaan}
//           </p>
//         </div>

//         <p className="text-sm font-semibold text-gray-600 mt-2">
//           Lokasi:{' '}
//           <span className="font-normal text-gray-800">
//             {vacancy.perusahaan.nama_kabupaten},{' '}
//             {vacancy.perusahaan.nama_provinsi}
//           </span>
//         </p>

//         {/* Status Lowongan */}
//         <p className="text-sm text-gray-600">
//           Status Lowongan:{' '}
//           <span className="font-normal">
//             {vacancy.ref_status_posisi.nama_status_posisi}
//           </span>
//         </p>

//         <div className="flex justify-between items-center mt-3 text-sm">
//           <p>
//             <strong>Pendaftar:</strong> {vacancy.jumlah_terdaftar ?? 0}
//           </p>
//           <p>
//             <strong>Kuota:</strong> {vacancy.jumlah_kuota ?? 0}
//           </p>
//           <p>
//             <strong>Peluang:</strong> {peluang}%
//           </p>
//         </div>
//       </div>

//       {/* Tombol Daftar Sekarang */}
//       <a
//         href={detailLink}
//         target="_blank"
//         rel="noopener noreferrer"
//         className="mt-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg text-center transition"
//       >
//         Daftar Sekarang
//       </a>
//     </div>
//   );
// }

// export default VacancyCard;
import React from 'react';

function VacancyCard({ vacancy }) {
  const peluang =
    vacancy.jumlah_kuota > 0
      ? ((vacancy.jumlah_terdaftar / vacancy.jumlah_kuota) * 100).toFixed(2)
      : 0;

  const peluangLabel =
    peluang < 30 ? 'Tinggi' : peluang < 70 ? 'Sedang' : 'Rendah';

  const peluangColor =
    peluang < 30
      ? 'bg-green-100 text-green-700'
      : peluang < 70
      ? 'bg-yellow-100 text-yellow-700'
      : 'bg-red-100 text-red-700';

  const detailLink = `https://maganghub.kemnaker.go.id/lowongan/view/${vacancy.id_posisi}`;

  const hasLogo =
    vacancy.perusahaan?.logo && vacancy.perusahaan.logo.trim() !== '';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 p-5">
      {/* Header */}
      <div className="flex items-center mb-4">
        {hasLogo ? (
          <img
            src={vacancy.perusahaan.logo}
            alt={`Logo ${vacancy.perusahaan.nama_perusahaan}`}
            className="w-14 h-14 rounded-lg object-contain mr-4 border border-gray-200 bg-gray-50 p-1"
          />
        ) : (
          <div className="w-14 h-14 rounded-lg mr-4 bg-gray-200 border border-gray-300" />
        )}

        <div>
          <h2 className="text-lg font-semibold text-blue-500">
            {vacancy.posisi}
          </h2>
          <p className="text-sm text-gray-500">
            {vacancy.perusahaan.nama_perusahaan}
          </p>
        </div>
      </div>

      {/* Info Utama */}
      <div className="text-sm text-gray-600 space-y-1 mb-4">
        <p>
          <span className="font-medium">Lokasi:</span>{' '}
          {vacancy.perusahaan.nama_kabupaten},{' '}
          {vacancy.perusahaan.nama_provinsi}
        </p>
        <div className="flex flex-wrap gap-3 mt-2">
          <span className="flex items-center gap-1">
            <strong>Pendaftar:</strong> {vacancy.jumlah_terdaftar ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <strong>Kuota:</strong> {vacancy.jumlah_kuota ?? 0}
          </span>
        </div>
      </div>

      {/* Peluang & Status */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs text-gray-500">
          Status: {vacancy.ref_status_posisi.nama_status_posisi}
        </span>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${peluangColor}`}
        >
          Peluang: {peluangLabel}
        </span>
      </div>

      {/* Tombol */}
      <a
        href={detailLink}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-xl font-medium transition"
      >
        Lihat Detail
      </a>
    </div>
  );
}

export default VacancyCard;
