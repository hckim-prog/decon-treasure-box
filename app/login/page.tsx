// src/app/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [id, setId] = useState('');
    const [pw, setPw] = useState('');
    const router = useRouter();

    // 🔥 [추가된 기능] 페이지 들어오자마자 검사!
    useEffect(() => {
        const isAdmin = sessionStorage.getItem('isAdmin');
        if (isAdmin === 'true') {
            // 이미 로그인이 되어있다면? 바로 관리자 페이지로 슝!
            router.replace('/admin');
        }
    }, [router]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const adminId = process.env.NEXT_PUBLIC_ADMIN_ID;
        const adminPw = process.env.NEXT_PUBLIC_ADMIN_PW;

        if (id === adminId && pw === adminPw) {
            sessionStorage.setItem('isAdmin', 'true');
            alert('환영합니다, 관리자님.');
            router.push('/admin');
        } else {
            alert('아이디 또는 비밀번호가 올바르지 않습니다.');
        }
    };

    return (
        <div className="min-h-screen bg-[#fff8ec] flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm border border-[#ffe9ce]">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-[#18305f]">Admin Access</h1>
                    <p className="text-xs text-[#546a7b] mt-2">관리자 권한이 필요한 페이지입니다.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-[#546a7b] mb-1">ID</label>
                        <input type="text" required className="w-full p-3 bg-[#fff8ec] border border-[#ffe9ce] rounded text-sm outline-none focus:ring-2 focus:ring-[#3777ff]" value={id} onChange={(e) => setId(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#546a7b] mb-1">PASSWORD</label>
                        <input type="password" required className="w-full p-3 bg-[#fff8ec] border border-[#ffe9ce] rounded text-sm outline-none focus:ring-2 focus:ring-[#3777ff]" value={pw} onChange={(e) => setPw(e.target.value)} />
                    </div>
                    <button type="submit" className="w-full bg-[#18305f] text-white py-3 rounded font-bold text-sm hover:bg-[#3777ff] transition-colors mt-4">Sign In</button>
                </form>

                <div className="mt-6 text-center">
                    <button onClick={() => router.push('/')} className="text-xs text-[#7b8796] hover:text-[#3777ff] hover:underline">메인으로 돌아가기</button>
                </div>
            </div>
        </div>
    );
}
