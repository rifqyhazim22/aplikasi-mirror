'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { createClient } from '@/utils/supabase/client';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const supabase = createClient();
        const { error: authError } = await supabase.auth.signUp({
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

    return (
        <main className="relative flex min-h-screen w-full flex-col overflow-hidden items-center justify-center p-4">

            <div className="absolute top-6 left-6 z-20">
              <BackButton />
            </div>

            <div className="glass-card w-full max-w-[420px] rounded-[2rem] p-8 md:p-10 flex flex-col items-center relative z-10">
                <div className="flex flex-col items-center gap-2 mb-10 w-full text-center">
                    <div className="h-16 w-16 bg-white/10 rounded-full flex items-center justify-center mb-4 shadow-sm border border-white/5">
                        <span className="text-sky-400 text-3xl font-black">✨</span>
                    </div>
                    <h1 className="text-3xl font-light tracking-tight text-white">Buat Akun</h1>
                    <p className="text-white/50 text-sm font-medium tracking-wide">Mulai perjalanan refleksi Anda.</p>
                </div>

                <form onSubmit={handleRegister} className="w-full flex flex-col gap-6">
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
                        <label className="text-[10px] font-semibold tracking-widest text-white/50 uppercase px-1" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="glass-input w-full rounded-2xl h-14 px-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-0 transition-all duration-300 shadow-inner"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    {error && <p className="text-[10px] text-red-300 bg-red-500/10 p-4 rounded-2xl border border-red-500/20 text-center uppercase tracking-widest">{error}</p>}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-sky-400 hover:bg-sky-400/90 text-white shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] rounded-full h-14 px-6 font-medium text-base transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            <span>{loading ? 'Memproses...' : 'Daftar Sekarang'}</span>
                            {!loading && <span className="font-black text-sm group-hover:translate-x-1 transition-transform">→</span>}
                        </button>
                    </div>
                </form>

                <p className="mt-8 text-[11px] text-white/40 tracking-wider">
                    Sudah punya akun?{' '}
                    <Link href="/login" className="text-sky-400 hover:text-sky-300 hover:underline font-medium ml-1 transition-colors">
                        Masuk di sini
                    </Link>
                </p>
            </div>
        </main>
    );
}
