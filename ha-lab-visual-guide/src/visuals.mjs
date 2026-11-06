const icons={
 book:'<path d="M3 4.5h6a4 4 0 0 1 3 1.3 4 4 0 0 1 3-1.3h6v15h-6a4 4 0 0 0-3 1.3 4 4 0 0 0-3-1.3H3zM12 6v15M6 9h3m-3 4h3m6-4h3m-3 4h3"/>',
 settings:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4m8-4v4M7 14h4m-4 3h8"/>',
 chart:'<path d="M4 3v17h17M8 16v-5m5 5V6m5 10V9"/>',
 message:'<path d="M5 4h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-8l-6 3v-3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM7 9h10M7 13h7"/>',
 arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>',
 download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4"/>',
 check:'<path d="m5 12 4 4L19 6"/>',
 play:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3z"/>',
 quiz:'<rect x="4" y="3" width="16" height="18" rx="3"/><path d="m8 9 2 2 5-5m-7 9h8m-8 3h5"/>',
 archive:'<path d="M4 9h16v12H4zM3 3h18v6H3zM9 13h6"/>'
};
export const icon=(name)=>`<svg class="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.book}</svg>`;
export function heroVisual(){return `<div class="hero-visual" role="img" aria-label="하나의 수업 안에서 학생은 교재 자료와 퀴즈로 학습하고, 교수는 학습 현황을 확인해 보충 설명으로 연결합니다.">
<div class="visual-topline"><span>하나의 교재, 하나의 수업</span><span class="visual-symbol">＋</span></div>
<div class="class-card"><div class="class-icon">${icon('book')}</div><div><span class="overline">우리 수업</span><strong>경영통계 <span>A분반</span></strong><small>수업을 중심으로 학습 기록을 모아요</small></div></div>
<div class="connection" aria-hidden="true"><span></span><span></span></div>
<div class="role-pair">
<div class="role-tile student-tile"><div class="role-avatar">${icon('book')}</div><strong>학생은 학습하고</strong><span>자료 보기 / 퀴즈 풀기</span><div class="mini-material"><i></i><div><b>2장 학습자료</b><span>해설과 퀴즈</span></div>${icon('check')}</div></div>
<div class="role-tile professor-tile"><div class="role-avatar">${icon('chart')}</div><strong>교수는 확인해요</strong><span>학습 현황 / 많이 틀린 문제</span><div class="mini-chart" aria-hidden="true"><i style="height:34%"></i><i style="height:62%"></i><i style="height:88%"></i><i style="height:46%"></i><span>학습 현황</span></div></div>
</div><div class="feedback-line">${icon('message')}<span>확인한 내용을 보충 설명과 공지로 연결해요</span></div><div class="visual-caption">이해를 돕기 위한 구성 예시</div></div>`;}

