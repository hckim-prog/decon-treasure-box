// src/app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { useRouter } from 'next/navigation';
// ✨ 아이콘 추가 (수정 연필 아이콘, 취소 아이콘)
import { FiTrash2, FiRefreshCw, FiHome, FiEdit2, FiX, FiCheck } from 'react-icons/fi';

// ⚠️ 여기에 친구의 Apps Script 배포 URL을 넣어주세요! (Exec URL)
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw-K5HLw4J-Dm3u371OKUN8KFxet1Ws9fRhKsheuEf9CXtya_V2phw3yXZM5ovwJSeG/exec';

// ⚠️ 여기에 친구의 구글 시트 CSV 주소를 넣어주세요!
const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRQ41AdRgnzLe5cm2fRRZIPk2Bbauiqw5Ec6XPpT1YqZJFkfDvHYtHxwjJfoJqLNvbPCSup0Qa021YO/pub?output=csv';

interface Asset {
    id: string;
    title: string;
    description: string;
    type: string;
    url: string;
}

export default function AdminPage() {
    const router = useRouter();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(false);

    // 폼 입력 상태
    const [form, setForm] = useState({ title: '', description: '', type: 'WEB_TOOL', url: '' });

    // ✨ 수정 모드 상태 관리 (null이면 등록 모드, 값이 있으면 수정 모드)
    const [editingId, setEditingId] = useState<string | null>(null);

    // 1. 관리자 체크 및 데이터 로딩
    useEffect(() => {
        const checkAdmin = sessionStorage.getItem('isAdmin');
        if (checkAdmin !== 'true') {
            alert('관리자 로그인이 필요합니다.');
            router.push('/login');
            return;
        }
        fetchAssets();
    }, [router]);

    // 2. 자산 목록 불러오기 (CSV 파싱)
    const fetchAssets = () => {
        const timeStamp = new Date().getTime();
        Papa.parse(`${GOOGLE_SHEET_CSV_URL}&t=${timeStamp}`, {
            download: true,
            header: true,
            complete: (results) => {
                // ID가 있는 데이터만 필터링 (빈 줄 제거)
                const validData = (results.data as Asset[]).filter(item => item.id);
                // 최신순 정렬 (ID가 타임스탬프니까 역순 정렬)
                setAssets(validData.sort((a, b) => Number(b.id) - Number(a.id)));
            },
        });
    };

    // 3. 등록 또는 수정 처리 (Submit)
    const handleSubmit = async () => {
        if (!form.title || !form.url) return alert('제목과 URL은 필수입니다!');

        setLoading(true);

        try {
            // 수정 모드이면 action: 'UPDATE', 등록 모드이면 action: 'CREATE' (기본값)
            const actionType = editingId ? 'UPDATE' : 'CREATE';

            // 보낼 데이터 준비
            const payload = {
                action: actionType,
                id: editingId, // 수정일 때만 사용됨
                ...form
            };

            await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            // 완료 처리
            alert(editingId ? '성공적으로 수정되었습니다!' : '새 자산이 등록되었습니다!');
            setForm({ title: '', description: '', type: 'WEB_TOOL', url: '' }); // 폼 초기화
            setEditingId(null); // 수정 모드 해제

            // 구글 시트 반영 시간 고려하여 1.5초 뒤 새로고침
            setTimeout(fetchAssets, 1500);

        } catch (error) {
            console.error(error);
            alert('오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 4. 삭제 처리
    const handleDelete = async (id: string) => {
        if (!confirm('정말 삭제하시겠습니까? (복구 불가)')) return;

        setLoading(true);
        try {
            await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'DELETE', id: id }),
            });
            alert('삭제되었습니다.');
            setTimeout(fetchAssets, 1500);
        } catch (error) {
            alert('삭제 중 오류 발생');
        } finally {
            setLoading(false);
        }
    };

    // 5. ✨ 수정 버튼 클릭 시 폼에 데이터 채우기
    const handleEditClick = (item: Asset) => {
        setEditingId(item.id); // 수정 모드 켜기
        setForm({
            title: item.title,
            description: item.description,
            type: item.type,
            url: item.url
        });
        // 스크롤을 맨 위로 올려서 폼을 보여줌
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 6. ✨ 수정 취소 (폼 초기화)
    const handleCancelEdit = () => {
        setEditingId(null);
        setForm({ title: '', description: '', type: 'WEB_TOOL', url: '' });
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">

            {/* 헤더 영역 */}
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
                    <p className="text-slate-500 text-sm mt-1">디콘팀 자산 관리자 페이지</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => router.push('/')} className="flex items-center gap-2 bg-white border border-slate-300 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-bold shadow-sm transition-all">
                        <FiHome /> 메인으로
                    </button>
                    <button onClick={() => { sessionStorage.removeItem('isAdmin'); router.push('/login'); }} className="bg-rose-100 text-rose-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-rose-200 transition-all border border-rose-200">
                        로그아웃
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">

                {/* ✨ [왼쪽] 입력 및 수정 폼 (2칸 차지) */}
                <div className="lg:col-span-2">
                    <div className={`bg-white rounded-2xl shadow-xl border p-6 sticky top-8 transition-colors duration-300 ${editingId ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-200'}`}>

                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            {editingId ? (
                                <>
                                    <FiEdit2 className="text-indigo-600" /> 자산 내용 수정
                                </>
                            ) : (
                                '새 자산 등록'
                            )}
                        </h2>

                        {/* 구글 드라이브 안내 */}
                        {!editingId && (
                            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6">
                                <p className="text-xs text-indigo-700 font-bold mb-1">📂 Desktop Apps (설치파일) 저장소:</p>
                                <a href="#" className="text-xs text-indigo-500 hover:underline">구글 드라이브 바로가기 ↗</a>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">제목</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                                    placeholder="예: 이미지 배경 제거 툴"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">설명</label>
                                <textarea
                                    rows={3}
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all resize-none"
                                    placeholder="이 자산에 대한 간단한 설명을 입력하세요."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">유형</label>
                                    <select
                                        value={form.type}
                                        onChange={e => setForm({ ...form, type: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        <option value="WEB_TOOL">ONLINE TOOLS (온라인 도구)</option>
                                        <option value="WEBSITE">PORTALS (포털/사이트)</option>
                                        <option value="DOC">DOCUMENTS (문서/자료)</option>
                                        <option value="SOFTWARE">DESKTOP APPS (PC설치용)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">URL (링크)</label>
                                    <input
                                        type="text"
                                        value={form.url}
                                        onChange={e => setForm({ ...form, url: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            {/* 버튼 영역 */}
                            <div className="pt-4 flex gap-2">
                                {editingId ? (
                                    <>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={loading}
                                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-bold text-sm transition-all flex justify-center items-center gap-2 shadow-lg shadow-indigo-200">
                                            {loading ? '저장 중...' : <><FiCheck /> 수정사항 저장</>}
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="bg-slate-200 hover:bg-slate-300 text-slate-600 px-4 py-3 rounded-lg font-bold text-sm transition-all">
                                            취소
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="w-full bg-slate-900 hover:bg-black text-white py-3 rounded-lg font-bold text-sm transition-all flex justify-center items-center gap-2 shadow-lg">
                                        {loading ? '처리 중...' : '등록하기'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* [오른쪽] 등록된 자산 목록 (3칸 차지) */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 min-h-[600px]">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800">등록된 자산 ({assets.length})</h2>
                            <button onClick={fetchAssets} className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors">
                                <FiRefreshCw /> 새로고침
                            </button>
                        </div>

                        <div className="space-y-4">
                            {assets.map((item) => (
                                <div key={item.id} className={`group relative p-5 rounded-xl border transition-all duration-200 hover:shadow-md flex justify-between items-start ${editingId === item.id ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200' : 'bg-white border-slate-100 hover:border-slate-300'}`}>

                                    {/* 자산 정보 (클릭 시 수정 모드 활성화) */}
                                    <div className="flex-1 cursor-pointer" onClick={() => handleEditClick(item)}>
                                        <h3 className={`font-bold text-base mb-1 ${editingId === item.id ? 'text-indigo-700' : 'text-slate-800'}`}>
                                            {item.title}
                                        </h3>

                                        {/* 배지 및 링크 */}
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 uppercase">
                                                {item.type}
                                            </span>
                                            <span className="text-xs text-slate-400 truncate max-w-[200px] font-mono">
                                                {item.url}
                                            </span>
                                        </div>

                                        <p className="text-sm text-slate-500 line-clamp-1">{item.description}</p>

                                        {/* 수정 중이라는 표시 */}
                                        {editingId === item.id && (
                                            <span className="inline-block mt-2 text-[10px] font-bold text-indigo-500 animate-pulse">
                                                Currently Editing...
                                            </span>
                                        )}
                                    </div>

                                    {/* 액션 버튼들 (수정/삭제) */}
                                    <div className="flex flex-col gap-2 ml-4">
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-slate-300 hover:text-rose-500 p-2 hover:bg-rose-50 rounded-full transition-all"
                                            title="삭제"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleEditClick(item)}
                                            className={`p-2 rounded-full transition-all ${editingId === item.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:text-indigo-600 hover:bg-indigo-50'}`}
                                            title="수정"
                                        >
                                            <FiEdit2 size={16} />
                                        </button>
                                    </div>

                                </div>
                            ))}

                            {assets.length === 0 && (
                                <div className="text-center py-20 text-slate-400">
                                    <p>등록된 자산이 없습니다.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}