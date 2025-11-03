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
  const perPage = 9;
  const [filter, setFilter] = useState({
    provinsi: null,
    kota: null,
    jurusan: null,
  });

  const [provinsiOptions, setProvinsiOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);

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

  // --- 1) Fetch provinsi ---
  useEffect(() => {
    const fetchProvinsi = async () => {
      try {
        const res = await fetch(
          'https://maganghub.kemnaker.go.id/be/v1/api/list/provinces?order_by=nama_propinsi&order_direction=ASC&page=1&limit=40'
        );
        const json = await res.json();
        const opts = (json.data || []).map((p) => ({
          value: p.kode_propinsi,
          label: p.nama_propinsi,
        }));
        setProvinsiOptions(opts);
      } catch (err) {
        console.error('Failed to load provinces', err);
      }
    };
    fetchProvinsi();
  }, []);

  // --- 2) Fetch kota berdasarkan provinsi yang dipilih ---
  useEffect(() => {
    const fetchCities = async () => {
      if (!filter.provinsi) {
        setCityOptions([]);
        setFilter((prev) => ({ ...prev, kota: null }));
        return;
      }
      try {
        const res = await fetch(
          `https://maganghub.kemnaker.go.id/be/v1/api/list/cities?kode_propinsi=${filter.provinsi.value}&order_by=nama_kabupaten&order_direction=ASC&page=1&limit=100`
        );
        const json = await res.json();
        const opts = (json.data || []).map((c) => ({
          value: c.nama_kabupaten,
          label: c.nama_kabupaten,
        }));
        setCityOptions(opts);
      } catch (err) {
        console.error('Failed to load cities', err);
        setCityOptions([]);
      }
    };

    fetchCities();
  }, [filter.provinsi]);

  // --- 3) Fetch vacancies ---
  useEffect(() => {
    const fetchVacancies = async () => {
      setLoading(true);
      try {
        const selectedProv = filter.provinsi;
        let all = [];
        let page = 1;
        let lastPage = 1;

        const baseUrl =
          'https://maganghub.kemnaker.go.id/be/v1/api/list/vacancies';
        const baseParams = selectedProv
          ? `angkatan=2&kode_provinsi=${selectedProv.value}`
          : 'angkatan=2';

        do {
          const url = `${baseUrl}?${baseParams}&page=${page}&limit=50`;
          const res = await fetch(url);
          const json = await res.json();
          if (json && Array.isArray(json.data)) {
            all = all.concat(json.data);
          }
          lastPage = json?.meta?.pagination?.last_page ?? page;
          page++;
        } while (page <= lastPage);

        setVacancies(all);
        setFilteredVacancies(all);
      } catch (err) {
        console.error('Error fetching vacancies', err);
        setVacancies([]);
        setFilteredVacancies([]);
      } finally {
        setLoading(false);
        setCurrentPage(1);
      }
    };

    fetchVacancies();
  }, [filter.provinsi]);

  // --- 4) Filtering (search + kota + jurusan) ---
  useEffect(() => {
    let result = vacancies;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          (v.posisi || '').toLowerCase().includes(q) ||
          (v.perusahaan?.nama_perusahaan || '').toLowerCase().includes(q)
      );
  }


    if (filter.kota) {
      result = result.filter(
        (v) => v.perusahaan?.nama_kabupaten === filter.kota.value
      );
    }

    if (filter.jurusan) {
      result = result.filter((v) => {
        try {
          const jurusanData =
            typeof v.program_studi === 'string'
              ? JSON.parse(v.program_studi)
              : v.program_studi;
          return Array.isArray(jurusanData)
            ? jurusanData.some((p) => p.title === filter.jurusan.value)
            : false;
        } catch {
          return false;
        }
      });
    }

    setFilteredVacancies(result);
    setCurrentPage(1);
  }, [searchQuery, filter.kota, filter.jurusan, vacancies]);

  // --- Pagination ---
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentVacancies = filteredVacancies.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.max(1, Math.ceil(filteredVacancies.length / perPage));

  if (loading) {
    return (
      <div className="text-center mt-20">Sabar yaa lagi loading nih...</div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filter bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <input
          type="text"
          placeholder="Cari Posisi Magang/Nama Perusahaan..."
          className="w-full md:w-1/3 p-2 border rounded"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Provinsi */}
        <div className="flex-1 min-w-[250px]">
          <Select
            options={provinsiOptions}
            value={filter.provinsi}
            onChange={(selected) => {
              setFilter((prev) => ({
                ...prev,
                provinsi: selected,
                kota: null, // reset kota kalau provinsi berubah
              }));
            }}
            placeholder="Pilih Provinsi"
            isClearable
          />
        </div>

        {/* Kota */}
        <div className="flex-1 min-w-[250px]">
          <Select
            options={cityOptions}
            value={filter.kota}
            onChange={(selected) =>
              setFilter((prev) => ({ ...prev, kota: selected }))
            }
            placeholder="Pilih Kabupaten/Kota"
            isClearable
            isDisabled={!filter.provinsi}
          />
        </div>

        {/* Jurusan */}
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

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => {
          if (page >= 1 && page <= totalPages) setCurrentPage(page);
        }}
      />
    </div>
  );
}

export default VacancyList;
