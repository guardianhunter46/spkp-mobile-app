import React, { useState, useEffect } from 'react';

const PhotoUpload = ({ label, id, onFileSelect }) => {
  const [preview, setPreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onFileSelect(id, file); // Kirim file ke komponen utama
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Agar tidak memicu klik pada input file
    setPreview(null);
    onFileSelect(id, null); // Hapus file di state utama
  };

  return (
    <div className="relative group">
      <div className={`border-2 border-dashed ${preview ? 'border-purple-300 bg-slate-100' : 'border-slate-200 bg-slate-50'} p-2 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden min-h-[200px] transition-colors`}>
        
        {preview ? (
          <>
            {/* Tampilan Foto Utuh */}
            {/* object-contain memastikan foto tampil utuh tanpa terpotong, 
                w-full h-full p-2 memberikan sedikit ruang agar tidak mepet border */}
            <img 
              src={preview} 
              alt="preview" 
              className="w-full h-full object-contain p-2 z-0" 
            />
            
            {/* Tombol Cancel / Hapus */}
            <button
              onClick={handleCancel}
              className="absolute top-3 right-3 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm active:scale-90 transition-transform z-10"
              title="Hapus Foto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Keterangan Label saat foto ada, dipindah ke tengah bawah */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-800/80 backdrop-blur-sm px-3 py-1 rounded-full z-10">
               <p className="text-[9px] font-black text-white uppercase tracking-wider">{label}</p>
            </div>
          </>
        ) : (
          /* Tampilan Kosong */
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-2 text-2xl border border-slate-100">
              📸
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <p className="text-[8px] text-slate-300 font-bold mt-1 uppercase tracking-tighter">Akses Kamera</p>
          </div>
        )}

        {/* Input File asli */}
        {!preview && (
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange}
            className="absolute inset-0 opacity-0 cursor-pointer z-0" 
          />
        )}
      </div>
    </div>
  );
};

const SPKPProses = ({ user, onBack }) => {
    const [listProses, setListProses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showReportingModal, setShowReportingModal] = useState(false);

    // State untuk menyimpan file foto
    const [files, setFiles] = useState({
        fot_sebelum: null,
        fot_proses: null,
        fot_sesudah: null
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch(
                `http://localhost:3000/api/spkp-proses?kocab=${user.kocab}&pelaksana=${user.pelaksana}`
            );
            const result = await response.json();
            if (result.status === 'success') {
                setListProses(result.data);
            }
        } catch (err) {
            console.error("Gagal mengambil data proses");
        } finally {
            setLoading(false);
        }
    };

    // Fungsi untuk menangani perubahan file (PENTING: Agar tidak blank)
    const handleFileChange = (id, file) => {
        setFiles(prev => ({ ...prev, [id]: file }));
    };

    const handleSendReport = () => {
        console.log("File yang akan dikirim:", files);
        alert("Mengirim Laporan...");
        // Di sini nanti kita buat logic FormData
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-10">
            {/* Header - Identik dengan SPKPList */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 rounded-b-[2.5rem] shadow-lg flex items-center">
                <button onClick={onBack} className="p-2 bg-white/20 rounded-xl text-white mr-4 active:scale-90 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div>
                    <h2 className="text-white text-xl font-bold">SPKP Dalam Proses</h2>
                    <p className="text-purple-100 text-[10px] font-bold uppercase tracking-widest opacity-80">{user.pelaksana}</p>
                </div>
            </div>

            {/* Content Area */}
            <div className="px-6 mt-8">
                {loading && (
                    <div className="text-center font-bold text-purple-600 animate-pulse py-10">
                        Menarik data tugas...
                    </div>
                )}

                {!loading && listProses.length > 0 ? (
                    <div className="space-y-6">
                        {listProses.map((item) => (
                            <div 
                                key={item.no_spkp}
                                onClick={() => {setSelectedTask(item); setShowReportingModal(true);}}
                                className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500"
                                >
                                {/* Card Header - Purple Accent */}
                                <div className="bg-purple-50 p-6 border-b border-purple-100 flex justify-between items-center">
                                    <div>
                                        <span className="text-purple-600 text-[10px] font-bold uppercase tracking-widest">Nomor SPKP</span>
                                        <h3 className="text-xl font-black text-slate-800 mt-1">{item.no_spkp}</h3>
                                    </div>
                                    <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black border border-amber-200">
                                        PROSES
                                    </span>
                                </div>

                                <div className="p-6 space-y-5">
                                {/* Baris Pelanggan & Tanggal Lapor */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Pelanggan</span>
                                            <p className="text-slate-800 font-bold text-sm truncate">{item.nama_plg || '-'}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Tgl Lapor</span>
                                            <p className="text-slate-800 font-bold text-sm">
                                                {item.tgl_lapor 
                                                    ? new Date(item.tgl_lapor).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) 
                                                    : '-'}
                                            </p>
                                        </div>
                                    </div>

                                {/* Pekerjaan */}
                                    <div>
                                        <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Pekerjaan</span>
                                        <p className="text-slate-800 font-bold text-sm line-clamp-1">{item.ket_pekerjaan || '-'}</p>
                                    </div>

                                    {/* Footer Link */}
                                    <div className="pt-2 text-center text-blue-500 text-[9px] font-black uppercase tracking-widest border-t border-slate-50">
                                        Klik Untuk Lapor Progres
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : !loading && (
                    <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 mx-2">
                        <span className="text-6xl block mb-4">📥</span>
                        <p className="font-bold text-slate-400">Belum ada tugas untuk Anda</p>
                    </div>
                )}
            </div>
            {showReportingModal && selectedTask && (
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[110] p-4 flex items-end justify-center">
                <div className="bg-white w-full max-w-lg max-h-[90vh] rounded-[3rem] overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-300">
                    
                    {/* 1. Header Modal (DIAM) */}
                    <div className="p-6 sm:p-8 border-b border-slate-50 flex justify-between items-center bg-white z-10">
                        <div>
                            <h3 className="text-xl font-black text-slate-800">Laporan Progres</h3>
                            <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mt-1">
                                {selectedTask.no_spkp}
                            </p>
                        </div>
                        <button 
                            onClick={() => setShowReportingModal(false)} 
                            className="w-10 h-10 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center active:scale-90 transition-transform font-bold"
                        >
                            ✕
                        </button>
                    </div>

                    {/* 2. Body Modal (SCROLLABLE AREA) */}
                    <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 scrollbar-hide">
                        
                        {/* Info Ringkas Kartu */}
                        <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 shadow-inner">
                            <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                                <div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Pelanggan</span>
                                    <p className="text-xs font-bold text-slate-700 leading-tight">{selectedTask.nama_plg || '-'}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">NPA</span>
                                    <p className="text-xs font-bold text-slate-700 leading-tight">{selectedTask.npa || '-'}</p>
                                </div>
                                <div className="col-span-2 pt-2 border-t border-slate-200/50">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Pekerjaan</span>
                                    <p className="text-xs font-bold text-slate-700 leading-tight">{selectedTask.ket_pekerjaan || '-'}</p>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Lokasi</span>
                                    <p className="text-xs font-bold text-slate-700 leading-tight">{selectedTask.lokasi || '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Input Foto Section */}
                        <div className="grid grid-cols-1 gap-6 pb-4">
                            <PhotoUpload 
                                label="Foto Sebelum" 
                                id="fot_sebelum" 
                                onFileSelect={handleFileChange} 
                            />
                            <PhotoUpload 
                                label="Foto Proses" 
                                id="fot_proses" 
                                onFileSelect={handleFileChange} 
                            />
                            <PhotoUpload 
                                label="Foto Sesudah" 
                                id="fot_sesudah" 
                                onFileSelect={handleFileChange} 
                            />
                        </div>
                    </div>

                    {/* 3. Footer Modal (DIAM/STICKY DI BAWAH) */}
                    <div className="p-6 sm:p-8 bg-white border-t border-slate-50">
                        <button 
                            className="w-full bg-emerald-600 text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-100 active:scale-95 transition-all flex items-center justify-center space-x-2"
                            onClick={() => alert('Mengirim Laporan Data...')}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Kirim Laporan SPKP</span>
                        </button>
                        <p className="text-[8px] text-center text-slate-400 font-bold uppercase mt-3 tracking-tighter">
                            Pastikan koordinat GPS & foto sudah jelas
                        </p>
                    </div>
                </div>
            </div>
        )}
        </div>
    );
};

export default SPKPProses;