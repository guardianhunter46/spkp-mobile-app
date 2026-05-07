import React, { useState, useEffect } from 'react';

const UserList = ({ onBack }) => {
  const [selectedCabang, setSelectedCabang] = useState('');
  const [users, setUsers] = useState([]);
  const [listCabang, setListCabang] = useState([]); // State untuk menampung cabang dari DB
  const [loading, setLoading] = useState(false);
  const [loadingCabang, setLoadingCabang] = useState(true);

  // 1. Ambil daftar cabang saat komponen pertama kali dimuat
  useEffect(() => {
    const fetchCabang = async () => {
      try {
        const response = await fetch('http://localhost:3000/list-cabang');
        const result = await response.json();
        if (result.status === 'success') {
          setListCabang(result.data);
        }
      } catch (error) {
        console.error("Gagal mengambil daftar cabang:", error);
      } finally {
        setLoadingCabang(false);
      }
    };
    fetchCabang();
  }, []);

  // 2. Fungsi ambil user berdasarkan cabang (tetap sama)
  const fetchUsersByCabang = async (cabang) => {
    if (!cabang) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/users?cabang=${encodeURIComponent(cabang)}`);
      const data = await response.json();
      setUsers(data.status === 'success' ? data.data : []);
    } catch (error) {
      console.error("Error fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 relative">
      {/* Header dengan Tombol Back */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-6 rounded-b-[2.5rem] shadow-lg flex items-center">
        <button onClick={onBack} className="p-2 bg-white/20 rounded-xl text-white mr-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-white text-xl font-bold">Daftar User</h2>
      </div>

      {/* Selector Cabang Dinamis */}
      <div className="px-6 mt-8">
        <label className="block text-sm font-bold text-slate-700 mb-2">Pilih Cabang Terlebih Dahulu</label>
        <div className="relative">
          <select 
            disabled={loadingCabang}
            className="w-full p-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none appearance-none font-semibold text-slate-600 disabled:bg-slate-100"
            value={selectedCabang}
            onChange={(e) => {
              setSelectedCabang(e.target.value);
              fetchUsersByCabang(e.target.value);
            }}
          >
            <option value="">{loadingCabang ? 'Memuat Cabang...' : '-- Pilih Cabang --'}</option>
            {listCabang.map((cabang, idx) => (
              <option key={idx} value={cabang}>{cabang}</option>
            ))}
          </select>
          {/* Icon Panah Kecil */}
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>

      {/* Daftar User */}
      <div className="px-6 mt-8">
        {!selectedCabang ? (
          <div className="text-center py-20 opacity-40">
            <span className="text-6xl block mb-4">📍</span>
            <p className="text-slate-500 font-medium">Silakan pilih cabang untuk<br/>melihat data user</p>
          </div>
        ) : loading ? (
          <div className="text-center py-20 text-emerald-600 font-bold">Memuat Data...</div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Total: {users.length} User</p>
            {users.length > 0 ? users.map((user, idx) => (
              <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center font-bold">
                  {(user.pelaksana || user.role || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800">{user.pelaksana || user.role}</h4>
                  <p className="text-xs text-slate-500 font-medium">{user.role} - {user.username}</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-200"></div>
              </div>
            )) : (
              <p className="text-center text-slate-400 py-10">Tidak ada user di cabang ini.</p>
            )}
          </div>
        )}
      </div>
      <button 
        onClick={() => alert("Tambah User Baru")} // Nanti kita ganti dengan fungsi buka form
        className="fixed bottom-8 right-6 w-16 h-16 bg-emerald-600 text-white rounded-full shadow-[0_8px_30px_rgb(5,150,105,0.4)] flex items-center justify-center hover:bg-emerald-700 active:scale-95 transition-all duration-200 z-50"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-8 w-8" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={3} 
            d="M12 4v16m8-8H4" 
          />
        </svg>
      </button>
    </div>
  );
};

export default UserList;