// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// 아이콘 불러오기
import { FiSearch, FiExternalLink, FiGrid, FiGlobe, FiFileText, FiMonitor, FiLayers, FiDownloadCloud, FiZap } from 'react-icons/fi';
import { RiAdminLine } from 'react-icons/ri';

// ✅ Apps Script 주소 (실시간 연동 유지)
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxFwmKztHa-GaeJ9yo1Np2AV2Np0Ob-Il9wYBwFhVWY0erePP66bZbFCOES4AgzBA8v/exec';

type TreasureType = 'WEB_TOOL' | 'WEBSITE' | 'DOC' | 'SOFTWARE';
interface Treasure {
  id: string; title: string; description: string; type: TreasureType; url: string;
}

export default function Home() {
  const router = useRouter();
  const [treasures, setTreasures] = useState<Treasure[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TreasureType | 'ALL'>('ALL');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // 1. 관리자 여부 확인
    const adminStatus = sessionStorage.getItem('isAdmin');
    setIsAdmin(adminStatus === 'true');

    // 2. 데이터 가져오기 (실시간)
    fetchTreasures();
  }, []);

  const fetchTreasures = async () => {
    try {
      const res = await fetch(APPS_SCRIPT_URL);
      const data = await res.json();
      const sortedData = (data as Treasure[]).sort((a, b) => Number(b.id) - Number(a.id));
      setTreasures(sortedData);
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
    }
  };

  const filtered = treasures.filter((item) => {
    if (!item.title) return false;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeBadgeStyle = (type: string) => {
    switch (type?.trim()) {
      case 'WEB_TOOL': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'WEBSITE': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'SOFTWARE': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'DOC': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-200';
    }
  };

  const getFilterIcon = (type: string) => {
    switch (type) {
      case 'ALL': return <FiLayers />;
      case 'WEB_TOOL': return <FiGrid />;
      case 'WEBSITE': return <FiGlobe />;
      case 'DOC': return <FiFileText />;
      case 'SOFTWARE': return <FiMonitor />;
      default: return <FiLayers />;
    }
  };

  const getFilterLabel = (type: string) => {
    switch (type) {
      case 'ALL': return 'All Assets';
      case 'WEB_TOOL': return 'Online Tools';
      case 'WEBSITE': return 'Portals';
      case 'DOC': return 'Documents';
      case 'SOFTWARE': return 'Desktop Apps';
      default: return type;
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">

      {/* 히어로 섹션 (배경 이미지 영역) */}
      <div className="relative w-full h-[320px] bg-slate-900 overflow-hidden flex flex-col justify-center items-center text-center px-4">
        <div
          className="absolute inset-0 opacity-40 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/60 to-slate-900/90"></div>

        <div className="relative z-10 max-w-2xl text-white mt-4">
          <div className="flex justify-center mb-4">
            <span className="bg-white/10 border border-white/20 text-indigo-200 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm shadow-lg">
              Digital Contents Transformation Team
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white drop-shadow-2xl">
            DECON <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">Digital Hub</span>
          </h1>
          <p className="text-slate-300 text-sm md:text-base font-medium max-w-lg mx-auto leading-relaxed opacity-90">
            업무 효율화를 위한 모든 디지털 자산을 한곳에.<br />
            필요한 도구와 문서를 빠르고 쉽게 찾아보세요.
          </p>
        </div>

        <div className="absolute top-6 right-6 z-20">
          {isAdmin ? (
            <button onClick={() => router.push('/admin')} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-full transition-all text-xs font-bold shadow-lg shadow-indigo-500/30">
              <RiAdminLine className="text-lg" /> Admin Dashboard
            </button>
          ) : (
            <Link href="/login" className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors bg-black/20 px-3 py-1.5 rounded-full hover:bg-black/40 backdrop-blur-sm border border-white/10">
              <RiAdminLine /> Authorized Only
            </Link>
          )}
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-20 pb-20">

        {/* ✨ [수정됨] 검색 및 필터 박스 (Sticky 적용!) 
            sticky: 스크롤 시 고정됨
            top-6: 화면 위에서 조금 떨어져서 고정됨
            z-40: 카드들보다 위에 보이게 함
        */}
        <div className="sticky top-6 z-40 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6 mb-10 ring-1 ring-slate-900/5 transition-all duration-300">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="relative w-full md:w-96 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-500">
                <FiSearch className="text-slate-400" />
              </div>
              <input
                type="text" placeholder="검색어를 입력하세요..."
                className="pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl w-full text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2 flex-wrap justify-center">
              {['ALL', 'WEB_TOOL', 'WEBSITE', 'DOC', 'SOFTWARE'].map(type => (
                <button key={type} onClick={() => setFilterType(type as any)}
                  className={`flex items-center gap-2 px-4 py-2 text-[11px] font-bold rounded-full transition-all border
                    ${filterType === type
                      ? 'bg-slate-800 text-white border-slate-800 shadow-md transform scale-105'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700'}`}>
                  {getFilterIcon(type)}
                  {getFilterLabel(type)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 카드 리스트 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item, idx) => (
            <a key={idx} href={item.url} target="_blank" className="group relative bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_-10px_rgba(79,70,229,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-visible">

              {/* 말풍선 설명 */}
              <div className="absolute left-6 right-6 top-[4.5rem] z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 pointer-events-none">
                <div className="bg-slate-800/95 backdrop-blur-md text-slate-100 text-xs p-4 rounded-xl shadow-2xl border border-white/10 relative">
                  <div className="absolute -top-1.5 left-4 w-3 h-3 bg-slate-800/95 border-t border-l border-white/10 transform rotate-45"></div>
                  <p className="leading-relaxed font-medium text-slate-200">
                    {item.description || "설명이 없습니다."}
                  </p>
                </div>
              </div>

              {/* 상단 장식 바 */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-100 to-slate-200 group-hover:from-indigo-500 group-hover:to-cyan-400 transition-all duration-500 rounded-t-2xl"></div>

              <div className="flex justify-between items-start mb-4 mt-1">
                <span className={`text-[10px] px-2.5 py-1 rounded-full border font-bold tracking-wider uppercase flex items-center gap-1.5 ${getTypeBadgeStyle(item.type)}`}>
                  {item.type === 'SOFTWARE' ? <FiDownloadCloud /> : <FiExternalLink />}
                  {item.type === 'WEB_TOOL' ? 'TOOL' : item.type.replace('_', ' ')}
                </span>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <FiExternalLink className="text-sm" />
                </div>
              </div>

              <h3 className="font-bold text-lg text-slate-800 mb-2 leading-tight group-hover:text-indigo-600 transition-colors relative z-10">
                {item.title}
              </h3>

              <div className="flex-grow"></div>

              <div className="mt-6 pt-4 border-t border-slate-50 flex justify-end">
                <span className="group/btn flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-50 text-slate-600 text-xs font-bold transition-all duration-300 hover:bg-indigo-600 hover:text-white hover:shadow-md cursor-pointer leading-none relative z-20">
                  <FiZap className="text-indigo-500 text-sm transition-colors group-hover/btn:text-white" />
                  바로가기
                </span>
              </div>
            </a>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-slate-400 bg-white/50 rounded-2xl border border-dashed border-slate-200">
              <FiSearch className="text-4xl mb-4 text-slate-300" />
              <p className="text-sm">검색 결과가 없습니다.</p>
            </div>
          )}
        </div>

        <footer className="text-center text-slate-400 text-[10px] uppercase tracking-widest mt-20 py-10 border-t border-slate-100">
          © DECON Digital Contents Transformation Team. All rights reserved.
        </footer>
      </div>
    </main>
  );
}