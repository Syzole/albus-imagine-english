import { debounce, SettingDefinitionRender, SettingGroup } from 'obsidian';
import type { NativePluginSettingTab } from './NativePluginSettingTab';
import { SortField, SortOrder } from '../types/image-manager.types';
import type CPlugin from '@src/main';
import { UiLanguage } from "@src/types/types";
import { createSettingDefinition, renderSettingDefinitions } from './setting-definitions';
import { lt, setUiLanguage } from '@src/i18n/ui';

export function getImageManagerSettingDefinitions(
	plugin: CPlugin,
	onUiLanguageChange?: () => void,
): SettingDefinitionRender[] {
	return [
		createSettingDefinition(lt('界面语言', 'UI language'), lt('切换插件界面显示语言', 'Switch the plugin UI language'), (setting) => {
			setting.addDropdown((dropdown) => {
				dropdown
					.addOption('en', 'English')
					.addOption('zh-CN', '中文')
					.setValue(plugin.settings.uiLanguage ?? 'en')
					.onChange(async (value) => {
						plugin.settings.uiLanguage = value as UiLanguage;
						setUiLanguage(plugin.settings.uiLanguage);
						await plugin.saveSettings();
						onUiLanguageChange?.();
					});
			});
		}),
		createSettingDefinition(lt('显示文件大小', 'Show file size'), lt('在图片卡片上显示文件大小信息', 'Display file size on image cards'), (setting) => {
			setting
			.addToggle((toggle) => {
				toggle
					.setValue(plugin.settings.imageManager?.showFileSize !== false)
					.onChange(async (value) => {
						if (!plugin.settings.imageManager) {
							plugin.settings.imageManager = {};
						}
						plugin.settings.imageManager.showFileSize = value;
						await plugin.saveSettings();
					});
			});
		}),
		createSettingDefinition(lt('显示修改时间', 'Show modified time'), lt('在图片卡片上显示最后修改时间', 'Display the last modified time on image cards'), (setting) => {
			setting
			.addToggle((toggle) => {
				toggle
					.setValue(plugin.settings.imageManager?.showModifiedTime !== false)
					.onChange(async (value) => {
						if (!plugin.settings.imageManager) {
							plugin.settings.imageManager = {};
						}
						plugin.settings.imageManager.showModifiedTime = value;
						await plugin.saveSettings();
					});
			});
		}),
		createSettingDefinition(lt('默认排序字段', 'Default sort field'), lt('打开图片管理器时的默认排序方式', 'Initial sort field when opening the image manager'), (setting) => {
			setting
			.addDropdown((dropdown) => {
				dropdown
					.addOption('mtime', lt('修改时间', 'Modified time'))
					.addOption('ctime', lt('创建时间', 'Created time'))
					.addOption('size', lt('文件大小', 'File size'))
					.addOption('name', lt('文件名', 'File name'))
					.addOption('references', lt('引用数量', 'Reference count'))
					.setValue(plugin.settings.imageManager?.defaultSortField || 'mtime')
					.onChange(async (value) => {
						if (!plugin.settings.imageManager) {
							plugin.settings.imageManager = {};
						}
						plugin.settings.imageManager.defaultSortField = value as SortField;
						await plugin.saveSettings();
					});
			});
		}),
		createSettingDefinition(lt('默认排序顺序', 'Default sort order'), lt('打开图片管理器时的默认排序顺序', 'Initial sort order when opening the image manager'), (setting) => {
			setting
			.addDropdown((dropdown) => {
				dropdown
					.addOption('desc', lt('降序', 'Descending'))
					.addOption('asc', lt('升序', 'Ascending'))
					.setValue(plugin.settings.imageManager?.defaultSortOrder || 'desc')
					.onChange(async (value) => {
						if (!plugin.settings.imageManager) {
							plugin.settings.imageManager = {};
						}
						plugin.settings.imageManager.defaultSortOrder = value as SortOrder;
						await plugin.saveSettings();
					});
			});
		}),
		createSettingDefinition(lt('排除文件夹', 'Excluded folders'), lt('在图片管理器中排除这些文件夹', 'Exclude these folders from the image manager'), (setting) => {
			setting
			.addTextArea((text) => {
				const excludedFolders = plugin.settings.imageManager?.excludedFolders || [];
				text
					.setPlaceholder(lt('输入要排除的文件夹路径, 每行一个', 'Enter one folder path per line to exclude'))
					.setValue(excludedFolders.join('\n'))
					.onChange(debounce(async (value) => {
						if (!plugin.settings.imageManager) {
							plugin.settings.imageManager = {};
						}
						const folders = value.split('\n')
							.map(line => line.trim())
							.filter(line => line.length > 0);
						plugin.settings.imageManager.excludedFolders = folders;
						await plugin.saveSettings();
					}, 500));
				text.inputEl.rows = 6;
				text.inputEl.addClass('afm-textarea-full-width');
			});
		}),
		createSettingDefinition(lt('删除确认', 'Delete confirmation'), lt('删除文件前显示确认对话框', 'Show a confirmation dialog before deleting files'), (setting) => {
			setting
			.addToggle((toggle) => {
				toggle
					.setValue(plugin.settings.imageManager?.confirmDelete !== false)
					.onChange(async (value) => {
						if (!plugin.settings.imageManager) {
							plugin.settings.imageManager = {};
						}
						plugin.settings.imageManager.confirmDelete = value;
						await plugin.saveSettings();
					});
			});
		}),
		createSettingDefinition(lt('深色模式下 SVG 图片反色', 'Invert SVG images in dark mode'), lt('在深色主题下对 SVG 图片进行反色处理, 使其更适配深色背景', 'Invert SVG images in dark theme for better contrast'), (setting) => {
			setting
			.addToggle((toggle) => {
				toggle
					.setValue(plugin.settings.imageManager?.invertSvgInDarkMode !== false)
					.onChange(async (value) => {
						if (!plugin.settings.imageManager) {
							plugin.settings.imageManager = {};
						}
						plugin.settings.imageManager.invertSvgInDarkMode = value;
						await plugin.saveSettings();
					});
			});
		}),
	];
}

export function showImageManagerSettings(tab: NativePluginSettingTab): void {
	const group = new SettingGroup(tab.contentEl);
	renderSettingDefinitions(group, getImageManagerSettingDefinitions(tab.plugin, () => tab.refresh()));
}
