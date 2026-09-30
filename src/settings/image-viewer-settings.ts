import { SettingDefinitionRender, SettingGroup } from 'obsidian';
import type { NativePluginSettingTab } from './NativePluginSettingTab';
import type CPlugin from '@src/main';
import { createSettingDefinition, renderSettingDefinitions } from './setting-definitions';
import { lt } from '@src/i18n/ui';

export function getImageViewerSettingDefinitions(plugin: CPlugin): SettingDefinitionRender[] {
	return [
		createSettingDefinition(lt('启用图片查看器', 'Enable image viewer'), lt('在所有位置启用 Ctrl+Click 查看图片功能', 'Enable Ctrl+Click image viewing everywhere'), (setting) => {
			setting
			.addToggle((toggle) => {
				toggle
					.setValue(plugin.settings.imageViewer?.enabled !== false)
					.onChange(async (value) => {
						const viewerSettings = plugin.settings.imageViewer ?? {
							enabled: true,
							disableNativeImageViewer: false,
						};
						viewerSettings.enabled = value;
						plugin.settings.imageViewer = viewerSettings;
						await plugin.saveSettings();
					});
			});
		}),
		createSettingDefinition(lt('禁用内置点击查看图片', 'Disable built-in click viewer'), lt('阻止内置图片灯箱响应普通点击, 不影响右键菜单, 拖拽缩放或本插件的快捷查看', 'Block Obsidian lightbox on normal click without affecting context menu, drag resizing, or this plugin viewer'), (setting) => {
		setting
			.addToggle((toggle) => {
				toggle
					.setValue(plugin.settings.imageViewer?.disableNativeImageViewer === true)
					.onChange(async (value) => {
						const viewerSettings = plugin.settings.imageViewer ?? {
							enabled: true,
							disableNativeImageViewer: false,
						};
						viewerSettings.disableNativeImageViewer = value;
						plugin.settings.imageViewer = viewerSettings;
						await plugin.saveSettings();
					});
			});
		}),
	];
}

export function showImageViewerSettings(tab: NativePluginSettingTab): void {
	const group = new SettingGroup(tab.contentEl);
	renderSettingDefinitions(group, getImageViewerSettingDefinitions(tab.plugin));
}
