import { debounce, SettingDefinitionRender, SettingGroup } from 'obsidian';
import type { NativePluginSettingTab } from './NativePluginSettingTab';
import type CPlugin from '@src/main';
import { createSettingDefinition, renderSettingDefinitions } from './setting-definitions';
import { lt } from '@src/i18n/ui';

export function getCustomFileTypesSettingDefinitions(
	plugin: CPlugin,
	refresh: () => void,
): SettingDefinitionRender[] {
	const customTypes = plugin.settings.imageManager?.customFileTypes || [];
	const definitions: SettingDefinitionRender[] = [];

	if (customTypes.length === 0) {
		definitions.push(createSettingDefinition(
			lt('暂无自定义文件类型', 'No custom file types yet'),
			lt('添加后可为非图片文件指定预览封面.', 'Add one to configure preview covers for non-image files.'),
			() => undefined,
		));
	} else {
		customTypes.forEach((type, index) => {
			definitions.push(createSettingDefinition(lt('类型', 'Type'), '', (setting) => {
				setting
					.addText((text) => {
						text
							.setPlaceholder(lt('文件扩展名 (如 PDF)', 'Source extension (for example, PDF)'))
							.setValue(type.fileExtension)
							.onChange(debounce(async (value) => {
								type.fileExtension = value;
								if (!plugin.settings.imageManager) {
									plugin.settings.imageManager = {};
								}
								plugin.settings.imageManager.customFileTypes = customTypes;
								await plugin.saveSettings();
							}, 500));
					})
					.addText((text) => {
						text
							.setPlaceholder(lt('封面扩展名 (如 JPG)', 'Cover extension (for example, JPG)'))
							.setValue(type.coverExtension)
							.onChange(debounce(async (value) => {
								type.coverExtension = value;
								if (!plugin.settings.imageManager) {
									plugin.settings.imageManager = {};
								}
								plugin.settings.imageManager.customFileTypes = customTypes;
								await plugin.saveSettings();
							}, 500));
					})
					.addText((text) => {
						text
							.setPlaceholder(lt('封面文件夹 (可选)', 'Cover folder (optional)'))
							.setValue(type.coverFolder || '')
							.onChange(debounce(async (value) => {
								type.coverFolder = value;
								if (!plugin.settings.imageManager) {
									plugin.settings.imageManager = {};
								}
								plugin.settings.imageManager.customFileTypes = customTypes;
								await plugin.saveSettings();
							}, 500));
					})
					.addExtraButton((btn) => {
						btn
							.setIcon('trash-2')
							.setTooltip(lt('删除此类型', 'Delete this type'))
							.onClick(async () => {
								customTypes.splice(index, 1);
								if (!plugin.settings.imageManager) {
									plugin.settings.imageManager = {};
								}
								plugin.settings.imageManager.customFileTypes = customTypes;
								await plugin.saveSettings();
								refresh();
							});
					});
			}));
		});
	}

	definitions.push(createSettingDefinition(
		lt('添加文件类型', 'Add file type'),
		lt('设置源文件扩展名, 封面扩展名和可选封面文件夹.', 'Set source extension, cover extension, and optional cover folder.'),
		(setting) => {
		setting
			.addButton((button) => {
				button
					.setButtonText(lt('添加', 'Add'))
					.setCta()
					.onClick(() => {
						customTypes.push({
							fileExtension: '',
							coverExtension: '',
							coverFolder: ''
						});
						refresh();
					});
			});
		},
	));

	return definitions;
}

export function showCustomFileTypesSettings(tab: NativePluginSettingTab): void {
	const group = new SettingGroup(tab.contentEl);
	renderSettingDefinitions(
		group,
		getCustomFileTypesSettingDefinitions(tab.plugin, () => tab.refresh()),
	);
}
