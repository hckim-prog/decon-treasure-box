'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession, signIn } from "next-auth/react";
import { FiSearch, FiExternalLink, FiGrid, FiGlobe, FiFileText, FiMonitor, FiLayers, FiDownloadCloud, FiZap, FiStar, FiVideo } from 'react-icons/fi';
import { RiAdminLine } from 'react-icons/ri';
import { CATEGORY_LABELS, DEFAULT_CATEGORY_ORDER, TreasureType, normalizeCategoryOrder } from '@/lib/categories';

// ✅ Apps Script 주소 (기존 주소 유지)
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx6JCrZqnS0nYAoourZqbkcXy4p4Nmof5H9MhWq2gu1xfk7grYWLy1yXlOFxZiAQP_q/exec';

interface Treasure {
  id: string;
  title: string;
  description: string;
  type: TreasureType;
  url: string;
  updatedAt?: string;
  hidden?: boolean | string;
}

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

  const [treasures, setTreasures] = useState<Treasure[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TreasureType | 'ALL' | 'FAVORITE'>('ALL');
  const [isAdmin] = useState(() =>
    typeof window !== 'undefined' && sessionStorage.getItem('isAdmin') === 'true'
  );
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];

    try {
      const savedFavs = localStorage.getItem('myDeconFavorites');
      return savedFavs ? JSON.parse(savedFavs) : [];
    } catch {
      return [];
    }
  });
  const isLogSent = useRef(false);

  // ✨ [추가됨] 카테고리 순서를 관리하는 상태 (기본값 설정)
  const [categoryOrder, setCategoryOrder] = useState<TreasureType[]>(DEFAULT_CATEGORY_ORDER);

  const isTreasureHidden = (treasure: Treasure) =>
    treasure.hidden === true || String(treasure.hidden).toLowerCase() === 'true';

  const formatUpdatedAt = (value?: string) => {
    if (!value) return '';

    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }

    return value.split(' ')[0] || value;
  };

  const loadInitialData = async () => {
    try {
      const [treasureRes, orderRes] = await Promise.all([
        fetch(APPS_SCRIPT_URL),
        fetch(`${APPS_SCRIPT_URL}?action=getOrder&t=${Date.now()}`),
      ]);

      const data = await treasureRes.json();
      if (Array.isArray(data)) {
        const sortedData = (data as Treasure[]).sort((a, b) => Number(b.id) - Number(a.id));
        setTreasures(sortedData);
      }

      const orderText = await orderRes.text();
      if (orderText && orderText !== "DEFAULT") {
        setCategoryOrder(normalizeCategoryOrder(orderText.split(',')));
      }
    } catch (error) {
      console.error("?곗씠??濡쒕뵫 ?ㅽ뙣:", error);
    }
  };

  useEffect(() => {
    if (bypassAuth) {
      const timer = window.setTimeout(() => {
        loadInitialData();
      }, 0);
      return () => window.clearTimeout(timer);
    }

    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      signIn('google');
      return;
    }

    if (session?.user?.email) {
      const adminStatus = sessionStorage.getItem('isAdmin');

      window.setTimeout(() => {
        loadInitialData();
      }, 0);

      // ✨ [추가됨] 구글 시트에서 저장된 카테고리 순서를 가져옵니다.

      if (!isLogSent.current && adminStatus !== 'true') {
        const params = new URLSearchParams();
        params.append('action', 'log');
        params.append('user', session.user.email);
        params.append('act', '메인 페이지 접속');

        fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString()
        });
        isLogSent.current = true;
      }
    }
  }, [status, session, bypassAuth]);

  // ✨ [추가됨] 구글 시트에서 순서를 읽어오는 함수
  async function fetchCategoryOrder() {
    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?action=getOrder&t=${Date.now()}`);
      const text = await res.text();
      if (text && text !== "DEFAULT") {
        setCategoryOrder(normalizeCategoryOrder(text.split(',')));
      }
    } catch (error) {
      console.error("순서 로딩 실패:", error);
    }
  }

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

  async function fetchTreasures() {
    try {
      const res = await fetch(APPS_SCRIPT_URL);
      const data = await res.json();
      if (Array.isArray(data)) {
        const sortedData = (data as Treasure[]).sort((a, b) => Number(b.id) - Number(a.id));
        setTreasures(sortedData);
      }
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
    }
  }

  const getFilteredItems = (items: Treasure[], type: TreasureType | 'ALL' | 'FAVORITE') => {
    return items.filter((item) => {
      if (!item.title) return false;
      if (isTreasureHidden(item)) return false;

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

  const getTypeBadgeStyle = (type: string) => {
    switch (type?.trim()) {
      case 'WEB_TOOL': return 'bg-[#eaf1ff] text-[#255ed3] border-[#c9d9ff]';
      case 'WEBSITE': return 'bg-[#ffe9ce] text-[#9a4f16] border-[#ffbe86]/60';
      case 'SOFTWARE': return 'bg-[#f4f7ff] text-[#546a7b] border-[#d9e3f7]';
      case 'DOC': return 'bg-[#fff7c8] text-[#8a7110] border-[#ffe156]/70';
      case 'VIDEO': return 'bg-[#fff0f3] text-[#b94d66] border-[#ffb5c2]';
      default: return 'bg-[#f8fafc] text-[#546a7b] border-[#d9e3f7]';
    }
  };

  const getFilterIcon = (type: string) => {
    switch (type) {
      case 'ALL': return <FiLayers />;
      case 'FAVORITE': return <FiStar className={filterType === 'FAVORITE' ? 'fill-current' : ''} />;
      case 'WEB_TOOL': return <FiGrid />;
      case 'WEBSITE': return <FiGlobe />;
      case 'DOC': return <FiFileText />;
      case 'SOFTWARE': return <FiMonitor />;
      case 'VIDEO': return <FiVideo />;
      default: return <FiLayers />;
    }
  };

  const getFilterLabel = (type: string) => {
    switch (type) {
      case 'ALL': return 'All Assets';
      case 'FAVORITE': return 'My Favorites';
      case 'WEB_TOOL': return 'Online Tools';
      case 'WEBSITE': return 'Portals';
      case 'DOC': return 'Documents';
      case 'SOFTWARE': return 'Desktop Apps';
      case 'VIDEO': return 'Videos';
      default: return type;
    }
  };

  const categoryConfig: Record<TreasureType, { label: string; icon: JSX.Element }> = {
    'WEB_TOOL': { label: CATEGORY_LABELS.WEB_TOOL, icon: <FiGrid className="text-[#3777ff]" size={22} /> },
    'WEBSITE': { label: CATEGORY_LABELS.WEBSITE, icon: <FiGlobe className="text-[#ff9f5c]" size={22} /> },
    'DOC': { label: CATEGORY_LABELS.DOC, icon: <FiFileText className="text-[#d6ae00]" size={22} /> },
    'SOFTWARE': { label: CATEGORY_LABELS.SOFTWARE, icon: <FiMonitor className="text-[#546a7b]" size={22} /> },
    'VIDEO': { label: CATEGORY_LABELS.VIDEO, icon: <FiVideo className="text-[#ff7e99]" size={22} /> },
  };

  const renderCard = (item: Treasure) => (
    <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="group relative bg-white rounded-2xl p-6 border border-[#ffe9ce] shadow-[0_2px_10px_-4px_rgba(84,106,123,0.16)] hover:shadow-[0_14px_34px_-16px_rgba(55,119,255,0.32)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-visible">
      <div className="absolute left-6 right-6 top-[4.5rem] z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 pointer-events-none">
        <div className="bg-[#18305f]/95 backdrop-blur-md text-white text-xs p-4 rounded-xl shadow-2xl border border-white/10 relative">
          <div className="absolute -top-1.5 left-4 w-3 h-3 bg-[#18305f]/95 border-t border-l border-white/10 transform rotate-45"></div>
          <p className="leading-relaxed font-medium text-[#fff7ec]">
            {item.description || "설명이 없습니다."}
          </p>
        </div>
      </div>

      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ffe9ce] to-[#ffb5c2]/70 group-hover:from-[#3777ff] group-hover:to-[#ffbe86] transition-all duration-500 rounded-t-2xl"></div>

      <div className="flex justify-between items-start mb-4 mt-1">
        <span className={`text-[10px] px-2.5 py-1 rounded-full border font-bold tracking-wider uppercase flex items-center gap-1.5 ${getTypeBadgeStyle(item.type)}`}>
          {item.type === 'SOFTWARE' ? <FiDownloadCloud /> : item.type === 'VIDEO' ? <FiVideo /> : <FiExternalLink />}
          {item.type === 'WEB_TOOL' ? 'TOOL' : item.type.replace('_', ' ')}
        </span>
        <button
          onClick={(e) => toggleFavorite(item.id, e)}
          className="w-8 h-8 rounded-full bg-[#fff8ec] hover:bg-[#fff2dc] flex items-center justify-center transition-colors z-20 cursor-pointer"
          title="즐겨찾기 추가/해제"
        >
          <FiStar
            className={`text-sm transition-colors ${favorites.includes(item.id) ? 'text-[#ffe156] fill-[#ffe156]' : 'text-[#c7d0dc] group-hover:text-[#ffbe86]'}`}
            size={16}
          />
        </button>
      </div>

      <h3 className="font-bold text-lg text-[#18305f] mb-2 leading-tight group-hover:text-[#3777ff] transition-colors relative z-10">
        {item.title}
      </h3>

      {formatUpdatedAt(item.updatedAt) && (
        <p className="text-[11px] text-[#7b8796] font-medium relative z-10">
          최종 업데이트: {formatUpdatedAt(item.updatedAt)}
        </p>
      )}

      <div className="flex-grow"></div>

      <div className="mt-6 pt-4 border-t border-[#fff3de] flex justify-end">
        <span className="group/btn flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#eef4ff] text-[#255ed3] text-xs font-bold transition-all duration-300 hover:bg-[#3777ff] hover:text-white hover:shadow-md cursor-pointer leading-none relative z-20">
          <FiZap className="text-[#3777ff] text-sm transition-colors group-hover/btn:text-white" />
          바로가기
        </span>
      </div>
    </a>
  );

  if (!bypassAuth && status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center bg-[#fff8ec] text-[#7b8796]">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-[#fff8ec] font-sans selection:bg-[#ffe156]/60 selection:text-[#18305f]">
      <div className="relative w-full h-[400px] bg-[#18305f] overflow-hidden flex flex-col justify-center items-center text-center px-4">
        <iframe
          src='https://my.spline.design/boxeshover-bh1N84ii3IdAYEwcUbzpQj5W/'
          frameBorder='0' width='100%' height='100%' className="absolute inset-0 w-full h-full z-0"
        ></iframe>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#18305f]/62 to-[#18305f]/92 pointer-events-none z-10"></div>
        <div className="relative z-20 max-w-2xl text-white mt-4 pointer-events-none">
          <div className="flex justify-center mb-4">
            <span className="bg-[#ffe9ce]/15 border border-[#ffbe86]/30 text-[#ffe9ce] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm shadow-lg">
              Digital Contents Transformation Team
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white drop-shadow-2xl">
            DECON <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe156] via-[#ffbe86] to-[#ffb5c2]">Digital Hub</span>
          </h1>
          <p className="text-[#fff4dc] text-sm md:text-base font-medium max-w-lg mx-auto leading-relaxed opacity-90">
            업무 효율화를 위한 모든 디지털 자산을 한곳에.<br />
            필요한 도구와 문서를 빠르고 쉽게 찾아보세요.
          </p>
        </div>

        <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
          <Link href="/ideas" className="flex items-center gap-2 bg-[#ffe156] hover:bg-[#ffbe86] text-[#18305f] px-4 py-2 rounded-full transition-all text-xs font-bold shadow-lg shadow-[#ffe156]/20 hover:scale-105">
            💡 아이디어 제안
          </Link>
          {isAdmin ? (
            <button onClick={() => router.push('/admin')} className="flex items-center gap-2 bg-[#3777ff] hover:bg-[#255ed3] text-white px-4 py-2 rounded-full transition-all text-xs font-bold shadow-lg shadow-[#3777ff]/30">
              <RiAdminLine className="text-lg" /> Admin Dashboard
            </button>
          ) : (
            <Link href="/login" className="flex items-center gap-2 text-xs text-[#ffe9ce]/80 hover:text-white transition-colors bg-black/20 px-3 py-1.5 rounded-full hover:bg-black/40 backdrop-blur-sm border border-[#ffe9ce]/20">
              <RiAdminLine /> 관리자 전용
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-20 pb-20">
        <div className="sticky top-6 z-40 bg-white/92 backdrop-blur-xl rounded-2xl shadow-xl border border-[#ffe9ce] p-6 mb-10 ring-1 ring-[#ffbe86]/15 transition-all duration-300">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-72 flex-shrink-0 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-[#3777ff]">
                <FiSearch className="text-[#9aa7b6]" />
              </div>
              <input
                type="text" placeholder="검색..."
                className="pl-10 p-3 bg-[#fff8ec] border border-[#ffe9ce] rounded-xl w-full text-sm focus:ring-2 focus:ring-[#3777ff] focus:bg-white outline-none transition-all placeholder:text-[#9aa7b6]"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 flex-nowrap items-center">
              {/* ✨ [수정됨] 상단 탭 버튼도 categoryOrder 순서대로 나오게 변경 */}
              {(['ALL', 'FAVORITE', ...categoryOrder] as Array<TreasureType | 'ALL' | 'FAVORITE'>).map(type => (
                <button key={type} onClick={() => setFilterType(type)}
                  className={`flex items-center gap-2 px-4 py-2 text-[11px] font-bold rounded-full transition-all border whitespace-nowrap flex-shrink-0
                    ${filterType === type
                      ? type === 'FAVORITE'
                        ? 'bg-[#fff7c8] text-[#8a7110] border-[#ffe156] shadow-md transform scale-105'
                        : 'bg-[#3777ff] text-white border-[#3777ff] shadow-md transform scale-105'
                      : 'bg-white text-[#546a7b] border-[#ffe9ce] hover:bg-[#fff8ec] hover:border-[#ffbe86] hover:text-[#18305f]'}`}>
                  {getFilterIcon(type)}
                  {getFilterLabel(type)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-16">
          {filterType === 'ALL' && (
            <>
              {/* ✨ [수정됨] 메인 카테고리들도 categoryOrder 순서대로 화면에 그림 */}
              {categoryOrder.map((type) => {
                const catItems = getFilteredItems(treasures, type);
                if (catItems.length === 0) return null;
                return (
                  <section key={type} className="animate-fade-in-up">
                    <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[#ffe9ce]">
                      <h2 className="text-xl font-bold text-[#18305f] flex items-center gap-3">
                        {categoryConfig[type].icon}
                        {categoryConfig[type].label}
                      </h2>
                      <span className="text-xs bg-white text-[#546a7b] font-bold px-2.5 py-1 rounded-full border border-[#ffe9ce]">
                        {catItems.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {catItems.map(renderCard)}
                    </div>
                  </section>
                );
              })}
            </>
          )}

          {filterType !== 'ALL' && (
            <div className="animate-fade-in-up">
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[#ffe9ce]">
                <h2 className="text-xl font-bold text-[#18305f] flex items-center gap-3">
                  {getFilterIcon(filterType)}
                  {getFilterLabel(filterType)}
                </h2>
                <span className="text-xs bg-white text-[#546a7b] font-bold px-2.5 py-1 rounded-full border border-[#ffe9ce]">
                  {allFiltered.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allFiltered.map(renderCard)}
              </div>
            </div>
          )}

          {allFiltered.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-[#7b8796] bg-white/60 rounded-2xl border border-dashed border-[#ffbe86]/60">
              {filterType === 'FAVORITE' ? <FiStar className="text-4xl mb-4 text-[#ffe156]" /> : <FiSearch className="text-4xl mb-4 text-[#ffbe86]" />}
              <p className="text-sm">
                {filterType === 'FAVORITE' ? "아직 즐겨찾기한 항목이 없습니다. ⭐ 별표를 눌러 추가해보세요!" : "검색 결과가 없습니다."}
              </p>
            </div>
          )}
        </div>

        <footer className="text-center text-[#9aa7b6] text-[10px] uppercase tracking-widest mt-24 py-10 border-t border-[#ffe9ce]">
          © DECON Digital Contents Transformation Team. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
