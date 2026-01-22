// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ⚠️ [중요] 아까 사용하던 구글 시트 '읽기 전용(CSV)' 주소를 여기에 다시 넣어주세요!
const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRQ41AdRgnzLe5cm2fRRZIPk2Bbauiqw5Ec6XPpT1YqZJFkfDvHYtHxwjJfoJqLNvbPCSup0Qa021YO/pub?output=csv';

type TreasureType = 'WEB_TOOL' | 'WEBSITE' | 'DOC' | 'SOFTWARE';
interface Treasure {
  id: string; title: string; description: string; type: TreasureType; url: string;
}

export default function Home() {
  const router = useRouter();
  const [treasures, setTreasures] = useState<Treasure[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TreasureType | 'ALL'>('ALL');

  // 관리자 여부 확인
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // 1. 관리자 로그인 여부 체크
    const adminStatus = sessionStorage.getItem('isAdmin');
    setIsAdmin(adminStatus === 'true');

    // 2. 엑셀 데이터 가져오기 (캐시 무시 기능 포함)
    const timeStamp = new Date().getTime();
    Papa.parse(`${GOOGLE_SHEET_CSV_URL}&t=${timeStamp}`, {
      download: true,
      header: true,
      complete: (results) => {
        setTreasures(results.data as Treasure[]);
      },
    });
  }, []);

  const filtered = treasures.filter((item) => {
    if (!item.title) return false;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  // ⭐ [변경점 1] 카드 위에 붙는 배지 색상
  const getBadgeColor = (type: string) => {
    switch (type?.trim()) {
      case 'WEB_TOOL': return 'bg-blue-600';
      case 'WEBSITE': return 'bg-indigo-600';
      case 'SOFTWARE': return 'bg-slate-700';
      case 'DOC': return 'bg-emerald-600';
      default: return 'bg-gray-500';
    }
  };

  // ⭐ [변경점 2] 필터 버튼에 표시될 멋진 비즈니스 용어들!
  const getFilterLabel = (type: string) => {
    switch (type) {
      case 'ALL': return 'ALL ASSETS';          // 전체 보기
      case 'WEB_TOOL': return 'ONLINE TOOLS';   // 온라인 도구
      case 'WEBSITE': return 'PORTALS & SITES'; // 포털 및 사이트
      case 'DOC': return 'DOCUMENTS';           // 문서 자료
      case 'SOFTWARE': return 'DESKTOP APPS';   // 설치형 프로그램
      default: return type;
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white py-6 px-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">DECON Digital Hub</h1>
          <p className="text-slate-400 text-sm mt-1">디지털 전환 TF팀 자산 라이브러리</p>
        </div>

        {/* 스마트 버튼: 관리자면 '입장', 아니면 '로그인' */}
        {isAdmin ? (
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2 bg-indigo-600 border border-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-500 transition-colors font-bold text-sm"
          >
            👑 관리자 페이지 입장
          </button>
        ) : (
          <Link href="/login" className="text-xs text-slate-400 border border-slate-700 px-3 py-1 rounded hover:bg-slate-800 transition-colors">
            Authorized Personnel Only
          </Link>
        )}
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* 검색 및 필터 영역 */}
        <div className="flex flex-col md:flex-row gap-6 justify-between mb-10 items-end border-b border-slate-200 pb-6">
          <div className="w-full md:w-96">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Search Assets</label>
            <input
              type="text" placeholder="자산명, 키워드 검색..."
              className="p-3 border rounded-lg w-full shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* 👇 필터 버튼들 (함수를 통해 멋진 이름으로 바뀜) */}
          <div className="flex gap-2 flex-wrap">
            {['ALL', 'WEB_TOOL', 'WEBSITE', 'DOC', 'SOFTWARE'].map(type => (
              <button key={type} onClick={() => setFilterType(type as any)}
                className={`px-4 py-2 text-xs font-bold rounded-md transition-all uppercase tracking-wide
                  ${filterType === type ? 'bg-slate-800 text-white shadow-md' : 'bg-white border text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}>
                {getFilterLabel(type)}
              </button>
            ))}
          </div>
        </div>

        {/* 카드 리스트 영역 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item, idx) => (
            <a key={idx} href={item.url} target="_blank" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all border border-slate-200 group flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                {/* 배지 이름은 데이터베이스 값(WEB_TOOL 등)을 공백으로 바꿔서 보여줌 */}
                <span className={`text-[10px] text-white px-2 py-1 rounded font-bold tracking-wider ${getBadgeColor(item.type)}`}>
                  {item.type.replace('_', ' ')}
                </span>
                <span className="text-slate-300 group-hover:text-indigo-500 transition-colors">↗</span>
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2 leading-tight">{item.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-2 flex-grow">{item.description}</p>
              <div className="mt-5 pt-4 border-t border-slate-50 text-right">
                <span className="text-xs font-bold text-indigo-600 group-hover:underline">바로가기 &rarr;</span>
              </div>
            </a>
          ))}
          {filtered.length === 0 && <div className="col-span-full text-center py-20 text-slate-400 bg-white rounded-lg border border-dashed border-slate-300">등록된 자산이 없습니다.</div>}
        </div>
      </div>
    </main>
  );
}