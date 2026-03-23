export const ASSET_CATEGORIES = [
    "WEB_TOOL",
    "WEBSITE",
    "DOC",
    "SOFTWARE",
    "VIDEO",
] as const;

export type TreasureType = (typeof ASSET_CATEGORIES)[number];

export const DEFAULT_CATEGORY_ORDER: TreasureType[] = [...ASSET_CATEGORIES];
export const DEFAULT_TREASURE_TYPE: TreasureType = DEFAULT_CATEGORY_ORDER[0];

export const CATEGORY_LABELS: Record<TreasureType, string> = {
    WEB_TOOL: "Online Tools",
    WEBSITE: "Portals",
    DOC: "Documents",
    SOFTWARE: "Desktop Apps",
    VIDEO: "Videos",
};

export const ADMIN_CATEGORY_LABELS: Record<TreasureType, string> = {
    WEB_TOOL: "ONLINE TOOLS",
    WEBSITE: "PORTALS",
    DOC: "DOCUMENTS",
    SOFTWARE: "DESKTOP APPS",
    VIDEO: "VIDEOS",
};

export function isTreasureType(value: string): value is TreasureType {
    return ASSET_CATEGORIES.includes(value as TreasureType);
}

export function normalizeCategoryOrder(order: readonly string[]): TreasureType[] {
    const seen = new Set<TreasureType>();
    const normalized: TreasureType[] = [];

    for (const type of order) {
        if (isTreasureType(type) && !seen.has(type)) {
            seen.add(type);
            normalized.push(type);
        }
    }

    for (const type of DEFAULT_CATEGORY_ORDER) {
        if (!seen.has(type)) {
            normalized.push(type);
        }
    }

    return normalized;
}
