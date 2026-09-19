import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TutorService } from '../../services/tutor.service';

/**
 * Self-contained photo upload + OCR extraction widget.
 * Emits the extracted text via (extracted); the parent decides what to do with it
 * (fill the attempt box, fill the question box, etc.) and can call `reset()` after use.
 */
@Component({
  selector: 'app-ocr-upload',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div>
      <input #fileInput type="file" accept="image/jpeg,image/jpg,image/png" class="hidden" (change)="onFileSelected($event)" />

      <div class="flex items-center gap-3 flex-wrap">
        <button mat-stroked-button type="button" class="btn-outline !text-sm" (click)="fileInput.click()">
          <mat-icon class="!text-base mr-1">photo_camera</mat-icon>
          {{ label }}
        </button>
        <span *ngIf="selectedFile" class="text-xs text-slate-400 truncate max-w-[10rem]">{{ selectedFile.name }}</span>
      </div>

      <div *ngIf="previewUrl" class="mt-3 flex items-start gap-4 msg-in">
        <img [src]="previewUrl" alt="Selected image" class="h-24 w-auto rounded-xl border border-slate-700 shadow-sm object-cover" />
        <div class="flex flex-col gap-2 mt-1">
          <button mat-raised-button type="button" class="btn-primary !text-sm" [disabled]="ocrLoading" (click)="extractText()">
            <mat-spinner *ngIf="ocrLoading" diameter="14" class="!inline-block mr-1 align-middle"></mat-spinner>
            {{ ocrLoading ? 'Extracting…' : 'Extract text' }}
          </button>
          <button mat-button type="button" class="btn-ghost !text-xs" (click)="clear()">Remove</button>
        </div>
      </div>

      <p *ngIf="ocrError" class="text-red-400 text-xs mt-2">{{ ocrError }}</p>
      <p *ngIf="ocrFilled" class="text-violet-400 text-xs mt-2 flex items-center gap-1">
        <mat-icon class="!text-sm !w-4 !h-4">check_circle</mat-icon> Text extracted — review and edit below.
      </p>
    </div>
  `,
})
export class OcrUploadComponent {
  @Input() label = 'Upload photo';
  @Output() extracted = new EventEmitter<string>();

  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  ocrLoading = false;
  ocrError = '';
  ocrFilled = false;

  constructor(private svc: TutorService) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.selectedFile = file;
    this.ocrError = '';
    this.ocrFilled = false;
    const reader = new FileReader();
    reader.onload = (e) => { this.previewUrl = e.target?.result as string; };
    reader.readAsDataURL(file);
  }

  extractText() {
    if (!this.selectedFile) return;
    this.ocrLoading = true;
    this.ocrError = '';
    this.ocrFilled = false;
    this.svc.uploadImageForOcr(this.selectedFile).subscribe({
      next: (res) => {
        this.ocrFilled = true;
        this.ocrLoading = false;
        this.extracted.emit(res.text);
      },
      error: (e) => {
        this.ocrError = 'OCR failed: ' + (e.error?.error ?? e.message);
        this.ocrLoading = false;
      },
    });
  }

  clear() {
    this.selectedFile = null;
    this.previewUrl = null;
    this.ocrFilled = false;
    this.ocrError = '';
    if (this.fileInputRef?.nativeElement) {
      this.fileInputRef.nativeElement.value = '';
    }
  }

  reset() {
    this.clear();
  }
}
