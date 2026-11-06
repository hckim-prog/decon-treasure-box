export const meta = {
 title:'HA+ LAB(LMS) | 수업과 학습을 연결합니다',
 date:'2026.11.06',
 requestUrl:'https://docs.google.com/document/d/1m7HI-JXl9AgTg43aH0IKRbLVtceNkyW2oaJC3Vp41n8/edit?tab=t.0',
 originalUrl:'https://docs.google.com/document/d/1GWbCywDhVdEbfD8GXneoHl_2kQ4HWUKr3WlTtPl7MV4/edit?tab=t.c3binuv9q9xv',
 pdfUrl:'./ha-lab-introduction.pdf',
 drivePdfUrl:'https://drive.google.com/file/d/1aIMt3FcuBKfTNoFV5o4nVHxwNYtV0DF_/view?usp=drivesdk'
};
// One content source for the introduction website and PDF.
export const steps = [
 {no:'01',icon:'settings',role:'운영 담당자 / 교수',title:'수업을 준비해요',desc:'운영 담당자가 교재와 수업 반을 연결합니다. 교수는 교재를 확인하고 학생에게 참여 코드를 안내합니다.'},
 {no:'02',icon:'book',role:'학생',title:'참여하고 공부해요',desc:'코드로 수업에 참여합니다. 교재의 해설과 자료를 보고, 퀴즈를 풀며 학습합니다.'},
 {no:'03',icon:'chart',role:'교수',title:'학습 현황을 살펴봐요',desc:'누가 참여했는지, 퀴즈를 풀었는지, 어떤 문제를 많이 틀렸는지 확인합니다.'},
 {no:'04',icon:'message',role:'교수',title:'다음 수업에 활용해요',desc:'학생들이 어려워한 부분을 다시 설명하고, 공지로 다음 학습을 안내합니다.'}
];
export const sample = {
 course:'경영통계',semester:'2027년 1학기',section:'A분반',
 quiz:'2장 확인 퀴즈',participants:20,submitted:15,unsubmitted:5,
 wrongQuestion:3,wrongCount:7,wrongStudents:4,
 notice:'다음 수업에서 3번 문제를 함께 풀어봅니다.'
};
