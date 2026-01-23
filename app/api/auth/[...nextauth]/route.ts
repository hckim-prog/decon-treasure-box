// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        }),
    ],
    callbacks: {
        async signIn({ user }) {
            // 🛑 [수정] 허용할 이메일 도메인 (테스트용: @gmail.com)
            // 나중에 실제 회사 도메인(예: @samsung.com)으로 바꾸세요.
            const allowedDomain = "@gmail.com";

            if (user.email?.endsWith(allowedDomain)) {
                return true;
            } else {
                console.log("외부인 차단:", user.email);
                return false;
            }
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };