import { App, ButtonComponent, Modal, ProgressBarComponent, Setting } from "obsidian";
import { ImageItem } from "../types/image-manager.types";
import { setDestructiveButton } from "../utils/obsidianCompatibility";
import { lt } from "@src/i18n/ui";

export class BatchDeleteConfirmModal extends Modal {
	private progressBar: ProgressBarComponent | null = null;
	private progressSettingEl: HTMLElement | null = null;
	private progressTextEl: HTMLElement | null = null;
	private confirmButton: ButtonComponent | null = null;
	private cancelButton: ButtonComponent | null = null;
	private isSubmitting = false;

	constructor(
		app: App,
		private readonly images: ImageItem[],
		private readonly onConfirm: (
			onProgress: (current: number, total: number) => void
		) => Promise<void>
	) {
		super(app);
	}

	onOpen(): void {
		this.setTitle(lt("批量删除图片", "Batch delete images"));
		this.render();
	}

	private render(): void {
		this.contentEl.empty();
		const customCount = this.images.filter((image) => image.isCustomType).length;
		const totalFiles = this.images.length + customCount;

		const message = this.contentEl.createEl("p");
		message.createSpan({ text: lt("确认要删除 ", "Are you sure you want to delete ") });
		message.createEl("strong", { text: lt("{count} 张图片", "{count} images", { count: this.images.length }) });
		message.createSpan({ text: lt(" 吗?", "?") });
		this.contentEl.createDiv({
			cls: "setting-item-description",
			text: customCount > 0
				? lt("其中 {customCount} 张特殊图片包含封面, 共删除 {totalFiles} 个文件.", "{customCount} custom images include covers, deleting {totalFiles} files in total.", { customCount, totalFiles })
				: lt("共删除 {totalFiles} 个文件.", "Deleting {totalFiles} files in total.", { totalFiles }),
		});

		const progressSetting = new Setting(this.contentEl).setName(lt("删除进度", "Deletion progress"));
		this.progressSettingEl = progressSetting.settingEl;
		progressSetting.settingEl.hide();
		progressSetting.addProgressBar((progress) => {
			this.progressBar = progress.setValue(0);
		});
		this.progressTextEl = progressSetting.descEl;

		new Setting(this.contentEl)
			.addButton((button) => {
				this.cancelButton = button.setButtonText(lt("取消", "Cancel")).onClick(() => this.close());
			})
			.addButton((button) => {
				this.confirmButton = setDestructiveButton(button.setButtonText(lt("删除全部", "Delete all")))
					.onClick(() => void this.handleConfirm());
			});

		this.contentEl.ownerDocument.defaultView?.requestAnimationFrame(() => {
			this.cancelButton?.buttonEl.focus();
		});
	}

	private async handleConfirm(): Promise<void> {
		if (this.isSubmitting) return;
		this.isSubmitting = true;
		this.confirmButton?.setDisabled(true).setButtonText(lt("正在删除...", "Deleting..."));
		this.cancelButton?.setDisabled(true);
		this.progressSettingEl?.show();
		try {
			await this.onConfirm((current, total) => this.updateProgress(current, total));
			this.close();
		} catch {
			this.isSubmitting = false;
			this.confirmButton?.setDisabled(false).setButtonText(lt("删除全部", "Delete all"));
			this.cancelButton?.setDisabled(false);
		}
	}

	private updateProgress(current: number, total: number): void {
		const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
		this.progressBar?.setValue(percentage);
		this.progressTextEl?.setText(`${current}/${total}(${percentage}%)`);
	}

	onClose(): void {
		this.contentEl.empty();
		this.progressBar = null;
		this.progressSettingEl = null;
		this.progressTextEl = null;
		this.confirmButton = null;
		this.cancelButton = null;
		this.isSubmitting = false;
	}
}
