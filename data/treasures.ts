// src/data/treasures.ts

export type TreasureType = 'WEB_TOOL' | 'WEBSITE' | 'DOC' | 'SOFTWARE';

export interface Treasure {
    id: number;
    title: string;
    description: string;
    type: TreasureType;
    url: string;
}

// 짠! 이제 리스트가 텅 비었어. 여기에 우리 보물을 하나씩 채울 거야.
export const initialTreasures: Treasure[] = [
    {
        id: 1769047016976,
        title: '전자책 증정 서비스 홍보 웹 페이지',
        description: '전자책 증정 서비스 홍보 웹 페이지',
        type: 'DOC',
        url: 'https://ebook-event.vercel.app/ '
    }
];