import React from 'react';

// Terima data user dan fungsi logout sebagai "props"
const Dashboard = ({ userData, onLogout, onOpenUserList, onOpenSPKP, onOpenSPKPProses, onOpenSPKPSelesai }) => {
return (
<div className="min-h-screen bg-slate-50 pb-10 font-sans">
    {/* Header Profil - Gradient Biru selaras dengan Login */}
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-b-[3.5rem] shadow-xl">
        <div className="flex justify-between items-center mt-6">
            <div className="flex items-center space-x-4">
                {/* Foto Profil / Avatar */}
                <div
                    className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-white text-xl font-bold tracking-tight">
  {                     userData?.pelaksana || userData?.role || 'Guest'}
                    </h2>
                    <div className="space-y-1">
                        {/* Username Row */}
                        <div className="flex text-blue-100 text-xs opacity-80 font-medium">
                            <span className="w-14">Username</span>
                            <span className="mr-1">:</span>
                            <span>{userData?.username || 'KRY-001'}</span>
                        </div>

                        {/* Cabang Row */}
                        <div className="flex text-blue-100 text-xs opacity-80 font-medium">
                            <span className="w-14">Cabang</span>
                            <span className="mr-1">:</span>
                            <span>{userData?.cabang || 'PUSAT'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tombol Logout */}
            <button onClick={onLogout}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all active:scale-90">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
            </button>
        </div>
    </div>

    {/* Grid Menu Navigasi */}
    <div className="px-6 mt-10">
        <h3 className="text-slate-800 font-extrabold text-lg mb-5">Menu Navigasi</h3>
        <div className="grid grid-cols-2 gap-5">
            {[
            { label: 'USER', icon: '👤', color: 'bg-emerald-50 text-emerald-600', action: onOpenUserList },
            { label: 'SPKP', icon: '📝', color: 'bg-purple-50 text-purple-600', action: onOpenSPKP },
            { label: 'SPKP Proses', icon: '📥', color: 'bg-blue-50 text-blue-600', action: onOpenSPKPProses },
            { label: 'SPKP Selesai', icon: '🕒', color: 'bg-orange-50 text-orange-600', action: onOpenSPKPSelesai },
            { label: 'Hubungi Pengelola', icon: '📞', color: 'bg-red-50 text-red-600' },
            { label: 'Pengaturan', icon: '⚙️', color: 'bg-slate-100 text-slate-600' }
            ].map((item, idx) => (
            <div key={idx}
                className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center space-y-3 active:scale-95 transition-all cursor-pointer hover:shadow-md"
                onClick={item.action}>
                <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center text-3xl
                    shadow-sm`}>
                    {item.icon}
                </div>
                <span className="text-sm font-bold text-slate-700 leading-tight">{item.label}</span>
            </div>
            ))}
        </div>
    </div>

    {/* Info Status / Absensi Terakhir */}
    <div className="px-6 mt-10">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
                <span
                    className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full uppercase tracking-widest">Hadir</span>
            </div>
            <div className="flex items-center space-x-5">
                <div
                    className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </div>
                <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">INFO</p>
                    <h4 className="text-2xl font-black text-slate-800">08:00</h4>
                    <p className="text-xs text-slate-500 font-medium mt-1">Selasa, 5 Mei 2026</p>
                </div>
            </div>
        </div>
    </div>
</div>
);
};

export default Dashboard;
