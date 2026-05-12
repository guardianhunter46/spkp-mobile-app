import React, { useState, useEffect } from 'react';

const UserList = ({ onBack }) => {
// State untuk List & Filter
const [selectedCabang, setSelectedCabang] = useState('');
const [users, setUsers] = useState([]);
const [listCabang, setListCabang] = useState([]);
const [loading, setLoading] = useState(false);
const [loadingCabang, setLoadingCabang] = useState(true);
const [showSuccessAlert, setShowSuccessAlert] = useState(false);
const [listRekanan, setListRekanan] = useState([]);

// State untuk Form Tambah
const [showForm, setShowForm] = useState(false);
const [showPassword, setShowPassword] = useState(false);
const [isEditMode, setIsEditMode] = useState(false);
const [formData, setFormData] = useState({
username: '', password: '', role: '', cabang: '', kocab: '', pelaksana: ''
});

// 1. Ambil daftar cabang (Dipakai Filter & Form)
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

// 2. Fungsi Filter: Ambil user untuk ditampilkan di List
const fetchUsersByCabang = async (cabang) => {
    if (!cabang) {
        setUsers([]);
        return;
    }
        setLoading(true);
        try {
    const response = await fetch(`http://localhost:3000/users?cabang=${encodeURIComponent(cabang)}`);
    const data = await response.json();
        setUsers(data.status === 'success' ? data.data : []);
    }    catch (error) {
        console.error("Error fetch users:", error);
    } finally {
    setLoading(false);
    }
};

// 3. Fungsi Form: Handle Perubahan Cabang di Input Tambah (Auto-fill Kocab)
const handleFormCabangChange = (e) => {
    const selectedCabang = e.target.value;
    const found = listCabang.find(c => c.cabang === selectedCabang);
    const newKocab = found ? found.kocab : '';

    setFormData({
        ...formData,
        cabang: selectedCabang,
        kocab: newKocab,
        pelaksana: '' // Reset pelaksana jika cabang ganti
    });

    // Panggil fetch rekanan berdasarkan kocab baru
    fetchRekananByKocab(newKocab);
};

// 4. Submit Tambah User
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Siapkan data yang akan dikirim
  const dataToSubmit = {
    ...formData,
    // Jika ADMIN, paksa pelaksana menjadi null secara eksplisit
    pelaksana: (formData.role === 'ADMIN' || formData.role === 'KABAG_JARINGAN') ? null : formData.pelaksana
  };

  // Tentukan URL dan Method berdasarkan mode
  const url = isEditMode ? 'http://localhost:3000/users/update' : 'http://localhost:3000/users/add';
  const method = isEditMode ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSubmit)
    });
    
    const result = await res.json();
    if (result.status === 'success') {
      // 1. Tutup Form Utama
      setShowForm(false);
      // 2. Tampilkan Alert Sukses
      setShowSuccessAlert(true);
      // Reset form
      setFormData({ username: '', password: '', role: '', cabang: '', kocab: '', pelaksana: '' });
      setIsEditMode(false);
      // Refresh daftar user
      fetchUsersByCabang(selectedCabang);
      // 4. (Opsional) Tutup alert otomatis setelah 3 detik
      setTimeout(() => setShowSuccessAlert(false), 3000);
    }
  } catch (err) {
    console.error("Gagal simpan");
  }
};

const handleEditClick = (user) => {
  setIsEditMode(true);

  console.log("User yang diedit:", user);

  setFormData({
    username: user.username,
    password: '', // Password dikosongkan (biasanya edit user tidak ganti password di sini)
    role: user.role,
    cabang: user.cabang || '', 
    kocab: user.kocab || '',
    pelaksana: user.pelaksana || ''
  });
  setShowForm(true);
};

const fetchRekananByKocab = async (kocab) => {
    if (!kocab) {
        setListRekanan([]);
        return;
    }
    try {
        const response = await fetch(`http://localhost:3000/api/rekanan/${kocab}`);
        const result = await response.json();
        if (result.status === 'success') {
            setListRekanan(result.data);
        }
    } catch (err) {
        console.error("Gagal load rekanan:", err);
    }
};

return (

<div className="min-h-screen bg-slate-50 pb-24 relative">
{/* ALERT SUKSES ANIMASI */}
{showSuccessAlert && (
  <div className="fixed inset-0 flex items-center justify-center z-[100] px-6">
    {/* Backdrop Blur */}
    <div className="absolute inset-0 bg-emerald-900/20 backdrop-blur-sm"></div>
    
    {/* Card Alert */}
    <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl w-full max-w-sm text-center relative animate-in fade-in zoom-in duration-300">
      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h3 className="text-2xl font-bold text-slate-800 mb-2">Berhasil!</h3>
      <p className="text-slate-500 mb-8">Data user baru telah berhasil disimpan ke sistem.</p>
      
      <button 
        onClick={() => setShowSuccessAlert(false)}
        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold active:scale-95 transition-transform"
      >
        Mantap!
      </button>
    </div>
  </div>
)}
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
            <select disabled={loadingCabang}
                className="w-full p-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none appearance-none font-semibold text-slate-600 disabled:bg-slate-100"
                value={selectedCabang} onChange={(e)=> {
                setSelectedCabang(e.target.value);
                fetchUsersByCabang(e.target.value);
                }}
                >
                <option value="">{loadingCabang ? 'Memuat...' : '-- Pilih Cabang --'}</option>
                {listCabang.map((item, idx) => (
                // item sekarang adalah objek {kocab, cabang}
                <option key={idx} value={item.cabang}>{item.cabang}</option>
                ))}
            </select>
            {/* Icon Panah Kecil */}
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
    </div>

    {/* Daftar User */}
    <div className="px-6 mt-8">
        {!selectedCabang ? (
        <div className="text-center py-20 opacity-40">
            <span className="text-6xl block mb-4">📍</span>
            <p className="text-slate-500 font-medium">Silakan pilih cabang untuk<br />melihat data user</p>
        </div>
        ) : loading ? (
        <div className="text-center py-20 text-emerald-600 font-bold">Memuat Data...</div>
        ) : (
        <div className="space-y-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Total: {users.length} User
            </p>
            {users.length > 0 ? users.map((user, idx) => (
            <div key={idx}
                onClick={() => handleEditClick(user)}
                className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
                <div
                    className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center font-bold">
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

    {/* FAB BUTTON (MELAYANG) */}
    {!showForm && (
        <button 
            type="button"
            onClick={() => {
            setIsEditMode(false);
            setFormData({ username: '', password: '', role: '', cabang: '', kocab: '', pelaksana: '' });
            setShowForm(true);
            }}
            className="fixed bottom-8 right-6 w-16 h-16 bg-emerald-600 text-white rounded-full shadow-[0_8px_30px_rgb(16,185,129,0.4)] flex items-center justify-center z-[60] active:scale-90 transition-all hover:bg-emerald-700"
            >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
        </button>
)}

    {/* MODAL FORM TAMBAH USER */}
{showForm && (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
        <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">
                    {isEditMode ? 'Edit User' : 'Tambah User Baru'}
                </h3>
                <button onClick={() => setShowForm(false)} className="text-slate-400 text-3xl">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Input Username */}
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Username</label>
                    <input 
                        required 
                        placeholder="Username"
                        readOnly={isEditMode} // Username tidak boleh diubah saat edit
                        value={formData.username}
                        className={`w-full p-4 border border-slate-100 rounded-2xl outline-none transition-all ${
                            isEditMode ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-slate-50 text-slate-800 focus:ring-2 focus:ring-emerald-500'
                        }`} 
                        onChange={(e) => setFormData({...formData, username: e.target.value})} 
                    />
                </div>

                {/* Input Password - Muncul di Tambah & Edit */}
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                        {isEditMode ? 'Reset Password (Kosongkan jika tidak diubah)' : 'Password'}
                    </label>
                    <div className="relative">
                        <input 
                        // Saat edit tidak wajib diisi (opsional), saat tambah wajib (required)
                        required={!isEditMode} 
                        placeholder={isEditMode ? "Masukkan password baru" : ""} 
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all" 
                        onChange={(e) => setFormData({...formData, password: e.target.value})} 
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-4 text-slate-400">
                        {showPassword ? "🙈" : "👁️"}
                        </button>
                    </div>
                </div>

                {/* Select Role */}
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Role</label>
                    <select 
                        required 
                        value={formData.role}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500" 
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                    >
                        <option value="">-- Pilih Role --</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="REKANAN">REKANAN</option>
                        <option value="KABAG_JARINGAN">KABAG_JARINGAN</option>
                    </select>
                </div>

                {/* Grid Cabang & Kocab */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Cabang</label>
                        <select 
                            required 
                            value={formData.cabang}
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500" 
                            onChange={handleFormCabangChange}
                        >
                            <option value="">-- Cabang --</option>
                            {listCabang.map((c, i) => (
                                <option key={i} value={c.cabang}>{c.cabang}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Kocab</label>
                        <input 
                            readOnly 
                            placeholder="Kocab" 
                            value={formData.kocab}
                            className="w-full p-4 bg-slate-200 border border-slate-100 rounded-2xl font-bold text-slate-600 cursor-not-allowed" 
                        />
                    </div>
                </div>

                {/* Input Pelaksana (Sekarang menggunakan Select) */}
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Nama Pelaksana</label>
                    <select 
                        disabled={formData.role === 'ADMIN' || formData.role === 'KABAG_JARINGAN' || !formData.kocab} 
                        value={(formData.role === 'ADMIN' || formData.role === 'KABAG_JARINGAN') ? '' : formData.pelaksana}
                        required={formData.role !== 'ADMIN' && formData.role !== 'KABAG_JARINGAN'}
                        className={`w-full p-4 border border-slate-100 rounded-2xl transition-all duration-300 outline-none appearance-none ${
                            (formData.role === 'ADMIN' || formData.role === 'KABAG_JARINGAN') 
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed italic' 
                            : 'bg-slate-50 text-slate-800 focus:ring-2 focus:ring-emerald-500'
                        }`}
                        onChange={(e) => setFormData({...formData, pelaksana: e.target.value})} 
                    >
                        {/* Logika Label Option */}
                        { (formData.role === 'ADMIN' || formData.role === 'KABAG_JARINGAN') ? (
                            <option value="">Otomatis NULL</option>
                        ) : !formData.cabang ? (
                            <option value="">-- Pilih Cabang Terlebih Dahulu --</option>
                        ) : (
                            <>
                                <option value="">-- Pilih Pelaksana --</option>
                                {listRekanan.map((r, i) => (
                                    <option key={i} value={r.pelaksana}>{r.pelaksana}</option>
                                ))}
                            </>
                        )}
                    </select>
                    
                    {/* Info tambahan jika cabang sudah dipilih tapi rekanan kosong */}
                    {!loading && formData.cabang && listRekanan.length === 0 && formData.role !== 'ADMIN' && (
                        <p className="text-[10px] text-red-500 font-bold mt-1 ml-2">⚠️ Tidak ada rekanan di cabang ini</p>
                    )}
                </div>

                {/* Submit Button */}
                <button 
                    type="submit"
                    className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100 mt-4 active:scale-95 transition-transform"
                >
                    {isEditMode ? 'Simpan Perubahan' : 'Simpan User Baru'}
                </button>
            </form>
        </div>
    </div>
)}
</div>
);
};

export default UserList;
