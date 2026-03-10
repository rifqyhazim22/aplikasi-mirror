'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const supabase = createClient();
        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
        } else {
            router.push('/experience');
        }
    };

    const handleDeveloperLogin = async () => {
        setLoading(true);
        setError(null);

        const supabase = createClient();
        const devEmail = 'developer@mirror.app';
        const devPassword = 'developerpassword123';

        // Coba login dulu
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: devEmail,
            password: devPassword,
        });

        if (signInError) {
            // Kalau gagal karena akun belum ada, buat akunnya
            const { error: signUpError } = await supabase.auth.signUp({
                email: devEmail,
                password: devPassword,
            });

            if (signUpError) {
                setError('Gagal membuat akun developer otomatis: ' + signUpError.message);
                setLoading(false);
            } else {
                router.push('/experience');
            }
        } else {
            // Berhasil login
            router.push('/experience');
        }
    };

    return (
        <main className="relative flex min-h-screen w-full flex-col overflow-hidden items-center justify-center p-4">

            <div className="glass-card w-full max-w-[420px] rounded-[2rem] p-8 md:p-10 flex flex-col items-center relative z-10">
                <div className="flex flex-col items-center gap-2 mb-10 w-full text-center">
                    <div className="h-16 w-16 bg-white/10 rounded-full flex items-center justify-center mb-4 shadow-sm border border-white/5">
                        <span className="text-sky-400 text-3xl font-black">✨</span>
                    </div>
                    <h1 className="text-3xl font-light tracking-tight text-white">Mirror</h1>
                    <p className="text-white/50 text-sm font-medium tracking-wide">Welcome back to the future.</p>
                </div>

                <form onSubmit={handleLogin} className="w-full flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-semibold tracking-widest text-white/50 uppercase px-1" htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="glass-input w-full rounded-2xl h-14 px-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-0 transition-all duration-300 shadow-inner"
                            placeholder="nama@email.com"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] font-semibold tracking-widest text-white/50 uppercase" htmlFor="password">Password</label>
                        </div>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="glass-input w-full rounded-2xl h-14 px-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-0 transition-all duration-300 shadow-inner"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && <p className="text-[10px] text-red-300 bg-red-500/10 p-4 rounded-2xl border border-red-500/20 text-center uppercase tracking-widest">{error}</p>}

                    <div className="pt-4 flex flex-col gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-sky-400 hover:bg-sky-400/90 text-[#111e21] shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] rounded-full h-14 px-6 font-medium text-base transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            <span>{loading ? 'Memproses...' : 'Continue'}</span>
                            {!loading && <span className="font-black text-sm group-hover:translate-x-1 transition-transform">→</span>}
                        </button>

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-white/10"></div>
                            <span className="flex-shrink-0 mx-4 text-white/30 text-[10px] tracking-widest uppercase">atau</span>
                            <div className="flex-grow border-t border-white/10"></div>
                        </div>

                        <button
                            type="button"
                            onClick={handleDeveloperLogin}
                            disabled={loading}
                            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full h-14 px-6 font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <span>{loading ? 'Memproses...' : '🚀 Masuk Instan (Developer)'}</span>
                        </button>
                    </div>
                </form>

                <p className="mt-8 text-[11px] text-white/40 tracking-wider">
                    Belum punya akun?{' '}
                    <Link href="/register" className="text-sky-400 hover:text-sky-300 hover:underline font-medium ml-1 transition-colors">
                        Daftar di sini
                    </Link>
                </p>
            </div>
        </main>
    );
}
