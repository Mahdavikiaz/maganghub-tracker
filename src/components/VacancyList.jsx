import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import VacancyCard from './VacancyCard';
import Pagination from './Pagination';

function VacancyList() {
  const [vacancies, setVacancies] = useState([]);
  const [filteredVacancies, setFilteredVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 9; // card per page (frontend pagination)
  const [filter, setFilter] = useState({
    provinsi: null,
    kota: null,
    jurusan: null,
  });

  const jurusanOptions = [
    { value: 'Teknik Informatika', label: 'Teknik Informatika' },
    { value: 'Sistem Informasi', label: 'Sistem Informasi' },
    { value: 'Teknik Elektro', label: 'Teknik Elektro' },
    { value: 'Manajemen', label: 'Manajemen' },
    { value: 'Akuntansi', label: 'Akuntansi' },
    { value: 'Psikologi', label: 'Psikologi' },
    { value: 'Desain Komunikasi Visual', label: 'Desain Komunikasi Visual' },
    { value: 'Arsitektur', label: 'Arsitektur' },
    { value: 'Ilmu Komunikasi', label: 'Ilmu Komunikasi' },
    { value: 'Biologi', label: 'Biologi' },
    { value: 'Hukum', label: 'Hukum' },
    { value: 'Teknik Mesin', label: 'Teknik Mesin' },
    { value: 'Teknik Sipil', label: 'Teknik Sipil' },
    { value: 'Ilmu Pemerintahan', label: 'Ilmu Pemerintahan' },
    { value: 'Fisika', label: 'Fisika' },
    { value: 'Kimia', label: 'Kimia' },
    { value: 'Matematika', label: 'Matematika' },
    { value: 'Sastra Inggris', label: 'Sastra Inggris' },
    {
      value: 'Pendidikan Guru Sekolah Dasar',
      label: 'Pendidikan Guru Sekolah Dasar',
    },
    { value: 'Farmasi', label: 'Farmasi' },
  ];

  const [provinsiOptions, setProvinsiOptions] = useState([]);
  // optionally you can keep kotaOptions/jurusanOptions or derive them from vacancies

  // --- 1) fetch provinsi list once (for dropdown) ---
  useEffect(() => {
    const fetchProvinsi = async () => {
      try {
        const res = await fetch(
          'https://maganghub.kemnaker.go.id/be/v1/api/list/provinces?order_by=nama_propinsi&order_direction=ASC&page=1&limit=40'
        );
        const json = await res.json();
        const opts = (json.data || []).map((p) => ({
          value: p.kode_propinsi, // use kode_propinsi for API param
          label: p.nama_propinsi,
        }));
        setProvinsiOptions(opts);
      } catch (err) {
        console.error('Failed to load provinces', err);
      }
    };
    fetchProvinsi();
  }, []);

  // --- 2) fetch vacancies: if provinsi selected use kode_provinsi param,
  //     otherwise fetch all vacancies (loop pages) ---
  useEffect(() => {
    const fetchAllForProvinsiOrAll = async () => {
      setLoading(true);
      try {
        const selectedProv = filter.provinsi;
        let all = [];
        let page = 1;
        let lastPage = 1;

        if (selectedProv && selectedProv.value) {
          // Fetch vacancies *for selected province*, loop pages
          do {
            const url = `https://maganghub.kemnaker.go.id/be/v1/api/list/vacancies?angkatan=2&kode_provinsi=${selectedProv.value}&page=${page}&limit=50`;
            const res = await fetch(url);
            const json = await res.json();
            if (json && Array.isArray(json.data)) {
              all = all.concat(json.data);
            }
            // guard: if meta exists read last_page; otherwise break
            lastPage = json?.meta?.pagination?.last_page ?? page;
            page++;
          } while (page <= lastPage);
        } else {
          // No province filter -> fetch all vacancies (angkatan=2) across pages
          do {
            const url = `https://maganghub.kemnaker.go.id/be/v1/api/list/vacancies?angkatan=2&page=${page}&limit=50`;
            const res = await fetch(url);
            const json = await res.json();
            if (json && Array.isArray(json.data)) {
              all = all.concat(json.data);
            }
            lastPage = json?.meta?.pagination?.last_page ?? page;
            page++;
          } while (page <= lastPage);
        }

        setVacancies(all);
        setFilteredVacancies(all);
      } catch (err) {
        console.error('Error fetching vacancies', err);
        setVacancies([]);
        setFilteredVacancies([]);
      } finally {
        setLoading(false);
        setCurrentPage(1); // reset UI pagination to first page
      }
    };

    fetchAllForProvinsiOrAll();
    // re-run when user changes selected province
  }, [filter.provinsi]);

  // --- 3) client-side filtering (search + kota + jurusan) ---
  useEffect(() => {
    let result = vacancies;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((v) => (v.posisi || '').toLowerCase().includes(q));
    }

    if (filter.kota) {
      result = result.filter(
        (v) => v.perusahaan?.nama_kabupaten === filter.kota.value
      );
    }

    if (filter.jurusan) {
      result = result.filter((v) =>
        Array.isArray(v.program_studi)
          ? v.program_studi.some((p) => p.title === filter.jurusan.value)
          : // sometimes program_studi might be stringified JSON; attempt parse
            (() => {
              try {
                const arr =
                  typeof v.program_studi === 'string'
                    ? JSON.parse(v.program_studi)
                    : [];
                return arr.some((p) => p.title === filter.jurusan.value);
              } catch (e) {
                console.log('Error', e);
                return false;
              }
            })()
      );
    }

    setFilteredVacancies(result);
    setCurrentPage(1);
  }, [searchQuery, filter.kota, filter.jurusan, vacancies]);

  // --- frontend pagination ---
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentVacancies = filteredVacancies.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.max(1, Math.ceil(filteredVacancies.length / perPage));

  // --- render ---
  if (loading) {
    return (
      <div className="text-center mt-20">Sabar yaa lagi loading nih...</div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Cari posisi magang..."
          className="w-full md:w-1/3 p-2 border rounded"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="flex-1 min-w-[250px]">
          <Select
            options={provinsiOptions}
            value={filter.provinsi}
            onChange={(selected) =>
              setFilter((prev) => ({ ...prev, provinsi: selected }))
            }
            placeholder="Pilih Provinsi"
            isClearable
          />
        </div>

        <div className="flex-1 min-w-[250px]">
          <Select
            options={jurusanOptions}
            value={filter.jurusan}
            onChange={(selected) =>
              setFilter((prev) => ({ ...prev, jurusan: selected }))
            }
            placeholder="Pilih Jurusan"
            isClearable
          />
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {currentVacancies.map((v) => (
          <VacancyCard key={v.id_posisi} vacancy={v} />
        ))}
      </div>

      {/* Pagination controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => {
          if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
          }
        }}
      />
      {/* <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
        >
          Prev
        </button>

        <div>
          Page {currentPage} / {totalPages}
        </div>

        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div> */}
    </div>
  );
}

export default VacancyList;
