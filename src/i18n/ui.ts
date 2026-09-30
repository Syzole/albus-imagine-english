import { UiLanguage } from "@src/types/types";

let currentLanguage: UiLanguage = "en";

export function setUiLanguage(language: UiLanguage): void {
	currentLanguage = language;
}

export function getUiLanguage(): UiLanguage {
	return currentLanguage;
}

export function lt(
	zhCN: string,
	en: string,
	params?: Record<string, string | number>,
): string {
	const template = currentLanguage === "zh-CN" ? zhCN : en;
	if (!params) return template;
	return template.replace(/\{(\w+)\}/g, (_match, key: string) => {
		const value = params[key];
		return value === undefined ? `{${key}}` : String(value);
	});
}
