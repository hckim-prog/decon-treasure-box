# HA+ LAB(LMS) 소개 페이지

한빛아카데미가 자체 개발을 추진하는 HA+ LAB(LMS)의 서비스 소개 페이지입니다. 교수, 학생, 운영 담당자의 역할과 수업 흐름, 핵심 기능과 확장 방향을 설명합니다. 화면과 수치는 구현 방향을 보여주는 가상 예시입니다.

## 확인하기

- [소개 페이지](https://ha-lab-visual-guide.vercel.app): 공개 웹사이트
- [소개 PDF](https://ha-lab-visual-guide.vercel.app/ha-lab-introduction.pdf): 같은 내용을 담은 5쪽 소개 자료
- [Google Drive 소개 PDF](https://drive.google.com/file/d/1aIMt3FcuBKfTNoFV5o4nVHxwNYtV0DF_/view)

## 구성

1. 서비스 소개와 사용자별 역할
2. 수업 준비, 학생 학습, 현황 확인, 다음 수업 활용
3. 교수 화면과 학생 화면 예시
4. 자체 개발의 핵심 기능과 확장 방향
5. 자체 개발 전환 전에 작성한 기능 기획 참고자료

## 수정과 실행

Node.js가 설치되어 있으면 별도 패키지 설치 없이 실행할 수 있습니다.

```sh
npm run build
npm start
```

- `src/content.mjs`: 소개 문구, 수업 흐름, 예시 수치와 문서 주소
- `src/visuals.mjs`: 설명 그림과 아이콘
- `src/style.css`: 화면과 인쇄 스타일
- `scripts/build.mjs`: 자체 포함 HTML 생성
- `public/`: 배포할 파일

브라우저 인쇄에서는 A4 가로, 배경 그래픽 포함, 머리글과 바닥글 해제를 선택합니다. 내용을 바꾸면 PDF도 함께 갱신합니다.

## 디자인과 글꼴

화면의 본문은 18px, 보조 설명은 최소 16px을 기준으로 구성했습니다. 교수 화면과 학생 화면은 각각 넓은 영역에 배치하고, 모바일에서는 한 열로 이어집니다. PDF는 소개, 수업 흐름, 핵심 기능과 확장 방향, 교수 화면, 학생 화면의 5쪽 구성입니다.

`public/fonts/ha-lab-sans.woff2`는 [Google Fonts의 Noto Sans KR](https://github.com/google/fonts/tree/main/ofl/notosanskr) 가변 글꼴에서 현재 소개 문구와 기본 영문 문자를 추린 파일입니다. SIL Open Font License 1.1이 적용되며 원문은 같은 폴더의 `OFL.txt`에 있습니다. 빌드 과정에서 글꼴을 HTML에 포함하므로 외부 글꼴 서버에 연결하지 않습니다. 소개 문구에 새로운 한글 문자를 추가하면 글꼴 파일도 갱신해야 하며, 포함되지 않은 문자는 시스템 글꼴로 표시됩니다.

## GitHub와 Vercel

공개 저장소 `hckim-prog/decon-treasure-box`의 `ha-lab-introduction-20261106` 브랜치, `ha-lab-visual-guide` 폴더에 보관합니다.

Vercel 설정:

- Source branch: `ha-lab-introduction-20261106`
- Root Directory: `ha-lab-visual-guide`
- Framework: Other
- Build Command: `npm run build`
- Output Directory: `public`
- 별도 환경 변수 없음

`vercel.json`에 빌드와 응답 헤더 설정을 포함했습니다. 로그인 기능은 없으며, 실제 배포 접근 범위는 Vercel 프로젝트 설정을 따릅니다.

## 출처

- [HA+ LAB LMS 기능 요청서 / 탭 1](https://docs.google.com/document/d/1m7HI-JXl9AgTg43aH0IKRbLVtceNkyW2oaJC3Vp41n8/edit?tab=t.0)
- [HA+ LAB LMS 기능 요청 요약 / 탭 2](https://docs.google.com/document/d/1m7HI-JXl9AgTg43aH0IKRbLVtceNkyW2oaJC3Vp41n8/edit?tab=t.6uz6obkfbm2s)
- [원문 요구사항](https://docs.google.com/document/d/1GWbCywDhVdEbfD8GXneoHl_2kQ4HWUKr3WlTtPl7MV4/edit?tab=t.k5weklx7bz7w)

2026.11.06 확인. 참고 문서는 자체 개발 전환 전에 작성된 요구사항이며, 세부 범위는 자체 개발 방향에 맞춰 재정리할 예정입니다. 원문은 수정하지 않고 소개 페이지에 이러한 맥락을 안내합니다.

## 확인 결과

1440 / 1024 / 768 / 390 / 320px 화면에서 표시되는 글씨가 최소 16px인지, 가로 넘침, 깨진 문자와 페이지 내 연결 오류가 없는지 확인했습니다. PDF는 A4 가로 5쪽이며 한글 표시와 배치를 확인했습니다.
