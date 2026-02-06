'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';

export default function AdminPage() {
    const router = useRouter();

    useEffect(() => {
        // 관리자 아니면 쫓아내기
        const isAdmin = sessionStorage.getItem('isAdmin');
        if (isAdmin !== 'true') {
            alert('관리자 권한이 필요합니다.');
            router.push('/login');
        }
    }, [router]);

    return (
        <div className="min-h-screen bg-slate-50 p-12 flex flex-col items-center justify-center">
            <div className="max-w-2xl w-full text-center">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">Admin Dashboard</h1>

                <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 mb-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">📦 데이터 관리하기</h2>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        아래 버튼을 눌러 구글 스프레드시트로 이동하세요.<br />
                        데이터를 수정하면 사이트에 실시간으로 반영됩니다.
                    </p>

                    <a
                        href="https://docs.google.com/spreadsheets"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-600/30 transition-all hover:-translate-y-1"
                    >
                        구글 시트 열기
                    </a>
                </div>

                <button
                    onClick={() => router.push('/')}
                    className="flex items-center justify-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors mx-auto"
                >
                    <FiArrowLeft /> 메인으로 돌아가기
                </button>
            </div>
        </div>
    );
}