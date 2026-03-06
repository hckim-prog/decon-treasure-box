import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                decon: {
                    gunmetal: '#393d3f', // 기본 텍스트, 진한 배경
                    white: '#fdfdff',    // 쿨톤 화이트 (메인 배경)
                    silver: '#c6c5b9',   // 테두리, 은은한 보조색
                    pacific: '#62929e',  // 메인 포인트 컬러 (버튼, 아이콘)
                    slate: '#546a7b',    // 서브 포인트 컬러 (뱃지, 탭)
                }
            }
        }
    },
    plugins: [],
}
export default config