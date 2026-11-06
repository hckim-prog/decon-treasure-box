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
export function heroVisual(){return `<figure class="hero-visual" aria-label="학생의 학습과 교수의 확인이 다음 수업으로 이어지는 흐름">
<div class="learning-board"><div class="visual-topline"><span>하나의 교재, 하나의 수업</span><span class="visual-symbol" aria-hidden="true">＋</span></div>
<p class="visual-heading">한 수업 안에서,<br>학습이 이어집니다.</p>
<div class="class-card"><div class="class-icon">${icon('book')}</div><div><span class="overline">우리 수업</span><strong>경영통계 <span>/ A분반</span></strong></div></div>
<div class="connection" aria-hidden="true"></div>
<div class="role-pair"><div class="role-tile student-tile"><div class="role-avatar">${icon('book')}</div><strong>학생은 학습하고</strong><span>자료 보기 / 퀴즈 풀기</span></div>
<div class="role-tile professor-tile"><div class="role-avatar">${icon('chart')}</div><strong>교수는 확인해요</strong><span>참여 현황 / 퀴즈 결과</span></div></div>
<div class="feedback-line">${icon('message')}<span>학습 → 확인 → 다음 수업의 보충 설명</span></div></div>
<figcaption class="visual-caption">수업과 화면은 이해를 돕기 위한 예시입니다.</figcaption></figure>`;}

