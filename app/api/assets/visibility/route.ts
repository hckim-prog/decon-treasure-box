import { NextResponse } from "next/server";
import { google } from "googleapis";

const SHEET_NAME = "시트1";
const HIDDEN_COLUMN = "G";

export async function POST(request: Request) {
    try {
        const { id, hidden } = await request.json();

        if (!id || typeof hidden !== "boolean") {
            return NextResponse.json({ error: "id and hidden are required." }, { status: 400 });
        }

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_SERVICE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            },
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        const sheets = google.sheets({ version: "v4", auth });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;

        if (!spreadsheetId) {
            return NextResponse.json({ error: "GOOGLE_SHEET_ID is not configured." }, { status: 500 });
        }

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${SHEET_NAME}!A:A`,
        });

        const rows = response.data.values ?? [];
        const rowIndex = rows.findIndex((row) => String(row[0]) === String(id));

        if (rowIndex < 1) {
            return NextResponse.json({ error: "Asset not found." }, { status: 404 });
        }

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${SHEET_NAME}!${HIDDEN_COLUMN}${rowIndex + 1}`,
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [[hidden]],
            },
        });

        return NextResponse.json({ ok: true, id, hidden });
    } catch (error) {
        console.error("Visibility update failed:", error);
        return NextResponse.json({ error: "Visibility update failed." }, { status: 500 });
    }
}
