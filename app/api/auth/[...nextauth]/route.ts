import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { google } from "googleapis";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        }),
    ],
    callbacks: {
        async signIn({ user }) {
            try {
                // 1. 로봇 로그인 (스프레드시트 볼 준비)
                const auth = new google.auth.GoogleAuth({
                    credentials: {
                        client_email: process.env.GOOGLE_SERVICE_CLIENT_EMAIL,
                        private_key: process.env.GOOGLE_SERVICE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                    },
                    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
                });

                const sheets = google.sheets({ version: 'v4', auth });

                // 2. 'Members' 시트의 A열(이메일 목록) 읽어오기
                const response = await sheets.spreadsheets.values.get({
                    spreadsheetId: process.env.GOOGLE_SHEET_ID,
                    range: 'Members!A:A', // ★ 시트 이름이 Members여야 해요!
                });

                const rows = response.data.values;

                // 명단이 비어있으면 아무도 못 들어오게 막음 (안전장치)
                if (!rows || rows.length === 0) return false;

                // 3. 가져온 명단(2차원 배열)을 1차원 리스트로 펴기
                const allowedEmails = rows.flat().map((email) => String(email).trim());

                // 4. 들어오려는 사람이 명단에 있는지 확인
                if (user.email && allowedEmails.includes(user.email)) {
                    console.log("환영합니다! 접속 성공:", user.email);
                    return true; // 문 열어줌! ⭕
                } else {
                    console.log("죄송합니다. 명단에 없습니다:", user.email);
                    return false; // 문 닫음! ❌ (Access Denied 화면 뜸)
                }

            } catch (error) {
                console.error("스프레드시트 연결 에러:", error);
                return false; // 에러나면 일단 문 닫음
            }
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };