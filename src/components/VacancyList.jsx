import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import VacancyCard from './VacancyCard';
import Pagination from './Pagination';

function VacancyList() {
  const [vacanciesRaw, setVacanciesRaw] = useState([]);
  const [vacanciesFiltered, setVacanciesFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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

  // --- Fetch Vacancies ---
  useEffect(() => {
    const fetchVacanciesPage = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('angkatan', '2');
        params.append('page', currentPage);
        params.append('limit', perPage);

        if (filter.provinsi) {
          params.append('kode_provinsi', filter.provinsi.value);
        }

        if (filter.kota) {
          params.append('nama_kabupaten', filter.kota.value);
        }

        if (searchQuery) {
          params.append('search', searchQuery);
        }

        const url = `https://maganghub.kemnaker.go.id/be/v1/api/list/vacancies-aktif?order_by=jumlah_kuota&order_direction=DESC&${params.toString()}`;

        const res = await fetch(url);
        const json = await res.json();

        const data = json.data || [];
        const lastPage = json?.meta?.pagination?.last_page ?? 1;
        setTotalPages(lastPage);
        setVacanciesRaw(data);
      } catch (err) {
        console.error('Error fetching vacancies', err);
        setVacanciesRaw([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVacanciesPage();
  }, [currentPage, filter.provinsi, filter.kota, searchQuery]);

  // --- Filter lokal ---
  useEffect(() => {
    let result = [...vacanciesRaw];

    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          (v.posisi || '').toLowerCase().includes(q) ||
          (v.perusahaan?.nama_perusahaan || '').toLowerCase().includes(q)
      );
    }

    if (filter.provinsi) {
      const prov = filter.provinsi.label.toLowerCase();
      result = result.filter((v) =>
        (v.perusahaan?.nama_provinsi || '').toLowerCase().includes(prov)
      );
    }

    if (filter.kota) {
      const kota = filter.kota.value.toLowerCase();
      result = result.filter((v) =>
        (v.perusahaan?.nama_kabupaten || '').toLowerCase().includes(kota)
      );
    }

    const mapped = result.map((v) => {
      const deskripsiSingkat = v.deskripsi_posisi
        ? v.deskripsi_posisi.length > 120
          ? v.deskripsi_posisi.substring(0, 120) + '...'
          : v.deskripsi_posisi
        : 'Tidak ada deskripsi.';
      let prodiParsed = [];
      try {
        prodiParsed =
          typeof v.program_studi === 'string'
            ? JSON.parse(v.program_studi)
            : v.program_studi || [];
      } catch {
        prodiParsed = [];
      }
      return { ...v, deskripsiSingkat, prodiParsed };
    });

    setVacanciesFiltered(mapped);
  }, [vacanciesRaw, searchQuery, filter]);

  // Reset page ke 1 setiap filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filter bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Cari Posisi Magang / Nama Perusahaan..."
          className="w-full md:w-1/3 p-2 border rounded"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
        />

        {/* Provinsi */}
        <div className="flex-1 min-w-[200px]">
          <Select
            options={provinsiOptions}
            value={filter.provinsi}
            onChange={(selected) =>
              setFilter((prev) => ({ ...prev, provinsi: selected, kota: null }))
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
              setFilter((prev) => ({ ...prev, kota: selected }))
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
            {vacanciesFiltered.map((v) => (
              <VacancyCard key={v.id_posisi} vacancy={v} />
            ))}
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
