'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiHome, FiSend, FiTrash2, FiMessageSquare } from 'react-icons/fi';

// ✅ 기존 Apps Script 주소 그대로 사용!
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz8OBeLHiRgpxUNq1vaLmzyKrF-2JI-fQ72WTYcGu1QFYHiIt9IFQwIdnsbbDU1H4g/exec';

interface Idea {
    id: string;
    nickname: string;
    content: string;
    date: string;
}

export default function IdeasPage() {
    const router = useRouter();
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [loading, setLoading] = useState(false);

    // 입력 폼
    const [form, setForm] = useState({ nickname: '', password: '', content: '' });

    useEffect(() => {
        fetchIdeas();
    }, []);

    // 1. 아이디어 불러오기 (Read)
    const fetchIdeas = async () => {
        try {
            const res = await fetch(`${APPS_SCRIPT_URL}?type=IDEAS&t=${Date.now()}`);
            const data = await res.json();
            setIdeas(data.sort((a: any, b: any) => Number(b.id) - Number(a.id)));
        } catch (error) {
            console.error("로딩 실패:", error);
        }
    };

    // 2. 아이디어 등록 (Create)
    const handleSubmit = async () => {
        if (!form.nickname || !form.password || !form.content) return alert('모든 칸을 채워주세요!');

        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('action', 'CREATE_IDEA');
            params.append('nickname', form.nickname);
            params.append('password', form.password);
            params.append('content', form.content);

            await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString()
            });

            alert('아이디어가 벽에 붙었어요! 🎉');
            setForm({ nickname: '', password: '', content: '' }); // 초기화
            setTimeout(fetchIdeas, 1500); // 새로고침
        } catch (error) {
            alert('오류 발생');
        } finally {
            setLoading(false);
        }
    };

    // 3. 아이디어 삭제 (Delete)
    const handleDelete = async (id: string) => {
        const password = prompt("삭제하려면 설정한 비밀번호(4자리)를 입력하세요.");
        if (!password) return;

        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('action', 'DELETE_IDEA');
            params.append('id', id);
            params.append('password', password);

            await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString()
            });

            alert('삭제 요청을 보냈습니다. (비번이 맞으면 사라집니다)');
            setTimeout(fetchIdeas, 1500);
        } catch (error) {
            alert('오류 발생');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-100 font-sans pb-20">

            {/* 헤더 */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <FiMessageSquare className="text-indigo-600" />
                        DECON Idea Board
                    </h1>
                    <button onClick={() => router.push('/')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 text-sm font-bold transition-colors">
                        <FiHome /> 메인으로
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 mt-8">

                {/* 입력 폼 (포스트잇 작성기) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-10">
                    <h2 className="text-sm font-bold text-slate-500 mb-4">💡 번뜩이는 아이디어를 남겨주세요!</h2>

                    <div className="flex flex-col gap-3">
                        <textarea
                            value={form.content}
                            onChange={e => setForm({ ...form, content: e.target.value })}
                            placeholder="여기에 내용을 입력하세요..."
                            className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none resize-none h-24 text-sm"
                        />

                        {/* ✨ 여기가 마법을 부린 친절한 UI 부분입니다! ✨ */}
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mt-2">

                            {/* 닉네임, 비밀번호 입력칸을 하나로 묶음 */}
                            <div className="flex flex-col w-full md:w-auto gap-1.5">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="👤 작성자 (닉네임)"
                                        value={form.nickname}
                                        onChange={e => setForm({ ...form, nickname: e.target.value })}
                                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm w-1/2 md:w-36 outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                                    />
                                    <input
                                        type="password"
                                        placeholder="🔒 삭제용 비밀번호"
                                        maxLength={4} // 4자리까지만 입력 가능하게 막아줌!
                                        value={form.password}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm w-1/2 md:w-40 outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                                    />
                                </div>
                                {/* 🙋 친절한 안내 문구 */}
                                <p className="text-[11px] text-slate-400 pl-1">
                                    * 비밀번호는 나중에 내 아이디어를 <strong className="text-red-400 font-normal">삭제할 때</strong> 필요해요.
                                </p>
                            </div>

                            {/* 등록 버튼 */}
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200 h-full"
                            >
                                {loading ? '붙이는 중...' : <><FiSend /> 등록하기</>}
                            </button>

                        </div>
                    </div>
                </div>

                {/* 포스트잇 리스트 (Grid) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ideas.map((item) => (
                        <div key={item.id} className="group relative bg-yellow-100 hover:bg-yellow-50 transition-all p-5 rounded-none shadow-md rotate-1 hover:rotate-0 hover:scale-105 duration-300 min-h-[180px] flex flex-col">
                            {/* 포스트잇 테이프 효과 */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-white/30 backdrop-blur-sm rotate-[-2deg]"></div>

                            <p className="text-slate-800 font-medium whitespace-pre-wrap leading-relaxed flex-grow">
                                {item.content}
                            </p>

                            <div className="flex justify-between items-end mt-4 pt-4 border-t border-yellow-200/50">
                                <div className="text-xs text-slate-500 font-mono">
                                    <span className="font-bold text-slate-700">From. {item.nickname}</span>
                                    <br />
                                    {new Date(item.date).toLocaleDateString()}
                                </div>

                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="text-yellow-600 hover:text-red-500 p-2 rounded-full hover:bg-white/50 transition-colors"
                                    title="삭제하기"
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        </div>
                    ))}

                    {ideas.length === 0 && (
                        <div className="col-span-full py-20 text-center text-slate-400">
                            <p>아직 등록된 아이디어가 없어요. 첫 번째 주인공이 되어보세요! 🎈</p>
                        </div>
                    )}
                </div>

            </div>
        </main>
    );
}