import React, { useState, useEffect } from 'react'; // Tambahkan useEffect
import logoApp from './assets/tirtanadi-transparant.png';
import Dashboard from './Dashboard';
import UserList from './UserList';
import SPKPList from './SPKPList';
import SPKPProses from './SPKPProses';
import SPKPSelesai from './SPKPSelesai';

function App() {
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [userData, setUserData] = useState(null);
const [username, setUsername] = useState('');
const [password, setPassword] = useState('');
const [loading, setLoading] = useState(false);
const [errorMsg, setErrorMsg] = useState('');
const [showPassword, setShowPassword] = useState(false);
const [loadingApp, setLoadingApp] = useState(true); // State untuk loading awal aplikasi
const [view, setView] = useState('dashboard');

// --- CEK SESI SAAT APLIKASI DIBUKA ---
  useEffect(() => {
    const savedUser = localStorage.getItem('user_session');
    if (savedUser) {
      setUserData(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
    setLoadingApp(false); // Selesai mengecek
  }, []);

const handleLogin = async (e) => {
e.preventDefault();

// --- VALIDASI AWAL ---
  if (!username.trim() || !password.trim()) {
    setErrorMsg("Username dan Password tidak boleh kosong!");
    return; // Berhenti di sini, jangan lanjut ke fetch
  }

setLoading(true);
setErrorMsg('');

// Masukkan URL Web App GAS yang baru saja Anda deploy
// const scriptURL =
// 'https://script.google.com/macros/s/AKfycbxwajPcxZHhZGQFgIM9fZ1J28of7T5zKpsxF4JxTkRWIQuiJyowpQTle4fgUM1ZBrzB/exec';
const scriptURL = 'http://localhost:3000/login'; // API NODE.JS (Baru)


try {
  const response = await fetch(scriptURL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  // Pastikan respon dari server ok (status 200-299)
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Gagal melakukan autentikasi");
    }

  const result = await response.json();

  if (result.status === 'success') {
    // 2. Simpan ke localStorage agar sesi tetap aktif setelah refresh/tutup browser
    // Simpan seluruh objek user termasuk pelaksana, role, dan cabang
    localStorage.setItem('user_session', JSON.stringify(result.user));
    // 3. Update State untuk transisi ke Dashboard
    setUserData(result.user); 
    setIsLoggedIn(true); 

    // Notifikasi opsional (bisa dihapus jika ingin lebih instan)
      console.log("Login sukses untuk:", result.user.username);
    } else {
      setErrorMsg(result.message || "User atau Password salah");
    }
} catch (error) {
    console.error("Login Error:", error);
    // Cek apakah error karena masalah jaringan (API mati) atau error dari server
    setErrorMsg(
      error.message === "Failed to fetch" 
      ? "Gagal terhubung ke API. Pastikan server Node.js sudah jalan." 
      : error.message
    );
  } finally {
    setLoading(false);
  }
};

const handleLogout = () => {
    localStorage.removeItem('user_session'); // Hapus data simpanan
    setIsLoggedIn(false);
    setUserData(null);
    setUsername('');
    setPassword('');
  };

  
  if (loadingApp) {
    return (
      <div className="min-h-screen bg-blue-500 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

 // B. Jika sudah Login
  if (isLoggedIn && userData) {
    if (view === 'userList') {
      return <UserList onBack={() => setView('dashboard')} />;
    }

    if (view === 'spkpList') {
    return <SPKPList onBack={() => setView('dashboard')} />;
  }
    if (view === 'spkpProses') {
        return <SPKPProses user={userData} onBack={() => setView('dashboard')} />;
    }

    if (view === 'spkpSelesai') {
        return <SPKPSelesai user={userData} onBack={() => setView('dashboard')} />;
    }

    return (
    <Dashboard 
        userData={userData} 
        onLogout={handleLogout} 
        onOpenUserList={() => setView('userList')} 
        onOpenSPKP={() => setView('spkpList')} // PASTIKAN BARIS INI ADA
        onOpenSPKPProses={() => setView('spkpProses')}
        onOpenSPKPSelesai={() => setView('spkpSelesai')}
    />
    );
  }

return (
<div className="min-h-screen bg-slate-50 flex flex-col justify-center px-6 py-12">
    {/* Container Utama */}
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Kotak Biru dengan Logo & Teks */}
        <div className="flex justify-center">
            <div
                className="w-52 h-36 bg-blue-500 rounded-3xl shadow-xl flex flex-col items-center justify-center p-2 space-y-0">
                {/* 1. Logo Perusahaan (Ukuran kecil di atas) */}
                <img src={logoApp} alt="Logo" className="w-28 h-28 object-contain" />

                {/* 2. Teks SPKP (Di bawah logo) */}
                <span className="text-white text-2xl font-bold tracking-wider leading-none">
                    SPKP
                </span>
            </div>
        </div>

        <h2 className="mt-8 text-center text-3xl font-extrabold tracking-tight text-slate-900">
            Selamat Datang
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
            Silakan masuk ke akun Anda
        </p>
    </div>

    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-2xl shadow-slate-200 rounded-3xl border border-slate-100">

            {/* --- ALERT ERROR START --- */}
            {errorMsg && (
            <div className="mb-6 flex items-center p-4 text-sm text-red-800 border-t-4 border-red-500 bg-red-50 rounded-xl animate-bounce-short"
                role="alert">
                <svg className="flex-shrink-0 inline w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"></path>
                </svg>
                <div>
                    <span className="font-bold">Gagal!</span> {errorMsg}
                </div>
            </div>
            )}
            {/* --- ALERT ERROR END --- */}

            <form className="space-y-6" onSubmit={handleLogin}>
                {/* Input Email/Username */}
                <div>
                    <label className="block text-sm font-medium text-slate-700">
                        Username
                    </label>
                    <div className="mt-1">
                        <input type="text" required
                            className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Masukkan username" value={username} onChange={(e)=>
                        setUsername(e.target.value)}
                        />
                    </div>
                </div>

                {/* Input Password */}
                <div>
                    <label className="block text-sm font-medium text-slate-700">
                        Password
                    </label>
                    <div className="mt-1 relative"> {/* Tambahkan class 'relative' di sini */}
                        <input type={showPassword ? "text" : "password" } // Tipe berubah dinamis required
                            className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="••••••••" value={password} onChange={(e)=> setPassword(e.target.value)}
                        />

                        {/* Tombol Mata */}
                        <button type="button" onClick={()=> setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
                            >
                            {showPassword ? (
                            // Ikon Mata Terbuka (Sembunyikan)
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                                stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                            </svg>
                            ) : (
                            // Ikon Mata Tertutup (Lihat)
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                                stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Tombol Login */}
                <div>
                    <button type="submit" disabled={loading} className={`w-full flex justify-center py-3 px-4 border
                        border-transparent rounded-xl shadow-lg text-sm font-semibold text-white transition-all
                        active:scale-95 ${ loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                        }`}>
                        {loading ? (
                        <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10"
                                    stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                </path>
                            </svg>
                            Memproses...
                        </span>
                        ) : "Masuk Sekarang"}
                    </button>
                </div>
            </form>

            {/* Footer Form */}
            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-slate-500">Aplikasi Mobile SPKP</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
);
}

export default App;
