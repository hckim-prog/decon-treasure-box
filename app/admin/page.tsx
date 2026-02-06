'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// 아이콘들
import { FiTrash2, FiRefreshCw, FiHome, FiEdit2, FiX, FiCheck } from 'react-icons/fi';

// ✅ Apps Script 주소
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz8OBeLHiRgpxUNq1vaLmzyKrF-2JI-fQ72WTYcGu1QFYHiIt9IFQwIdnsbbDU1H4g/exec';

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
    const [form, setForm] = useState({ title: '', description: '', type: 'WEB_TOOL', url: '' });
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        const checkAdmin = sessionStorage.getItem('isAdmin');
        if (checkAdmin !== 'true') {
            alert('관리자 로그인이 필요합니다.');
            router.push('/login');
            return;
        }
        fetchAssets();
    }, [router]);

    // 1. 실시간 데이터 조회 (캐시 방지 적용 ⭐)
    const fetchAssets = async () => {
        try {
            // 주소 뒤에 시간을 붙여서 매번 새로운 요청인 것처럼 속임 (캐시 무시)
            const res = await fetch(`${APPS_SCRIPT_URL}?action=read&t=${Date.now()}`);
            const data = await res.json();

            if (Array.isArray(data)) {
                const sortedData = (data as Asset[]).sort((a, b) => Number(b.id) - Number(a.id));
                setAssets(sortedData);
            }
        } catch (error) {
            console.error("데이터 로딩 실패:", error);
        }
    };

    // 2. 등록 및 수정 (데이터 전송 방식 변경 🛠️)
    const handleSubmit = async () => {
        if (!form.title || !form.url) return alert('제목과 URL은 필수입니다!');
        setLoading(true);

        try {
            const actionType = editingId ? 'update' : 'create';

            // 🚨 [핵심 수정] JSON 대신 URLSearchParams(폼 데이터) 방식 사용
            // Apps Script가 데이터를 확실하게 인식하도록 포장 방식을 바꿉니다.
            const formData = new URLSearchParams();
            formData.append('action', actionType);
            if (editingId) formData.append('id', editingId);
            formData.append('title', form.title);
            formData.append('description', form.description);
            formData.append('type', form.type);
            formData.append('url', form.url);

            await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // 보안 에러 무시
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData.toString() // 변환된 데이터 전송
            });

            alert(editingId ? '수정 요청을 보냈습니다!' : '등록 요청을 보냈습니다!');

            setForm({ title: '', description: '', type: 'WEB_TOOL', url: '' });
            setEditingId(null);

            // 구글 시트 저장 시간(2초) 대기 후 목록 갱신
            setTimeout(() => fetchAssets(), 2000);

        } catch (error) {
            console.error(error);
            alert('오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 3. 삭제 (데이터 전송 방식 변경 🛠️)
    const handleDelete = async (id: string) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        setLoading(true);
        try {
            // 삭제 요청도 폼 데이터 방식으로 전송
            const formData = new URLSearchParams();
            formData.append('action', 'delete');
            formData.append('id', id);

            await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString()
            });

            alert('삭제 요청을 보냈습니다.');
            setTimeout(() => fetchAssets(), 2000);
        } catch (error) {
            alert('오류 발생');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (item: Asset) => {
        setEditingId(item.id);
        setForm({ title: item.title, description: item.description, type: item.type, url: item.url });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setForm({ title: '', description: '', type: 'WEB_TOOL', url: '' });
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
            {/* 헤더 */}
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
                    <p className="text-slate-500 text-sm mt-1">디콘팀 자산 관리자 페이지 (Real-time)</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => router.push('/')} className="flex items-center gap-2 bg-white border border-slate-300 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-bold shadow-sm transition-all">
                        <FiHome /> 메인으로
                    </button>
                    <button
                        onClick={() => {
                            sessionStorage.removeItem('isAdmin');
                            router.push('/');
                            alert('안녕히 가세요! 👋');
                        }}
                        className="bg-rose-100 text-rose-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-rose-200 transition-all border border-rose-200"
                    >
                        로그아웃
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* 입력 폼 */}
                <div className="lg:col-span-2">
                    <div className={`bg-white rounded-2xl shadow-xl border p-6 sticky top-8 transition-colors duration-300 ${editingId ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-200'}`}>
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            {editingId ? <><FiEdit2 className="text-indigo-600" /> 자산 수정</> : '새 자산 등록'}
                        </h2>

                        {/* 상단 링크 영역 */}
                        {!editingId && (
                            <div className="space-y-3 mb-6">
                                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                                    <p className="text-xs text-indigo-700 font-bold mb-1">📂 Desktop Apps 저장소:</p>
                                    <a
                                        href="https://drive.google.com/drive/folders/19GeBX8Pjk3i1nM7aNecBLC201aCPyvkR"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-indigo-500 hover:underline flex items-center gap-1"
                                    >
                                        구글 드라이브 바로가기 ↗
                                    </a>
                                </div>
                                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                                    <p className="text-xs text-green-700 font-bold mb-1">🔐 사이트 로그인 계정 관리:</p>
                                    <a
                                        href="https://docs.google.com/spreadsheets/d/1rvqMu614aoQ6eRdutoL1rlvUx3IoX6hOBK_gFq0mO4I/edit?gid=446313469#gid=446313469"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-green-600 hover:underline flex items-center gap-1 font-bold"
                                    >
                                        구글 스프레드시트 열기 ↗
                                    </a>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">제목</label>
                                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="제목 입력" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">설명</label>
                                <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="설명 입력" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">유형</label>
                                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                                        <option value="WEB_TOOL">ONLINE TOOLS</option>
                                        <option value="WEBSITE">PORTALS</option>
                                        <option value="DOC">DOCUMENTS</option>
                                        <option value="SOFTWARE">DESKTOP APPS</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">URL</label>
                                    <input type="text" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="https://..." />
                                </div>
                            </div>
                            <div className="pt-4 flex gap-2">
                                {editingId ? (
                                    <>
                                        <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-bold text-sm flex justify-center items-center gap-2 shadow-lg shadow-indigo-200">{loading ? '저장 중...' : <><FiCheck /> 수정사항 저장</>}</button>
                                        <button onClick={handleCancelEdit} className="bg-slate-200 hover:bg-slate-300 text-slate-600 px-4 py-3 rounded-lg font-bold text-sm">취소</button>
                                    </>
                                ) : (
                                    <button onClick={handleSubmit} disabled={loading} className="w-full bg-slate-900 hover:bg-black text-white py-3 rounded-lg font-bold text-sm flex justify-center items-center gap-2 shadow-lg">{loading ? '처리 중...' : '등록하기'}</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 목록 */}
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
                                    <div className="flex-1 cursor-pointer" onClick={() => handleEditClick(item)}>
                                        <h3 className={`font-bold text-base mb-1 ${editingId === item.id ? 'text-indigo-700' : 'text-slate-800'}`}>{item.title}</h3>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 uppercase">{item.type}</span>
                                            <span className="text-xs text-slate-400 truncate max-w-[200px] font-mono">{item.url}</span>
                                        </div>
                                        <p className="text-sm text-slate-500 line-clamp-1">{item.description}</p>
                                    </div>
                                    <div className="flex flex-col gap-2 ml-4">
                                        <button onClick={() => handleDelete(item.id)} className="text-slate-300 hover:text-rose-500 p-2 hover:bg-rose-50 rounded-full transition-all"><FiTrash2 size={16} /></button>
                                        <button onClick={() => handleEditClick(item)} className={`p-2 rounded-full transition-all ${editingId === item.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:text-indigo-600 hover:bg-indigo-50'}`}><FiEdit2 size={16} /></button>
                                    </div>
                                </div>
                            ))}
                            {assets.length === 0 && <div className="text-center py-20 text-slate-400"><p>등록된 자산이 없습니다.</p></div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}