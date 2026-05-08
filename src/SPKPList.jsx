import React, { useState } from 'react';

const SPKPList = ({ onBack }) => {
const [searchNo, setSearchNo] = useState('');
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
const [showDetailModal, setShowDetailModal] = useState(false);
const [tiketData, setTiketData] = useState(null);

const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchNo) return;

    setLoading(true);
    setError('');
    setData(null);
    setTiketData(null); // Reset data tiket lama setiap kali mencari baru

    try {
        const response = await fetch(`http://localhost:3000/spkp/search?nomor=${encodeURIComponent(searchNo)}`);
        const result = await response.json();

        if (result.status === 'success') {
            // SIMPAN KEDUA DATA DI SINI (Dalam blok yang sama)
            setData(result.data);       // Data dari MS SQL
            setTiketData(result.tiket); // Data dari MySQL
        } else {
            setError(result.message);
        }
    } catch (err) {
        setError('Gagal terhubung ke server');
        console.error("Search Error:", err);
    } finally {
        setLoading(false);
    }
    
};

const getTiketStatus = (status) => {
  switch (status?.toString()) {
    case '0':
      return { label: 'Diteruskan', color: 'bg-slate-100 text-slate-600 border-slate-200' };
    case '1':
      return { label: 'Proses', color: 'bg-amber-100 text-amber-600 border-amber-200' };
    case '2':
      return { label: 'Selesai', color: 'bg-emerald-100 text-emerald-600 border-emerald-200' };
    default:
      return { label: 'Unknown', color: 'bg-gray-100 text-gray-400' };
  }
};

const DetailItem = ({ label, value, isStatus = false }) => (
  <div className="flex flex-col">
    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{label}</span>
    {isStatus ? (
      <div className="mt-1">
        <span className={`px-3 py-1 rounded-full text-[10px] font-black ${value === 'SELESAI' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
          {value || 'PROSES'}
        </span>
      </div>
    ) : (
      <p className="text-slate-800 font-bold mt-1 text-sm leading-relaxed">{value || '-'}</p>
    )}
  </div>
);

return (
<div className="min-h-screen bg-slate-50 pb-10">
    {/* Header */}
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-b-[2.5rem] shadow-lg flex items-center">
        <button onClick={onBack} className="p-2 bg-white/20 rounded-xl text-white mr-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
        </button>
        <h2 className="text-white text-xl font-bold">Pencarian SPKP</h2>
    </div>

    {/* Search Bar */}
    <div className="px-6 -mt-5">
        <form onSubmit={handleSearch} className="bg-white p-4 rounded-3xl shadow-xl flex items-center space-x-2">
            <input type="text" placeholder="Masukkan No. SPKP..."
                className="flex-1 p-3 outline-none font-semibold text-slate-700" value={searchNo} onChange={(e)=>
            setSearchNo(e.target.value)}
            />
            <button type="submit"
                className="bg-purple-600 text-white p-3 rounded-2xl active:scale-95 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </button>
        </form>
    </div>

    {/* Content Area */}
    <div className="px-6 mt-8">
        {loading && <div className="text-center font-bold text-purple-600 animate-pulse">Mencari data...</div>}

        {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-center font-medium border border-red-100">
            {error}
        </div>
        )}

        {data && (
        <div onClick={() => setShowDetailModal(true)}
            className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-purple-50 p-6 border-b border-purple-100">
                <span className="text-purple-600 text-xs font-bold uppercase tracking-widest">Detail Data</span>
                <h3 className="text-2xl font-black text-slate-800 mt-1">{data.no_spkp}</h3>
            </div>

            <div className="p-6 space-y-6">
                {/* Nama Pekerjaan - Model Stack */}
                <div className="border-b border-slate-50 pb-3">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Nama Pekerjaan</span>
                    <p className="text-slate-800 font-bold mt-1 leading-relaxed">
                        {data.ket_pekerjaan || '-'}
                    </p>
                </div>

                {/* Lokasi - Model Stack (Solusi untuk teks panjang) */}
                <div className="border-b border-slate-50 pb-3">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Lokasi / Wilayah</span>
                    <p className="text-slate-800 font-bold mt-1 leading-relaxed text-sm">
                        {data.lokasi || '-'}
                    </p>
                </div>

                {/* Vendor & Status - Bisa tetap Horizontal atau disamakan Stack */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Vendor</span>
                        <p className="text-slate-800 font-bold mt-1">{data.perusahaan_rekanan || '-'}</p>
                    </div>
                    <div className="flex flex-col items-center justify-start">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Status</span>
                        <div className="mt-1">
                            <span
                                className={`px-3 py-1 rounded-full text-[10px] font-black inline-block leading-none ${
                                data.status === 'SELESAI' 
                                ? 'bg-emerald-100 text-emerald-600' // Hijau jika SELESAI
                                : 'bg-amber-100 text-amber-600'    // Kuning/Amber jika PROSES atau lainnya
                                    }`}
                                >
                                {data.status || 'PROSES'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-slate-50 p-3 text-center text-slate-400 text-[10px] font-bold uppercase">
                Klik untuk detail lengkap
            </div>
        </div>
        )}

        {!data && !loading && !error && (
        <div className="text-center py-20 opacity-20">
            <span className="text-7xl">🔍</span>
            <p className="mt-4 font-bold">Silakan cari nomor SPKP</p>
        </div>
        )}
    </div>
    {/* MODAL DETAIL SPKP */}
{showDetailModal && data && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-4">
    <div className="bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-300">
      
      {/* Header Modal */}
      <div className="p-8 border-b border-slate-50 flex justify-between items-start">
        <div>
          <span className="text-purple-600 font-black text-xs uppercase tracking-widest">Detail Dokumen</span>
          <h3 className="text-2xl font-black text-slate-800 mt-1">{data.no_spkp}</h3>
        </div>
            <button 
            onClick={() => setShowDetailModal(false)}
            className="w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center transition-colors hover:bg-slate-200"
            >
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-6 h-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
            >
                <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2.5} 
                d="M6 18L18 6M6 6l12 12" 
                />
            </svg>
            </button>
      </div>

      {/* Body Modal (Scrollable jika data banyak) */}
      <div className="p-8 max-h-[60vh] overflow-y-auto space-y-6">
        
        <div className="grid grid-cols-2 gap-6">
          <DetailItem 
            label="Tanggal SPKP" 
            value={
                data.tgl_spkp 
                ? new Date(data.tgl_spkp).toLocaleDateString('id-ID', { 
                    day: '2-digit', 
                    month: 'short', 
                    year: 'numeric' 
                    }) 
                : '-'
            } 
            />
          <DetailItem label="Status" value={data.status} isStatus />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <DetailItem label="NAMA PELANGGAN" value={data.nama_plg} />
          <DetailItem label="NPA" value={data.npa} />
        </div>

        <DetailItem label="Nama Pekerjaan" value={data.ket_pekerjaan} />
        <DetailItem label="Lokasi Proyek" value={data.lokasi} />
        
        <div className="grid grid-cols-2 gap-6">
          <DetailItem label="Vendor" value={data.perusahaan_rekanan} />
        </div>

        <div className="bg-purple-50 p-4 rounded-2xl">
          <span className="text-purple-400 text-[10px] font-bold uppercase">Keterangan Tambahan</span>
          <p className="text-purple-900 text-sm font-medium mt-1 leading-relaxed">
            {data.keterangan || 'Tidak ada catatan tambahan untuk dokumen ini.'}
          </p>
        </div>
        <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 mt-4">
  <div className="flex items-center mb-4">
    <div className="bg-blue-600 text-white p-2 rounded-xl mr-3 shadow-md">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    </div>
    <h4 className="text-blue-900 font-black text-xs uppercase tracking-widest">Informasi Tiket</h4>
  </div>

  {tiketData ? (
    <div className="space-y-4">
      {/* Baris Pertama: Tanggal-tanggal */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <span className="text-blue-400 text-[10px] font-bold uppercase tracking-wider">Tgl Kontak</span>
          <p className="text-blue-900 font-bold mt-1 text-sm">
            {tiketData.tanggal_kontak 
              ? new Date(tiketData.tanggal_kontak).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) 
              : '-'}
          </p>
        </div>
        <div className="flex flex-col">
          <span className="text-blue-400 text-[10px] font-bold uppercase tracking-wider">Tgl Selesai</span>
          <p className="text-blue-900 font-bold mt-1 text-sm">
            {tiketData.tanggal_selesai 
              ? new Date(tiketData.tanggal_selesai).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) 
              : 'Belum Selesai'}
          </p>
        </div>
      </div>

      {/* Baris Kedua: Status (Full Width agar lebih menonjol) */}
      <div className="pt-2 border-t border-blue-100/50 flex justify-between items-center">
        <span className="text-blue-400 text-[10px] font-bold uppercase tracking-wider">Status Tiket</span>
        <div>
          {(() => {
            const statusStyle = getTiketStatus(tiketData.status);
            return (
              <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase border shadow-sm ${statusStyle.color}`}>
                {statusStyle.label}
              </span>
            );
          })()}
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center py-4 bg-white/60 rounded-2xl border border-dashed border-blue-200">
      <p className="text-blue-400 text-xs font-medium italic">Data tiket tidak ditemukan</p>
    </div>
  )}
</div>
    </div>

      {/* Footer Modal */}
      <div className="p-8">
        <button 
          onClick={() => setShowDetailModal(false)}
          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold active:scale-95 transition-transform"
        >
          Tutup Detail
        </button>
      </div>
    </div>
  </div>
)}
</div>
);
};

export default SPKPList;
