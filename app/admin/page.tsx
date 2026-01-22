// src/app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Papa from 'papaparse';

// ⚠️ [1] 구글 시트 '읽기 전용(CSV)' 주소
const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRQ41AdRgnzLe5cm2fRRZIPk2Bbauiqw5Ec6XPpT1YqZJFkfDvHYtHxwjJfoJqLNvbPCSup0Qa021YO/pub?output=csv';

// ⚠️ [2] 구글 앱스 스크립트 '배포(Web App)' 주소
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw-K5HLw4J-Dm3u371OKUN8KFxet1Ws9fRhKsheuEf9CXtya_V2phw3yXZM5ovwJSeG/exec';

type TreasureType = 'WEB_TOOL' | 'WEBSITE' | 'DOC' | 'SOFTWARE';
interface Treasure {
    id: string; title: string; description: string; type: TreasureType; url: string;
}

export default function AdminPage() {
    const router = useRouter();
    const [items, setItems] = useState<Treasure[]>([]);
    const [formData, setFormData] = useState({ title: '', description: '', type: 'WEB_TOOL', url: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (sessionStorage.getItem('isAdmin') !== 'true') {
            router.push('/login');
        } else {
            fetchList();
        }
    }, [router]);

    const fetchList = () => {
        const timeStamp = new Date().getTime();
        Papa.parse(`${GOOGLE_SHEET_CSV_URL}&t=${timeStamp}`, {
            download: true,
            header: true,
            complete: (results) => {
                setItems(results.data as Treasure[]);
            },
        });
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirm('등록하시겠습니까?')) return;
        setLoading(true);

        try {
            await fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'create', id: Date.now(), ...formData })
            });

            alert('✅ 등록 완료! (목록 갱신까지 1~2분 소요될 수 있습니다)');
            setFormData({ title: '', description: '', type: 'WEB_TOOL', url: '' });
            setTimeout(fetchList, 1000);
        } catch (err) {
            alert('❌ 오류 발생');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        setLoading(true);

        try {
            await fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', id: id })
            });

            alert('🗑️ 삭제 요청 완료!');
            setItems(prev => prev.filter(item => item.id !== id));
        } catch (err) {
            alert('❌ 삭제 실패');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
            <div className="w-full max-w-6xl">

                {/* 헤더: 메인으로 가기 + 로그아웃 */}
                <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
                        <p className="text-xs text-slate-500">디콘팀 자산 관리자 페이지</p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => router.push('/')}
                            className="flex items-center gap-1 bg-slate-100 text-slate-700 px-4 py-2 rounded-md text-sm font-bold hover:bg-slate-200 transition-colors"
                        >
                            🏠 메인으로
                        </button>
                        <button
                            onClick={() => { sessionStorage.removeItem('isAdmin'); router.push('/') }}
                            className="bg-red-50 text-red-500 border border-red-100 px-4 py-2 rounded-md text-sm font-bold hover:bg-red-100 transition-colors"
                        >
                            로그아웃
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">

                    {/* 왼쪽: 등록 폼 */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 h-fit">
                        <h2 className="text-lg font-bold mb-4 text-slate-800 border-b pb-2">새 자산 등록</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">제목</label>
                                <input required className="w-full p-2 border rounded text-sm bg-slate-50" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">설명</label>
                                <textarea required className="w-full p-2 border rounded text-sm bg-slate-50" rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">유형</label>
                                    {/* ⭐ [변경점] 관리자가 알아보기 쉬운 이름으로 변경! (값은 그대로) */}
                                    <select className="w-full p-2 border rounded text-sm bg-slate-50" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                        <option value="WEB_TOOL">ONLINE TOOLS (온라인 도구)</option>
                                        <option value="WEBSITE">PORTALS & SITES (웹사이트)</option>
                                        <option value="DOC">DOCUMENTS (문서/자료)</option>
                                        <option value="SOFTWARE">DESKTOP APPS (설치 프로그램)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">URL</label>
                                    <input required className="w-full p-2 border rounded text-sm bg-slate-50" value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-3 rounded font-bold hover:bg-slate-800 disabled:bg-gray-400 mt-2">
                                {loading ? '처리 중...' : '등록하기'}
                            </button>
                        </form>
                    </div>

                    {/* 오른쪽: 현재 목록 */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h2 className="text-lg font-bold text-slate-800">등록된 자산 ({items.length})</h2>
                            <button onClick={fetchList} className="text-xs bg-slate-100 px-2 py-1 rounded hover:bg-slate-200">🔄 새로고침</button>
                        </div>

                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {items.length === 0 && <p className="text-slate-400 text-center text-sm py-10">데이터가 없습니다.</p>}

                            {items.map((item) => (
                                <div key={item.id} className="group flex justify-between items-center p-3 border border-slate-100 rounded bg-slate-50 hover:bg-white hover:shadow-sm transition-all">
                                    <div className="overflow-hidden">
                                        <p className="font-bold text-sm text-slate-800 truncate">{item.title}</p>
                                        <p className="text-xs text-slate-500 truncate mt-1">
                                            {/* 목록에서도 배지가 예쁘게 보임 */}
                                            <span className="bg-slate-200 px-1 rounded text-[10px] mr-2 text-slate-600 font-bold">{item.type}</span>
                                            {item.url}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        disabled={loading}
                                        className="ml-3 text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded transition-colors"
                                        title="삭제"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}