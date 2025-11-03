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
  const [jurusanOptions, setJurusanOptions] = useState([]);

  // --- 1) Fetch provinsi ---
  useEffect(() => {
    const fetchProvinsi = async () => {
      try {
        const res = await fetch(
          'https://maganghub.kemnaker.go.id/be/v1/api/list/provinces?order_by=nama_propinsi&order_direction=ASC&page=1&limit=40'
        );
        const json = await res.json();
        const opts = (json.data || []).map((p) => ({
          value: p.nama_propinsi,
          kode: p.kode_propinsi,
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
          `https://maganghub.kemnaker.go.id/be/v1/api/list/cities?kode_propinsi=${filter.provinsi.kode}&order_by=nama_kabupaten&order_direction=ASC&page=1&limit=100`
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

  // --- 3) Fetch semua jurusan (1738 total) ---
  useEffect(() => {
    const fetchAllMajors = async () => {
      try {
        let all = [];
        let page = 1;
        let lastPage = 1;

        do {
          const res = await fetch(
            `https://maganghub.kemnaker.go.id/be/v1/api/list/prodi?page=${page}&limit=20`
          );
          const json = await res.json();

          if (json?.data) all = all.concat(json.data);
          lastPage = json?.meta?.pagination?.last_page ?? page;
          page++;
        } while (page <= lastPage);

        const opts = all.map((j) => ({
          value: j.nama_program_studi,
          label: j.nama_program_studi,
        }));
        setJurusanOptions(opts);
        console.log('Total jurusan:', opts.length);
      } catch (err) {
        console.error('Failed to load all jurusan', err);
      }
    };

    fetchAllMajors();
  }, []);

  // --- 4) Fetch semua lowongan sekali saja (angkatan 2) ---
  useEffect(() => {
    const fetchAllVacancies = async () => {
      setLoading(true);
      try {
        let all = [];
        let page = 1;
        let lastPage = 1;

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

        console.log('Total lowongan:', all.length);
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

    fetchAllVacancies();
  }, []);

  // --- 5) Filtering lokal (tanpa refetch API) ---
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

    // ✅ Filter Provinsi (pakai toLowerCase supaya robust)
    if (filter.provinsi) {
      const provName = filter.provinsi.value.toLowerCase();
      result = result.filter((v) =>
        (v.perusahaan?.nama_provinsi || '').toLowerCase().includes(provName)
      );
    }

    // ✅ Filter Kota
    if (filter.kota) {
      const kotaName = filter.kota.value.toLowerCase();
      result = result.filter((v) =>
        (v.perusahaan?.nama_kabupaten || '').toLowerCase().includes(kotaName)
      );
    }

    // ✅ Filter Jurusan
    if (filter.jurusan) {
      result = result.filter((v) => {
        try {
          const jurusanData =
            typeof v.program_studi === 'string'
              ? JSON.parse(v.program_studi)
              : v.program_studi;
          return Array.isArray(jurusanData)
            ? jurusanData.some(
                (p) =>
                  (p.title || '').toLowerCase() ===
                  filter.jurusan.value.toLowerCase()
              )
            : false;
        } catch {
          return false;
        }
      });
    }

    setFilteredVacancies(result);
    setCurrentPage(1);
  }, [searchQuery, filter, vacancies]);

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
            onChange={(selected) =>
              setFilter((prev) => ({
                ...prev,
                provinsi: selected,
                kota: null,
              }))
            }
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
