'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession, signIn } from "next-auth/react";
import { FiSearch, FiExternalLink, FiGrid, FiGlobe, FiFileText, FiMonitor, FiLayers, FiDownloadCloud, FiZap, FiStar } from 'react-icons/fi';
import { RiAdminLine } from 'react-icons/ri';

// ✅ Apps Script 주소 (기존 주소 유지)
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx6JCrZqnS0nYAoourZqbkcXy4p4Nmof5H9MhWq2gu1xfk7grYWLy1yXlOFxZiAQP_q/exec';

type TreasureType = 'WEB_TOOL' | 'WEBSITE' | 'DOC' | 'SOFTWARE';
interface Treasure {
  id: string; title: string; description: string; type: TreasureType; url: string;
}

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [treasures, setTreasures] = useState<Treasure[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TreasureType | 'ALL' | 'FAVORITE'>('ALL');
  const [isAdmin, setIsAdmin] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLogSent, setIsLogSent] = useState(false);

  const [categoryOrder, setCategoryOrder] = useState<TreasureType[]>(['WEB_TOOL', 'WEBSITE', 'DOC', 'SOFTWARE']);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      signIn('google');
      return;
    }

    if (session?.user?.email) {
      const adminStatus = sessionStorage.getItem('isAdmin');
      setIsAdmin(adminStatus === 'true');

      fetchTreasures();
      fetchCategoryOrder();

      const savedFavs = localStorage.getItem('myDeconFavorites');
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      }

      if (!isLogSent && adminStatus !== 'true') {
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
        setIsLogSent(true);
      }
    }
  }, [status, session]);

  const fetchCategoryOrder = async () => {
    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?action=getOrder&t=${Date.now()}`);
      const text = await res.text();
      if (text && text !== "DEFAULT" && text.includes(',')) {
        const newOrder = text.split(',') as TreasureType[];
        setCategoryOrder(newOrder);
      }
    } catch (error) {
      console.error("순서 로딩 실패:", error);
    }
  };

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

  // ✨ 컬러 배합 적용
  const getThemeColor = (type: string) => {
    switch (type?.trim()) {
      case 'WEB_TOOL': return { bg: 'bg-decon-pacific/10', text: 'text-decon-pacific', border: 'border-decon-pacific/20', hover: 'group-hover:border-decon-pacific/40', iconBg: 'bg-decon-pacific/20' };
      case 'WEBSITE': return { bg: 'bg-decon-slate/10', text: 'text-decon-slate', border: 'border-decon-slate/20', hover: 'group-hover:border-decon-slate/40', iconBg: 'bg-decon-slate/20' };
      case 'SOFTWARE': return { bg: 'bg-decon-silver/20', text: 'text-decon-gunmetal', border: 'border-decon-silver', hover: 'group-hover:border-decon-gunmetal/30', iconBg: 'bg-decon-silver/40' };
      case 'DOC': return { bg: 'bg-decon-gunmetal/5', text: 'text-decon-gunmetal', border: 'border-decon-gunmetal/10', hover: 'group-hover:border-decon-gunmetal/30', iconBg: 'bg-decon-gunmetal/10' };
      default: return { bg: 'bg-decon-white', text: 'text-decon-slate', border: 'border-decon-silver', hover: 'group-hover:border-decon-silver', iconBg: 'bg-decon-silver/20' };
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
      default: return type;
    }
  };

  const categoryConfig: Record<TreasureType, { label: string; icon: JSX.Element; color: string }> = {
    'WEB_TOOL': { label: 'Online Tools', icon: <FiGrid size={22} />, color: 'text-decon-pacific' },
    'WEBSITE': { label: 'Portals & Sites', icon: <FiGlobe size={22} />, color: 'text-decon-slate' },
    'DOC': { label: 'Documents', icon: <FiFileText size={22} />, color: 'text-decon-gunmetal' },
    'SOFTWARE': { label: 'Desktop Apps', icon: <FiMonitor size={22} />, color: 'text-decon-slate' },
  };

  const renderCard = (item: Treasure) => {
    const theme = getThemeColor(item.type);
    return (
      <a key={item.id} href={item.url} target="_blank" className={`group relative flex flex-col h-full bg-white rounded-2xl p-6 border shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-[0_10px_30px_-10px_rgba(98,146,158,0.2)] hover:-translate-y-1 overflow-visible ${theme.border} ${theme.hover}`}>
        <div className="absolute left-6 right-6 top-[4.5rem] z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 pointer-events-none">
          <div className="bg-decon-gunmetal/95 backdrop-blur-md text-decon-white text-xs p-4 rounded-xl shadow-2xl border border-decon-silver/20 relative">
            <div className="absolute -top-1.5 left-4 w-3 h-3 bg-decon-gunmetal/95 border-t border-l border-decon-silver/20 transform rotate-45"></div>
            <p className="leading-relaxed font-medium">
              {item.description || "설명이 없습니다."}
            </p>
          </div>
        </div>

        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-decon-silver/30 to-decon-silver/50 group-hover:from-decon-pacific group-hover:to-decon-slate transition-all duration-500 rounded-t-2xl"></div>

        <div className="flex justify-between items-start mb-4 mt-1 relative z-10">
          <span className={`text-[10px] px-2.5 py-1 rounded-full border font-bold tracking-wider uppercase flex items-center gap-1.5 ${theme.bg} ${theme.text} ${theme.border}`}>
            {item.type === 'SOFTWARE' ? <FiDownloadCloud /> : <FiExternalLink />}
            {item.type === 'WEB_TOOL' ? 'TOOL' : item.type.replace('_', ' ')}
          </span>
          <button
            onClick={(e) => toggleFavorite(item.id, e)}
            className="w-8 h-8 rounded-full bg-decon-white hover:bg-decon-pacific/10 border border-transparent hover:border-decon-pacific/20 flex items-center justify-center transition-all z-20 cursor-pointer"
            title="즐겨찾기 추가/해제"
          >
            <FiStar
              className={`text-sm transition-colors ${favorites.includes(item.id) ? 'text-yellow-400 fill-yellow-400' : 'text-decon-silver group-hover:text-decon-pacific'}`}
              size={16}
            />
          </button>
        </div>

        <h3 className="font-bold text-lg text-decon-gunmetal mb-2 leading-tight group-hover:text-decon-pacific transition-colors relative z-10">
          {item.title}
        </h3>

        <div className="flex-grow"></div>

        <div className="mt-6 pt-4 border-t border-decon-silver/30 flex justify-end">
          <span className="group/btn flex items-center gap-1.5 px-4 py-2 rounded-full bg-decon-white border border-decon-silver/50 text-decon-slate text-xs font-bold transition-all duration-300 hover:bg-decon-pacific hover:border-decon-pacific hover:text-white hover:shadow-md cursor-pointer leading-none relative z-20">
            <FiZap className="text-decon-pacific text-sm transition-colors group-hover/btn:text-white" />
            바로가기
          </span>
        </div>
      </a>
    );
  };

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center bg-decon-white text-decon-slate font-medium">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-decon-white font-sans selection:bg-decon-pacific/20 selection:text-decon-gunmetal">
      <div className="relative w-full h-[400px] bg-decon-gunmetal overflow-hidden flex flex-col justify-center items-center text-center px-4">
        <iframe
          src='https://my.spline.design/boxeshover-bh1N84ii3IdAYEwcUbzpQj5W/'
          frameBorder='0' width='100%' height='100%' className="absolute inset-0 w-full h-full z-0"
        ></iframe>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-decon-gunmetal/60 to-decon-gunmetal/90 pointer-events-none z-10"></div>
        <div className="relative z-20 max-w-2xl text-decon-white mt-4 pointer-events-none">
          <div className="flex justify-center mb-4">
            <span className="bg-decon-white/10 border border-decon-white/20 text-decon-pacific text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm shadow-lg">
              Digital Contents Transformation Team
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-decon-white drop-shadow-2xl">
            DECON <span className="text-transparent bg-clip-text bg-gradient-to-r from-decon-pacific to-decon-silver">Digital Hub</span>
          </h1>
          <p className="text-decon-silver text-sm md:text-base font-medium max-w-lg mx-auto leading-relaxed opacity-90">
            업무 효율화를 위한 모든 디지털 자산을 한곳에.<br />
            필요한 도구와 문서를 빠르고 쉽게 찾아보세요.
          </p>
        </div>

        <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
          <Link href="/ideas" className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-decon-gunmetal px-4 py-2 rounded-full transition-all text-xs font-bold shadow-lg shadow-yellow-400/20 hover:scale-105">
            💡 아이디어 제안
          </Link>
          {isAdmin ? (
            <button onClick={() => router.push('/admin')} className="flex items-center gap-2 bg-decon-pacific hover:bg-[#507c87] text-white px-4 py-2 rounded-full transition-all text-xs font-bold shadow-lg shadow-decon-pacific/30">
              <RiAdminLine className="text-lg" /> Admin Dashboard
            </button>
          ) : (
            <Link href="/login" className="flex items-center gap-2 text-xs text-decon-silver hover:text-white transition-colors bg-black/20 px-3 py-1.5 rounded-full hover:bg-black/40 backdrop-blur-sm border border-white/10">
              <RiAdminLine /> 관리자 전용
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-20 pb-20">
        <div className="sticky top-6 z-40 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-decon-silver/20 p-6 mb-10 ring-1 ring-decon-gunmetal/5 transition-all duration-300">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-72 flex-shrink-0 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-decon-pacific">
                <FiSearch className="text-decon-silver" />
              </div>
              <input
                type="text" placeholder="검색..."
                className="pl-10 p-3 bg-decon-white border border-decon-silver/60 rounded-xl w-full text-sm focus:ring-2 focus:ring-decon-pacific/20 focus:border-decon-pacific outline-none transition-all placeholder:text-decon-silver text-decon-gunmetal"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide flex-nowrap items-center">
              {['ALL', 'FAVORITE', ...categoryOrder].map(type => (
                <button key={type} onClick={() => setFilterType(type as any)}
                  className={`flex items-center gap-2 px-4 py-2 text-[11px] font-bold rounded-full transition-all border whitespace-nowrap flex-shrink-0
                    ${filterType === type
                      ? type === 'FAVORITE'
                        ? 'bg-yellow-50 text-yellow-600 border-yellow-200 shadow-md transform scale-105'
                        : 'bg-decon-gunmetal text-decon-white border-decon-gunmetal shadow-md transform scale-105'
                      : 'bg-decon-white text-decon-slate border-decon-silver hover:bg-white hover:border-decon-slate hover:text-decon-gunmetal'}`}>
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
              {categoryOrder.map((type) => {
                const catItems = getFilteredItems(treasures, type);
                if (catItems.length === 0) return null;
                return (
                  <section key={type} className="animate-fade-in-up">
                    <div className="flex items-center gap-3 mb-6 pb-3 border-b border-decon-silver/40">
                      <h2 className={`text-xl font-bold flex items-center gap-3 ${categoryConfig[type].color}`}>
                        {categoryConfig[type].icon}
                        <span className="text-decon-gunmetal">{categoryConfig[type].label}</span>
                      </h2>
                      <span className="text-xs bg-decon-white text-decon-slate font-bold px-2.5 py-1 rounded-full border border-decon-silver">
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
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-decon-silver/40">
                <h2 className="text-xl font-bold text-decon-gunmetal flex items-center gap-3">
                  <span className="text-decon-pacific">{getFilterIcon(filterType)}</span>
                  {getFilterLabel(filterType)}
                </h2>
                <span className="text-xs bg-decon-white text-decon-slate font-bold px-2.5 py-1 rounded-full border border-decon-silver">
                  {allFiltered.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allFiltered.map(renderCard)}
              </div>
            </div>
          )}

          {allFiltered.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-decon-slate bg-white/50 rounded-2xl border border-dashed border-decon-silver">
              {filterType === 'FAVORITE' ? <FiStar className="text-4xl mb-4 text-decon-silver/50" /> : <FiSearch className="text-4xl mb-4 text-decon-silver/50" />}
              <p className="text-sm">
                {filterType === 'FAVORITE' ? "아직 즐겨찾기한 항목이 없습니다. ⭐ 별표를 눌러 추가해보세요!" : "검색 결과가 없습니다."}
              </p>
            </div>
          )}
        </div>

        <footer className="text-center text-decon-slate/70 text-[10px] uppercase tracking-widest mt-24 py-10 border-t border-decon-silver/30">
          © DECON Digital Contents Transformation Team. All rights reserved.
        </footer>
      </div>
    </main>
  );
}