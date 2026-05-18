import React, { useState, useEffect } from 'react';

const PhotoPreviewCard = ({ label, imageUrl, onZoom }) => {
    const baseUrl = "http://localhost:3000/uploads/"; 
    const fullUrl = imageUrl ? `${baseUrl}${imageUrl}` : null;

    return (
        <div className="bg-white border border-slate-100 rounded-3xl p-3 shadow-sm">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 block pl-1">
                {label}
            </span>
            <div className="aspect-video w-full bg-slate-100 rounded-2xl overflow-hidden relative">
                {fullUrl ? (
                    <img 
                        src={fullUrl} 
                        alt={label}
                        className="w-full h-full object-cover active:opacity-70 transition-opacity cursor-pointer"
                        // UBAH DI SINI: Panggil fungsi zoom
                        onClick={() => onZoom(fullUrl)} 
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-300 font-bold text-[10px]">NO PHOTO</div>
                )}
            </div>
        </div>
    );
};

const SPKPSelesai = ({ user, onBack }) => {
    console.log("Data User Login:", user); // LIHAT DI KONSOL BROWSER (F12)
    const [listSelesai, setListSelesai] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [previewImage, setPreviewImage] = useState(null); // Menyimpan URL foto untuk di-zoom
    const [activeQuickFilter, setActiveQuickFilter] = useState('all'); // defaultnya 'all'
    
    const [filter, setFilter] = useState({
    search: '',
    startDate: '',
    endDate: ''
    });
    const [showFilter, setShowFilter] = useState(false); // Untuk buka-tutup panel filter

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
    setLoading(true);
    try {
        const { search, startDate, endDate } = filter;
        // Tambahkan &role=${user.role} di URL
        let url = `http://localhost:3000/api/spkp-selesai?kocab=${user.kocab}&pelaksana=${user.pelaksana}&role=${user.role}`;
        
        if (search) url += `&search=${search}`;
        if (startDate && endDate) url += `&startDate=${startDate}&endDate=${endDate}`;

        const response = await fetch(url);
        const result = await response.json();
        if (result.status === 'success') setListSelesai(result.data);
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
};

    const handleResetFilter = () => {
        setFilter({
            search: '',
            startDate: '',
            endDate: ''
        });
        setShowFilter(false);
        
        // Panggil ulang fetchData. Karena filter sudah kosong, 
        // Backend akan otomatis masuk ke "KONDISI 3" (tampil 7 hari lagi).
        fetchData(); 
    };

    const handleVerifikasi = async (no_spkp) => {
        try {
            const response = await fetch('http://localhost:3000/api/spkp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ no_spkp: no_spkp }) // Hanya kirim no_spkp
            });
            
            const result = await response.json();
            if (result.status === 'success') {
                setShowDetailModal(false); 
                // Pastikan fetchData() dipanggil agar daftar terupdate otomatis
                fetchData(); 
                
                // Opsional: Jika kamu belum buat SuccessAlert, ganti dulu dengan alert biasa
                alert("SPKP Berhasil Diverifikasi!"); 
            } else {
                alert("Gagal: " + result.message);
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            alert("Terjadi kesalahan koneksi ke server");
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
            <div className="sticky top-0 z-50 bg-slate-50">
                {/* Header Gradasi - Tema Orange */}
                <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-rose-500 p-8 rounded-b-[2.5rem] shadow-lg shadow-orange-100 flex items-center">
                    <button onClick={onBack} className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white mr-4 active:scale-90 transition-transform border border-white/20">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        {/* LOGIKA ROLE DI SINI */}
                        <h2 className="text-white text-xl font-black tracking-tight">
                            {user?.role === 'KABAG_JARINGAN' ? 'Verifikasi Pekerjaan' : 'SPKP Selesai'}
                        </h2>
                        <div className="flex items-center space-x-2 mt-1">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                            <p className="text-white/80 text-[9px] font-black uppercase tracking-[0.2em]">
                                {user?.role === 'KABAG_JARINGAN' ? 'Mode Supervisor' : 'Tugas Telah Tuntas'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* SEARCH & FILTER SECTION */}
                <div className="px-6 -mt-6">
                    <div className="bg-white rounded-[2rem] shadow-xl p-4 border border-slate-100">
                        <div className="flex items-center space-x-3">
                            {/* Input Search */}
                            <div className="relative flex-1">
                                <span className="absolute left-4 top-3.5 text-slate-400">🔍</span>
                                <input 
                                    type="text"
                                    placeholder="Cari No. SPKP..."
                                    className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-10 pr-4 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-orange-500 transition-all"
                                    value={filter.search}
                                    onChange={(e) => setFilter({...filter, search: e.target.value})}
                                />
                            </div>
                            
                            {/* Toggle Button Filter Tanggal */}
                            <button 
                                onClick={() => setShowFilter(!showFilter)}
                                className={`p-3.5 rounded-2xl transition-all ${showFilter ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600'}`}
                            >
                                📅
                            </button>

                            {/* Submit Button */}
                            <button 
                                onClick={fetchData}
                                className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                            >
                                Cari
                            </button>
                        </div>

                        {/* --- TAMBAHKAN DI SINI (HANYA UNTUK KABAG) --- */}
                        {user?.role === 'KABAG_JARINGAN' && (
                            <div className="mt-4 pt-4 border-t border-slate-50 flex justify-center items-center gap-3 pb-2">
                                
                                {/* Tombol BELUM VERIFIKASI */}
                                <button 
                                    onClick={() => {
                                        const belumVerif = listSelesai.filter(item => !item.IsVerif);
                                        setListSelesai(belumVerif);
                                        setActiveQuickFilter('unverified');
                                    }}
                                    className={`flex-1 max-w-[160px] px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all duration-500 ease-in-out border-2 flex items-center justify-center space-x-2 ${
                                        activeQuickFilter === 'unverified' 
                                        ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-200 scale-105 z-10' 
                                        : 'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100 scale-100'
                                    }`}
                                >
                                    {/* Dot Indicator yang halus */}
                                    <div className={`relative flex h-2 w-2 transition-opacity duration-500 ${activeQuickFilter === 'unverified' ? 'opacity-0 w-0' : 'opacity-100'}`}>
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                                    </div>
                                    <span>Belum Verifikasi</span>
                                </button>

                                {/* Tombol SEMUA DATA */}
                                <button 
                                    onClick={() => {
                                        fetchData();
                                        setActiveQuickFilter('all');
                                    }}
                                    className={`flex-1 max-w-[160px] px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all duration-500 ease-in-out border-2 flex items-center justify-center ${
                                        activeQuickFilter === 'all' 
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200 scale-105 z-10' 
                                        : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100 scale-100'
                                    }`}
                                >
                                    Semua Data
                                </button>
                            </div>
                        )}

                        {/* Expandable Date Filter */}
                        {showFilter && (
                            <div className="mt-4 pt-4 border-t border-dashed border-slate-200 animate-in slide-in-from-top-2 duration-300">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-3 ml-1 tracking-widest">Rentang Tanggal SPKP</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-bold text-slate-400 ml-2 uppercase">Dari</label>
                                        <input 
                                            type="date" 
                                            className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-bold text-slate-600"
                                            value={filter.startDate}
                                            onChange={(e) => setFilter({...filter, startDate: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-bold text-slate-400 ml-2 uppercase">Sampai</label>
                                        <input 
                                            type="date" 
                                            className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-bold text-slate-600"
                                            value={filter.endDate}
                                            onChange={(e) => setFilter({...filter, endDate: e.target.value})}
                                        />
                                    </div>
                                </div>
                                
                                {/* Reset Button */}
                                <button 
                                    onClick={() => {
                                        setFilter({search: '', startDate: '', endDate: ''});
                                        setShowFilter(false);
                                    }}
                                    className="w-full mt-4 text-[9px] font-black text-rose-500 uppercase tracking-widest py-2 italic"
                                >
                                    × Bersihkan Filter
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            

            {/* List Tugas Selesai */}
            <div className="flex-1 overflow-y-auto px-6 pt-6 pb-24 scroll-smooth space-y-4">
                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto"></div>
                        <p className="text-slate-400 text-xs font-bold mt-4 uppercase">Memuat Data...</p>
                    </div>
                ) : listSelesai.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[3rem] shadow-sm border border-dashed border-slate-200">
                        <span className="text-4xl">📁</span>
                        <p className="text-slate-400 text-xs font-bold mt-4 uppercase">Belum ada tugas selesai</p>
                    </div>
                ) : (
                    listSelesai.map((item) => (
                        <div 
                            key={item.no_spkp} 
                            onClick={() => { setSelectedTask(item); setShowDetailModal(true); }}
                            className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden active:scale-[0.98] transition-all border-l-8 border-l-emerald-500"
                         >
                            <div className="p-6">
                                {/* Header Card */}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">No. SPKP</span>
                                        <h3 className="text-lg font-black text-slate-800 leading-none">{item.no_spkp}</h3>
                                    </div>
                                    <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black italic">
                                        SELESAI
                                    </span>
                                </div>
                                
                                {/* Detail Pelanggan & Tgl */}
                                <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-4 pb-4">
                                    <div>
                                        <span className="text-[9px] text-slate-400 font-bold uppercase">Pelanggan</span>
                                        <p className="text-xs font-bold text-slate-700 truncate">{item.nama_plg}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[9px] text-slate-400 font-bold uppercase">Tgl SPKP</span>
                                        <p className="text-xs font-bold text-slate-700">
                                            {item.tgl_spkp ? new Date(item.tgl_spkp).toLocaleDateString('id-ID') : '-'}
                                        </p>
                                    </div>
                                </div>

                                {/* NOTED VERIFIKASI (BAGIAN BARU) */}
                                <div className={`mt-2 p-3 rounded-2xl flex items-center space-x-2 border ${
                                    item.IsVerif == 1 || item.IsVerif == "1" 
                                    ? 'bg-emerald-50 border-emerald-100' 
                                    : 'bg-orange-50 border-orange-100'
                                }`}>
                                    {/* Icon Status */}
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                        item.IsVerif == 1 || item.IsVerif == "1" ? 'bg-emerald-500' : 'bg-orange-500'
                                    }`}>
                                        {item.IsVerif == 1 || item.IsVerif == "1" ? (
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M12 8v4l3 3" />
                                            </svg>
                                        )}
                                    </div>

                                    {/* Teks Status */}
                                    <div>
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">
                                            Status Verifikasi
                                        </span>
                                        <p className={`text-[10px] font-black uppercase tracking-tight ${
                                            item.IsVerif == 1 || item.IsVerif == "1" ? 'text-emerald-700' : 'text-orange-700'
                                        }`}>
                                            {item.IsVerif == 1 || item.IsVerif == "1" ? 'Sudah Diverifikasi Kabag' : 'Menunggu Verif Kabag Jaringan'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            {/* Info Badge */}
            {!filter.startDate && (
                <div className="px-8 mt-4">
                    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-3 flex items-center space-x-3">
                        <span className="text-lg">ℹ️</span>
                        <p className="text-[9px] font-bold text-orange-700 uppercase leading-tight tracking-wide">
                            Menampilkan data 7 hari terakhir. Gunakan filter tanggal untuk melihat data yang lebih lama.
                        </p>
                    </div>
                </div>
            )}

            {/* Modal Detail (View Only + Foto) */}
            {showDetailModal && selectedTask && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[110] p-4 flex items-end justify-center">
                    <div className="bg-white w-full max-w-lg max-h-[92vh] rounded-[3rem] overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-300">
                        
                        {/* Header Modal */}
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
                            <div>
                                <h3 className="text-xl font-black text-slate-800">Detail Selesai</h3>
                                <p className="text-[10px] font-bold text-emerald-500 uppercase mt-1 tracking-widest">{selectedTask.no_spkp}</p>
                            </div>
                            <button onClick={() => setShowDetailModal(false)} className="w-10 h-10 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center font-bold active:scale-90 transition-transform">✕</button>
                        </div>

                        {/* Content Area (Scrollable) */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 pb-12">
                            
                            {/* Section 1: Info Data */}
                            <div className="bg-slate-50 p-6 rounded-[2.5rem] space-y-4 border border-slate-100 shadow-inner">
                                <div className="flex justify-between border-b border-slate-200 pb-2">
                                    <span className="text-[9px] font-black text-slate-400 uppercase">Pelanggan</span>
                                    <span className="text-[10px] font-bold text-slate-700 uppercase">{selectedTask.nama_plg}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-200 pb-2">
                                    <span className="text-[9px] font-black text-slate-400 uppercase">NPA</span>
                                    <span className="text-[10px] font-bold text-slate-700 uppercase">{selectedTask.npa}</span>
                                </div>
                                {/* Layout Stacked untuk Lokasi agar tidak jelek jika panjang */}
                                <div className="border-b border-slate-200 pb-2">
                                    <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Lokasi</span>
                                    <p className="text-[11px] font-bold text-slate-700 uppercase leading-relaxed">{selectedTask.lokasi}</p>
                                </div>
                                <div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Pekerjaan</span>
                                    <p className="text-[11px] font-bold text-slate-700 uppercase leading-relaxed">{selectedTask.ket_pekerjaan}</p>
                                </div>
                            </div>

                            {/* Section 2: Bukti Foto (Grid) */}
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <div className="h-4 w-1 bg-orange-500 rounded-full"></div>
                                    <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Dokumentasi Foto</h4>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {/* Di dalam grid foto modal detail */}
                                    <PhotoPreviewCard 
                                        label="Foto Sebelum" 
                                        imageUrl={selectedTask.fot_sebelum} 
                                        onZoom={(url) => setPreviewImage(url)} 
                                    />
                                    <PhotoPreviewCard 
                                        label="Foto Proses" 
                                        imageUrl={selectedTask.fot_proses} 
                                        onZoom={(url) => setPreviewImage(url)} 
                                    />
                                    <PhotoPreviewCard 
                                        label="Foto Sesudah" 
                                        imageUrl={selectedTask.fot_sesudah} 
                                        onZoom={(url) => setPreviewImage(url)} 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer Modal Detail */}
                        <div className="p-8 bg-white border-t border-slate-50 flex gap-3">
                            {/* Tombol Tutup selalu ada */}
                            <button 
                                onClick={() => setShowDetailModal(false)}
                                className="flex-1 bg-slate-100 text-slate-500 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                            >
                                Kembali
                            </button>

                            {/* Gunakan logika ini agar lebih aman */}
                                {/* Logika: Tampilkan jika Role Kabag DAN IsVerif adalah Falsy (null, 0, false, atau undefined) */}
                            {user?.role === 'KABAG_JARINGAN' && !selectedTask?.IsVerif && (
                                <button 
                                    onClick={() => handleVerifikasi(selectedTask.no_spkp)}
                                    className="flex-[2] bg-emerald-600 text-white py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-100 active:scale-95 transition-all flex items-center justify-center space-x-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Verifikasi Kerja</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* MODAL ZOOM FOTO (LIGHTBOX) */}
            {previewImage && (
                <div 
                    className="fixed inset-0 bg-slate-950/95 backdrop-blur-lg z-[200] flex flex-col items-center justify-center p-6 animate-in fade-in duration-300"
                    onClick={() => setPreviewImage(null)} // Klik di mana saja untuk tutup
                >
                    {/* Tombol Tutup */}
                    <button className="absolute top-10 right-6 w-12 h-12 bg-white/10 text-white rounded-full flex items-center justify-center text-xl border border-white/20">
                        ✕
                    </button>

                    {/* Gambar Besar */}
                    <div className="w-full max-w-4xl max-h-[70vh] flex items-center justify-center">
                        <img 
                            src={previewImage} 
                            className="max-w-full max-h-full rounded-2xl shadow-2xl border-2 border-white/10 animate-in zoom-in-95 duration-300"
                            alt="Preview"
                            onClick={(e) => e.stopPropagation()} // Mencegah tutup jika gambar yang diklik
                        />
                    </div>

                    <p className="text-white/50 text-[10px] font-bold uppercase mt-8 tracking-[0.3em]">
                        Sentuh di mana saja untuk kembali
                    </p>
                </div>
)}
        </div>
    
    );
};

export default SPKPSelesai;