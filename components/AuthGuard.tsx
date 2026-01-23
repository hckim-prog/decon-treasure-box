// src/components/AuthGuard.tsx
'use client';

import { useSession, signIn } from "next-auth/react";
import { FiLock, FiLoader } from "react-icons/fi";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    // 로그인 상태 확인 (로딩중, 성공, 실패)
    const { status } = useSession();

    // 1. 확인 중 (로딩 화면)
    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <FiLoader className="animate-spin text-3xl text-indigo-600" />
            </div>
        );
    }

    // 2. 로그인 성공 (문 열림!)
    if (status === "authenticated") {
        return <>{children}</>;
    }

    // 3. 로그인 필요 (잠금 화면 & 구글 버튼)
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-2xl text-center">
                {/* 자물쇠 아이콘 */}
                <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiLock className="text-indigo-600 text-4xl" />
                </div>

                <h1 className="text-2xl font-bold text-slate-800 mb-2">DECON Digital Hub</h1>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                    관계자 외 출입금지 구역입니다.<br />
                    회사 구글 계정으로 로그인해주세요.
                </p>

                {/* 구글 로그인 버튼 */}
                <button
                    onClick={() => signIn("google")}
                    className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                >
                    {/* 구글 로고 (SVG 이미지) */}
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="G" className="w-5 h-5" />
                    Google 계정으로 로그인
                </button>
            </div>
        </div>
    );
}