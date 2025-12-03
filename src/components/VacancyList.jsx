import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import VacancyCard from './VacancyCard';
import Pagination from './Pagination';

function VacancyList() {
  const [vacanciesRaw, setVacanciesRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 12;

  const [filter, setFilter] = useState({
    provinsi: null,
    kota: null,
  });

  const [provinsiOptions, setProvinsiOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // --- Fetch Provinsi ---
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

  // --- Fetch Kota berdasarkan Provinsi ---
  useEffect(() => {
    const fetchCities = async () => {
      if (!filter.provinsi) {
        setCityOptions([]);
        setFilter((prev) => ({ ...prev, kota: null }));
        return;
      }
      try {
        const res = await fetch(
          `https://maganghub.kemnaker.go.id/be/v1/api/list/cities?kode_propinsi=${filter.provinsi.value}&order_by=nama_kabupaten&order_direction=ASC&page=1&limit=200`
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

  // --- Fetch Lowongan ---
  useEffect(() => {
    const fetchVacancies = async () => {
      setLoading(true);
      try {
        const paramsBase = new URLSearchParams();
        paramsBase.append('angkatan', '3');
        paramsBase.append('order_by', 'jumlah_kuota');
        paramsBase.append('order_direction', 'DESC');

        let allData = [];
        const kodeProv = filter.provinsi?.value || '';
        const namaKab = filter.kota?.value || '';
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const params = new URLSearchParams(paramsBase);
          params.append('page', page);
          params.append('limit', 500);
          if (kodeProv) params.append('kode_provinsi', kodeProv);
          if (namaKab) params.append('nama_kabupaten', namaKab);

          const url = `https://maganghub.kemnaker.go.id/be/v1/api/list/vacancies-aktif?${params.toString()}`;
          const res = await fetch(url);
          const json = await res.json();

          const data = json.data || [];
          if (data.length === 0) {
            hasMore = false;
          } else {
            allData = [...allData, ...data];
            page++;
          }

          if (page > 2000) hasMore = false;
        }

        const mapped = allData.map((v) => {
          const deskripsiSingkat = v.deskripsi_posisi
            ? v.deskripsi_posisi.length > 120
              ? v.deskripsi_posisi.substring(0, 120) + '...'
              : v.deskripsi_posisi
            : 'Tidak ada deskripsi.';
          return { ...v, deskripsiSingkat };
        });

        setVacanciesRaw(mapped);
        setTotalPages(Math.ceil(mapped.length / perPage));
      } catch (err) {
        console.error('Error fetching vacancies', err);
        setVacanciesRaw([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchVacancies();
  }, [filter.provinsi, filter.kota]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter.provinsi, filter.kota, searchTerm]);

  const filteredVacancies = vacanciesRaw.filter((v) => {
    const keyword = searchTerm.toLowerCase();
    return (
      v.nama_posisi?.toLowerCase().includes(keyword) ||
      v.nama_instansi?.toLowerCase().includes(keyword) ||
      v.deskripsi_posisi?.toLowerCase().includes(keyword)
    );
  });

  const start = (currentPage - 1) * perPage;
  const end = start + perPage;
  const pagedData = filteredVacancies.slice(start, end);
  const totalFilteredPages = Math.ceil(filteredVacancies.length / perPage);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mb-6">
        {/* 🔍 Search Bar */}
        <div className="w-full sm:flex-1">
          <input
            type="text"
            placeholder="Cari lowongan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>

        {/* Provinsi */}
        <div className="w-full sm:flex-1">
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
            className="text-sm"
            styles={{
              control: (base) => ({
                ...base,
                minHeight: '40px',
                fontSize: '14px',
              }),
            }}
          />
        </div>

        {/* Kota */}
        <div className="w-full sm:flex-1">
          <Select
            options={cityOptions}
            value={filter.kota}
            onChange={(selected) =>
              setFilter((prev) => ({
                ...prev,
                kota: selected,
              }))
            }
            placeholder="Pilih Kabupaten/Kota"
            isClearable
            isDisabled={!filter.provinsi}
            className="text-sm"
            styles={{
              control: (base) => ({
                ...base,
                minHeight: '40px',
                fontSize: '14px',
              }),
            }}
          />
        </div>
      </div>

      {/* Loading / Data */}
      {loading ? (
        <div className="text-center mt-20 text-gray-600 animate-pulse">
          🔄 Sedang memuat data lowongan...
        </div>
      ) : pagedData.length > 0 ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pagedData.map((v) => (
              <VacancyCard key={v.id_posisi} vacancy={v} />
            ))}
          </div>
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalFilteredPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      ) : (
        <div className="text-center mt-20 text-gray-500">
          Tidak ada lowongan ditemukan.
        </div>
      )}
    </div>
  );
}

export default VacancyList;
