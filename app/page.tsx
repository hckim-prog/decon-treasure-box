'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// ✅ [추가됨] NextAuth에서 로그인 정보 가져오기
import { useSession, signIn } from "next-auth/react";
// ✅ Solar Icons (Iconify) - React Icons에 포함된 Solar 아이콘 활용
// 만약 Solar 아이콘이 없다면 유사한 스타일로 대체하되, 요청하신 느낌을 최대한 살립니다.
// 여기서는 Solar 스타일의 아이콘을 대체할 수 있는 직관적인 아이콘으로 구성했습니다.
import {
  RiAdminLine,
  RiSearchLine,
  RiGlobalLine,
  RiFileTextLine,
  RiComputerLine,
  RiLayoutGridLine,
  RiStarFill,
  RiStarLine,
  RiArrowRightUpLine,
  RiDownloadCloud2Line,
  RiToolsFill
} from 'react-icons/ri';

// ✅ Apps Script 주소 유지
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz8OBeLHiRgpxUNq1vaLmzyKrF-2JI-fQ72WTYcGu1QFYHiIt9IFQwIdnsbbDU1H4g/exec';

type TreasureType = 'WEB_TOOL' | 'WEBSITE' | 'DOC' | 'SOFTWARE';
interface Treasure {
  id: string; title: string; description: string; type: TreasureType; url: string;
}

export default function Home() {
  const router = useRouter();

  // 🕵️‍♂️ [핵심 수정] 구글 로그인 세션 정보 가져오기
  const { data: session, status } = useSession();

  const [treasures, setTreasures] = useState<Treasure[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TreasureType | 'ALL' | 'FAVORITE'>('ALL');
  const [isAdmin, setIsAdmin] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLogSent, setIsLogSent] = useState(false); // 로그 중복 방지

  useEffect(() => {
    // 1. 로딩 중이면 대기
    if (status === 'loading') return;

    // 2. 로그인이 안 되어 있다면? -> 구글 로그인 창 띄우기
    if (status === 'unauthenticated') {
      signIn('google'); // 구글 로그인 강제 실행
      return;
    }

    // 3. 로그인이 확인되면 실행 (status === 'authenticated')
    if (session?.user?.email) {

      // 관리자 권한 확인 (기존 방식 유지 + 이메일 확인도 가능)
      const adminStatus = sessionStorage.getItem('isAdmin');
      setIsAdmin(adminStatus === 'true');

      // 데이터 가져오기
      fetchTreasures();

      // 즐겨찾기 불러오기
      const savedFavs = localStorage.getItem('myDeconFavorites');
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      }

      // 🕵️‍♂️ [로그 전송] 구글 이메일을 Apps Script로 보냅니다!
      // (로그를 아직 안 보냈고, 관리자가 아닐 때만)
      if (!isLogSent && adminStatus !== 'true') {
        const params = new URLSearchParams();
        params.append('action', 'log');
        // ✅ 'Visitor' 대신 진짜 구글 이메일을 보냅니다!
        params.append('user', session.user.email);
        params.append('act', '메인 페이지 접속');

        fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString()
        });
        setIsLogSent(true); // 전송 완료 체크 (중복 방지)
      }
    }

  }, [status, session]); // 로그인 상태가 변하면 다시 실행

  // ... (아래부터는 기존 코드와 100% 동일합니다) ...

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    let newFavorites;
    if (favorites.includes(id)) {
      newFavorites = favorites.filter(favId => favId !== id);
    } else {
      newFavorites = [...favorites, id];
    }
    setFavorites(newFavorites);
    localStorage.setItem('myDeconFavorites', JSON.stringify(newFavorites));
  };

  const fetchTreasures = async () => {
    try {
      const res = await fetch(APPS_SCRIPT_URL);
      const data = await res.json();

      if (Array.isArray(data)) {
        const sortedData = (data as Treasure[]).sort((a, b) => Number(b.id) - Number(a.id));
        setTreasures(sortedData);
      } else {
        console.error("데이터 형식 오류 (배열이 아닙니다):", data);
      }
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
    }
  };

  const getFilteredItems = (items: Treasure[], type: TreasureType | 'ALL' | 'FAVORITE') => {
    return items.filter((item) => {
      if (!item.title) return false;
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());

      if (type === 'FAVORITE') {
        return matchesSearch && favorites.includes(item.id);
      }

      const matchesType = type === 'ALL' || item.type === type;
      return matchesSearch && matchesType;
    });
  };

  const allFiltered = getFilteredItems(treasures, filterType);

  // 🎨 [디자인 수정] 카테고리별 테마 색상 정의
  const getThemeColor = (type: string) => {
    switch (type?.trim()) {
      case 'WEB_TOOL': return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', hover: 'group-hover:border-blue-300', iconBg: 'bg-blue-100' };
      case 'WEBSITE': return { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', hover: 'group-hover:border-indigo-300', iconBg: 'bg-indigo-100' };
      case 'SOFTWARE': return { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', hover: 'group-hover:border-slate-300', iconBg: 'bg-slate-200' };
      case 'DOC': return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', hover: 'group-hover:border-emerald-300', iconBg: 'bg-emerald-100' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200', hover: 'group-hover:border-gray-300', iconBg: 'bg-gray-100' };
    }
  };

  const getFilterIcon = (type: string) => {
    switch (type) {
      case 'ALL': return <RiLayoutGridLine />;
      case 'FAVORITE': return <RiStarFill className={filterType === 'FAVORITE' ? 'text-yellow-400' : ''} />;
      case 'WEB_TOOL': return <RiToolsFill />;
      case 'WEBSITE': return <RiGlobalLine />;
      case 'DOC': return <RiFileTextLine />;
      case 'SOFTWARE': return <RiComputerLine />;
      default: return <RiLayoutGridLine />;
    }
  };

  const getFilterLabel = (type: string) => {
    switch (type) {
      case 'ALL': return 'All Assets';
      case 'FAVORITE': return 'Favorites';
      case 'WEB_TOOL': return 'Tools';
      case 'WEBSITE': return 'Portals';
      case 'DOC': return 'Docs';
      case 'SOFTWARE': return 'Apps';
      default: return type;
    }
  };

  const categoryConfig: Record<TreasureType, { label: string; icon: JSX.Element; color: string }> = {
    'WEB_TOOL': { label: 'Online Tools', icon: <RiToolsFill size={20} />, color: 'text-blue-600' },
    'WEBSITE': { label: 'Portals & Sites', icon: <RiGlobalLine size={20} />, color: 'text-indigo-600' },
    'DOC': { label: 'Documents', icon: <RiFileTextLine size={20} />, color: 'text-emerald-600' },
    'SOFTWARE': { label: 'Desktop Apps', icon: <RiComputerLine size={20} />, color: 'text-slate-600' },
  };

  const categoryOrder: TreasureType[] = ['WEB_TOOL', 'WEBSITE', 'DOC', 'SOFTWARE'];

  // 🎨 [디자인 수정] 카드 렌더링 컴포넌트 (Bento Grid 스타일 적용)
  const renderCard = (item: Treasure) => {
    const theme = getThemeColor(item.type);

    return (
      <a key={item.id} href={item.url} target="_blank" className={`group relative flex flex-col h-full bg-white rounded-3xl p-6 border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden ${theme.hover}`}>

        {/* 배경 장식용 그라데이션 원 */}
        <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 blur-3xl transition-all group-hover:scale-150 ${theme.bg.replace('bg-', 'bg-')}-400`}></div>

        <div className="flex justify-between items-start mb-4 relative z-10">
          {/* 아이콘 박스 */}
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${theme.iconBg} ${theme.text}`}>
            {item.type === 'SOFTWARE' ? <RiDownloadCloud2Line /> :
              item.type === 'DOC' ? <RiFileTextLine /> :
                item.type === 'WEB_TOOL' ? <RiToolsFill /> : <RiGlobalLine />}
          </div>

          {/* 즐겨찾기 버튼 */}
          <button
            onClick={(e) => toggleFavorite(item.id, e)}
            className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center transition-all hover:bg-yellow-50 hover:border-yellow-200 hover:scale-110 shadow-sm"
            title="즐겨찾기 추가/해제"
          >
            {favorites.includes(item.id) ? (
              <RiStarFill className="text-yellow-400 text-lg drop-shadow-sm" />
            ) : (
              <RiStarLine className="text-slate-300 text-lg group-hover:text-yellow-400" />
            )}
          </button>
        </div>

        <div className="relative z-10 flex-grow">
          {/* 태그 */}
          <span className={`inline-block text-[10px] font-extrabold px-3 py-1 rounded-full mb-3 tracking-wide uppercase ${theme.bg} ${theme.text}`}>
            {item.type === 'WEB_TOOL' ? 'TOOL' : item.type.replace('_', ' ')}
          </span>

          {/* 제목 */}
          <h3 className="font-bold text-xl text-slate-800 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
            {item.title}
          </h3>

          {/* 설명 */}
          <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">
            {item.description || "설명이 없습니다."}
          </p>
        </div>

        {/* 하단 버튼 영역 */}
        <div className="mt-6 pt-4 border-t border-slate-50 flex justify-end items-center relative z-10">
          <span className={`text-xs font-bold flex items-center gap-1 transition-all group-hover:gap-2 ${theme.text}`}>
            바로가기 <RiArrowRightUpLine />
          </span>
        </div>
      </a>
    );
  };

  // 🚪 로그인 체크 중이면 로딩 화면 (깜빡임 방지)
  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-medium">Loading contents...</div>;
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* 헤더 섹션 */}
      <div className="relative w-full bg-white border-b border-slate-100 pb-12 pt-8 px-6">
        <div className="max-w-7xl mx-auto">
          {/* 상단 네비게이션 */}
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">D</div>
              <span className="font-bold text-slate-800 tracking-tight">DECON HUB</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/ideas" className="hidden md:flex items-center gap-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 px-4 py-2 rounded-xl transition-all text-xs font-bold border border-yellow-200">
                💡 아이디어 제안
              </Link>
              {isAdmin ? (
                <button onClick={() => router.push('/admin')} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl transition-all text-xs font-bold shadow-lg shadow-slate-200">
                  <RiAdminLine className="text-base" /> Admin
                </button>
              ) : (
                <Link href="/login" className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-800 transition-colors bg-slate-100 px-4 py-2 rounded-xl font-bold">
                  <RiAdminLine /> Staff Only
                </Link>
              )}
            </div>
          </div>

          {/* 타이틀 및 검색 */}
          <div className="flex flex-col md:flex-row gap-8 items-end justify-between">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold tracking-widest uppercase mb-4">Digital Transformation</span>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-4">
                Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Asset Library</span>
              </h1>
              <p className="text-slate-500 font-medium max-w-lg leading-relaxed">
                업무 효율화를 위한 모든 디지털 자산을 한곳에 모았습니다.<br className="hidden md:block" /> 필요한 도구를 쉽고 빠르게 찾아보세요.
              </p>
            </div>

            {/* 검색바 */}
            <div className="w-full md:w-auto relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <RiSearchLine className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                type="text" placeholder="Search assets..."
                className="pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl w-full md:w-80 text-sm font-medium focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 shadow-sm"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 필터 탭 */}
      <div className="sticky top-0 z-50 bg-[#F8FAFC]/80 backdrop-blur-md border-b border-white/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {['ALL', 'FAVORITE', 'WEB_TOOL', 'WEBSITE', 'DOC', 'SOFTWARE'].map(type => (
            <button key={type} onClick={() => setFilterType(type as any)}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all border whitespace-nowrap
                ${filterType === type
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md transform scale-105'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-white hover:border-slate-300 hover:text-slate-700 hover:shadow-sm'}`}>
              {getFilterIcon(type)}
              {getFilterLabel(type)}
            </button>
          ))}
        </div>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="max-w-7xl mx-auto px-6 py-12 pb-24">
        <div className="space-y-20">
          {filterType === 'ALL' && (
            <>
              {categoryOrder.map((type) => {
                const catItems = getFilteredItems(treasures, type);
                if (catItems.length === 0) return null;
                return (
                  <section key={type} className="animate-fade-in-up">
                    <div className="flex items-center gap-3 mb-8">
                      <div className={`p-2 rounded-lg bg-white shadow-sm border border-slate-100 ${categoryConfig[type].color}`}>
                        {categoryConfig[type].icon}
                      </div>
                      <h2 className="text-2xl font-bold text-slate-800">
                        {categoryConfig[type].label}
                      </h2>
                      <span className="ml-auto text-xs font-bold bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full">
                        {catItems.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {catItems.map(renderCard)}
                    </div>
                  </section>
                );
              })}
            </>
          )}

          {filterType !== 'ALL' && (
            <div className="animate-fade-in-up">
              <div className="flex items-center gap-3 mb-8">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                  {getFilterIcon(filterType)}
                  {getFilterLabel(filterType)}
                </h2>
                <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full">
                  {allFiltered.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {allFiltered.map(renderCard)}
              </div>
            </div>
          )}

          {allFiltered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200 mx-auto max-w-2xl">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                {filterType === 'FAVORITE' ? <RiStarFill className="text-2xl text-slate-300" /> : <RiSearchLine className="text-2xl text-slate-300" />}
              </div>
              <p className="text-sm font-medium">
                {filterType === 'FAVORITE' ? "아직 즐겨찾기한 항목이 없습니다." : "검색 결과가 없습니다."}
              </p>
            </div>
          )}
        </div>

        <footer className="text-center mt-32 pt-10 border-t border-slate-200">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-2">DECON Digital Hub</p>
          <p className="text-slate-300 text-[10px]">© 2024 Digital Contents Transformation Team. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}