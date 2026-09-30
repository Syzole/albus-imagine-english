import { debounce, Notice, SettingDefinitionRender, SettingGroup } from 'obsidian';
import type { NativePluginSettingTab } from './NativePluginSettingTab';
import type CPlugin from '@src/main';
import { createSettingDefinition, renderSettingDefinitions } from './setting-definitions';
import { lt } from '@src/i18n/ui';

export function getImageResizeSettingDefinitions(plugin: CPlugin): SettingDefinitionRender[] {
	return [
		createSettingDefinition(lt('启用 callout 外图片拖拽调整大小', 'Resize images outside callouts'), lt('是否允许通过拖拽 callout 外图片边缘来调整图片大小', 'Allow drag-resizing by the image edge outside callouts'), (setting) => {
			setting
			.addToggle((toggle) => {
				toggle
					.setValue(plugin.settings.imageResize?.dragResizeGeneral !== false)
					.onChange(async (value) => {
						if (!plugin.settings.imageResize) {
							plugin.settings.imageResize = {
								resizeInterval: 0,
								edgeSize: 20,
								dragResizeGeneral: true,
								dragResizeCallout: true
							};
						}
						plugin.settings.imageResize.dragResizeGeneral = value;
						await plugin.saveSettings();
					});
			});
		}),
		createSettingDefinition(lt('启用 callout 内图片拖拽调整大小', 'Resize images inside callouts'), lt('是否允许通过拖拽 callout 内图片边缘来调整图片大小', 'Allow drag-resizing by the image edge inside callouts'), (setting) => {
			setting
			.addToggle((toggle) => {
				toggle
					.setValue(plugin.settings.imageResize?.dragResizeCallout !== false)
					.onChange(async (value) => {
						if (!plugin.settings.imageResize) {
							plugin.settings.imageResize = {
								resizeInterval: 0,
								edgeSize: 20,
								dragResizeGeneral: true,
								dragResizeCallout: true
							};
						}
						plugin.settings.imageResize.dragResizeCallout = value;
						await plugin.saveSettings();
					});
			});
		}),
		createSettingDefinition(lt('调整大小的时间间隔', 'Resize step'), lt('拖动调整最小刻度, 0 表示不对齐刻度', 'Minimum pixel interval when dragging; 0 disables snapping'), (setting) => {
		const currentValue = plugin.settings.imageResize?.resizeInterval || 0;
		setting
			.addText((text) => {
				text
					.setPlaceholder('0')
					.setValue(currentValue.toString())
					.onChange(debounce(async (value) => {
						const numValue = parseInt(value);
						if (!isNaN(numValue) && numValue >= 0) {
							if (!plugin.settings.imageResize) {
								plugin.settings.imageResize = {
									resizeInterval: 0,
									edgeSize: 20,
									dragResizeGeneral: true,
									dragResizeCallout: true
								};
							}
							plugin.settings.imageResize.resizeInterval = numValue;
							await plugin.saveSettings();
						} else {
							new Notice(lt('请输入非负整数', 'Please enter a non-negative integer'));
						}
					}, 500));
				text.inputEl.type = 'number';
				text.inputEl.min = '0';
				text.inputEl.step = '1';
			});
		}),
		createSettingDefinition(lt('边缘检测区域大小', 'Edge detection area'), lt('鼠标在图片边缘多少像素内可以触发调整大小', 'How many pixels from the edge can trigger resizing'), (setting) => {
		const currentValue = plugin.settings.imageResize?.edgeSize || 20;
		setting
			.addSlider((slider) => {
				slider
					.setLimits(5, 150, 1)
					.setValue(currentValue)
					.onChange(debounce(async (value) => {
						if (!plugin.settings.imageResize) {
							plugin.settings.imageResize = {
								resizeInterval: 0,
								edgeSize: 20,
								dragResizeGeneral: true,
								dragResizeCallout: true
							};
						}
						plugin.settings.imageResize.edgeSize = value;
						await plugin.saveSettings();
					}, 100));
			});
		}),
	];
}

export function showImageResizeSettings(tab: NativePluginSettingTab): void {
	const group = new SettingGroup(tab.contentEl);
	renderSettingDefinitions(group, getImageResizeSettingDefinitions(tab.plugin));
}
