import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import VacancyCard from './VacancyCard';
import Pagination from './Pagination';

function VacancyList() {
  const [vacanciesRaw, setVacanciesRaw] = useState([]);
  const [vacanciesFiltered, setVacanciesFiltered] = useState([]);
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

  // --- Fetch Vacancies (loop semua halaman untuk filter provinsi/kota) ---
  useEffect(() => {
    const fetchVacancies = async () => {
      setLoading(true);
      try {
        const paramsBase = new URLSearchParams();
        paramsBase.append('angkatan', '2');
        paramsBase.append('order_by', 'jumlah_kuota');
        paramsBase.append('order_direction', 'DESC');

        let allData = [];

        if (!filter.provinsi && !filter.kota) {
          // normal paginate
          paramsBase.append('page', currentPage);
          paramsBase.append('limit', perPage);

          const url = `https://maganghub.kemnaker.go.id/be/v1/api/list/vacancies-aktif?${paramsBase.toString()}`;
          const res = await fetch(url);
          const json = await res.json();

          allData = json.data || [];
          setTotalPages(json?.meta?.pagination?.last_page ?? 1);
        } else {
          // fetch semua page berdasarkan provinsi/kota
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

            if (page > 2000) hasMore = false; // safety stop
          }

          setTotalPages(Math.ceil(allData.length / perPage));
        }

        // --- Mapping tambahan untuk deskripsi ---
        const mapped = allData.map((v) => {
          const deskripsiSingkat = v.deskripsi_posisi
            ? v.deskripsi_posisi.length > 120
              ? v.deskripsi_posisi.substring(0, 120) + '...'
              : v.deskripsi_posisi
            : 'Tidak ada deskripsi.';
          return { ...v, deskripsiSingkat };
        });

        setVacanciesRaw(mapped);
        setVacanciesFiltered(mapped);
      } catch (err) {
        console.error('Error fetching vacancies', err);
        setVacanciesRaw([]);
        setVacanciesFiltered([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVacancies();
  }, [currentPage, filter.provinsi, filter.kota]);

  // Reset page ke 1 setiap filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [filter.provinsi, filter.kota]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filter bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Provinsi */}
        <div className="flex-1 min-w-[200px]">
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
        <div className="flex-1 min-w-[200px]">
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
          />
        </div>
      </div>

      {/* Loading / Data */}
      {loading ? (
        <div className="text-center mt-20 text-gray-600 animate-pulse">
          🔄 Sedang memuat data lowongan...
        </div>
      ) : vacanciesFiltered.length > 0 ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(() => {
              const start = (currentPage - 1) * perPage;
              const end = start + perPage;
              const pagedData = vacanciesFiltered.slice(start, end);
              return pagedData.map((v) => (
                <VacancyCard key={v.id_posisi} vacancy={v} />
              ));
            })()}
          </div>
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
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
