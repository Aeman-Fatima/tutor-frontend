import { Component, OnInit, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { TutorService, AttemptResult, ConversationEntry } from '../../services/tutor.service';

// ASSUMPTION: typed text takes priority over OCR — the pipeline always receives
// the final textarea content, which the student can edit after OCR auto-fill.
// ASSUMPTION: accepted image formats jpg/jpeg/png, max ~5 MB (enforced on backend).

@Component({
  selector: 'app-problem-view',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatProgressSpinnerModule, MatToolbarModule, MatIconModule,
  ],
  template: `
    <mat-toolbar class="!bg-teal-600 !text-white shadow-md">
      <button mat-icon-button (click)="back()"><mat-icon>arrow_back</mat-icon></button>
      <span class="font-semibold">Problem {{ problemIndex + 1 }}</span>
      <span class="flex-1"></span>
      <span class="text-sm opacity-70 mr-2" *ngIf="exchanges.length">
        {{ exchanges.length }} attempt{{ exchanges.length > 1 ? 's' : '' }}
      </span>
      <button mat-button class="!text-white !text-sm" (click)="goHistory()">
        <mat-icon class="!text-sm mr-1">history</mat-icon> History
      </button>
    </mat-toolbar>

    <!-- Scrollable thread container -->
    <div #threadContainer class="max-w-3xl mx-auto px-4 py-6 space-y-4">

      <!-- Problem text — pinned at top -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-5">
        <p class="text-xs uppercase tracking-widest text-teal-600 font-semibold mb-2">Problem</p>
        <p class="text-slate-800 text-base leading-relaxed">{{ question }}</p>
      </div>

      <!-- Past exchanges thread -->
      <ng-container *ngFor="let ex of exchanges; let i = index">

        <!-- Student attempt bubble -->
        <div class="flex justify-end">
          <div class="max-w-lg bg-teal-50 border border-teal-100 rounded-2xl rounded-tr-sm px-5 py-3">
            <p class="text-xs text-teal-500 font-semibold mb-1 uppercase tracking-wide">
              Attempt {{ i + 1 }}
            </p>
            <p class="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
              {{ ex.question === question ? attemptTexts[i] : '—' }}
            </p>
          </div>
        </div>

        <!-- Classification pill row -->
        <div class="flex items-center gap-2 px-1">
          <span *ngIf="ex.classification.is_followup"
            class="text-xs bg-purple-50 text-purple-600 border border-purple-200 px-2 py-0.5 rounded-full">
            follow-up reply
          </span>
          <ng-container *ngIf="!ex.classification.is_followup">
            <span [class]="'state-' + ex.classification.state" class="text-xs">
              {{ stateLabel(ex.classification.state) }}
            </span>
            <span class="text-slate-300 text-xs">·</span>
          </ng-container>
          <code class="bg-slate-100 text-teal-700 text-xs px-2 py-0.5 rounded-md font-mono">
            {{ ex.strategy }}
          </code>
          <span *ngIf="ex.classification.weak_step" class="text-slate-400 text-xs truncate max-w-xs">
            · {{ ex.classification.weak_step }}
          </span>
          <span *ngIf="ex.srs_skipped" class="text-xs text-slate-300">(SRS not updated)</span>
        </div>

        <!-- Tutor response bubble -->
        <div class="flex justify-start">
          <div class="max-w-lg">
            <p class="text-xs text-slate-400 font-semibold mb-1 uppercase tracking-wide px-1">Tutor</p>
            <div class="tutor-response rounded-2xl rounded-tl-sm">{{ ex.response }}</div>
          </div>
        </div>

        <!-- SRS micro-update -->
        <div class="text-xs text-slate-400 px-1">
          SRS: next review in
          <strong class="text-teal-600">{{ ex.srs_card.interval }}d</strong>
          · ease {{ ex.srs_card.ease_factor | number:'1.2-2' }}
          · reps {{ ex.srs_card.repetitions }}
        </div>

        <!-- Divider between exchanges (not after last) -->
        <hr *ngIf="i < exchanges.length - 1" class="border-slate-100" />

      </ng-container>

      <!-- Input area — always visible -->
      <div #inputArea
        class="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-5 sticky-input">
        <p class="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-4">
          {{ exchanges.length === 0 ? 'Your attempt' : 'Your response' }}
        </p>

        <!-- Image upload -->
        <div class="mb-4">
          <input #fileInput type="file" accept="image/jpeg,image/jpg,image/png"
            class="hidden" (change)="onFileSelected($event)" />

          <div class="flex items-center gap-3">
            <button mat-stroked-button type="button"
              class="!border-slate-300 !text-slate-600 !rounded-lg !text-sm"
              (click)="fileInput.click()">
              <mat-icon class="!text-base mr-1">photo_camera</mat-icon>
              Upload handwritten solution
            </button>
            <span *ngIf="selectedFile" class="text-xs text-slate-400">{{ selectedFile.name }}</span>
          </div>

          <div *ngIf="imagePreviewUrl" class="mt-3 flex items-start gap-4">
            <img [src]="imagePreviewUrl" alt="Selected image"
              class="h-24 w-auto rounded-xl border border-slate-200 shadow-sm object-cover" />
            <div class="flex flex-col gap-2 mt-1">
              <button mat-raised-button type="button"
                class="!bg-teal-600 !text-white !rounded-lg !text-sm"
                [disabled]="ocrLoading"
                (click)="extractText()">
                <mat-spinner *ngIf="ocrLoading" diameter="14"
                  class="!inline-block mr-1 align-middle"></mat-spinner>
                {{ ocrLoading ? 'Extracting…' : 'Extract text' }}
              </button>
              <button mat-button type="button"
                class="!text-slate-400 !text-xs !rounded-lg"
                (click)="clearImage()">
                Remove
              </button>
            </div>
          </div>

          <p *ngIf="ocrError" class="text-red-600 text-xs mt-2">{{ ocrError }}</p>
          <p *ngIf="ocrFilled" class="text-teal-600 text-xs mt-2">
            ✓ Text extracted — review and edit below before submitting.
          </p>
        </div>

        <!-- Textarea -->
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>{{ exchanges.length === 0 ? 'Working and final answer' : 'Follow-up or revised attempt' }}</mat-label>
          <textarea matInput [(ngModel)]="attempt" rows="4"
            placeholder="Show your steps, e.g. 16 − 3 − 4 = 9 eggs, 9 × 2 = 18 dollars"></textarea>
        </mat-form-field>

        <div class="flex items-center justify-between mt-1">
          <button mat-button class="!text-slate-400 !text-sm !rounded-lg" (click)="back()">
            ← Back to problems
          </button>
          <button mat-raised-button
            class="!bg-teal-600 !text-white !rounded-lg"
            [disabled]="!attempt.trim() || loading"
            (click)="submit()">
            <mat-spinner *ngIf="loading" diameter="16"
              class="!inline-block mr-2 align-middle"></mat-spinner>
            {{ loading ? 'Submitting…' : 'Submit' }}
          </button>
        </div>

        <p *ngIf="error" class="text-red-600 text-sm mt-2">{{ error }}</p>
      </div>

    </div>
  `,
  styles: [`
    /* Push the input card into view after new exchanges land */
    .sticky-input { scroll-margin-top: 80px; }
  `],
})
export class ProblemViewComponent implements OnInit, AfterViewChecked {
  @ViewChild('fileInput')     fileInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('inputArea')     inputAreaRef!: ElementRef<HTMLDivElement>;
  @ViewChild('threadContainer') threadContainerRef!: ElementRef<HTMLDivElement>;

  problemIndex = 0;
  question     = '';
  attempt      = '';
  loading      = false;
  error        = '';
  studentId    = localStorage.getItem('student_id') || '';

  exchanges:    AttemptResult[] = [];
  attemptTexts: string[]        = [];  // parallel array — the raw text submitted for each exchange
  private shouldScroll = false;

  selectedFile:    File | null   = null;
  imagePreviewUrl: string | null = null;
  ocrLoading = false;
  ocrError   = '';
  ocrFilled  = false;

  constructor(private route: ActivatedRoute, private router: Router, private svc: TutorService) {}

  ngOnInit() {
    if (!this.studentId) { this.router.navigate(['/']); return; }
    this.problemIndex = Number(this.route.snapshot.paramMap.get('index') ?? 0);
    this.svc.getProblems().subscribe({
      next: (ps) => {
        const p = ps.find(x => x.index === this.problemIndex);
        this.question = p?.question ?? 'Problem not found.';
      },
    });
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.shouldScroll = false;
      this.inputAreaRef?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;
    this.selectedFile = file;
    this.ocrError  = '';
    this.ocrFilled = false;
    const reader = new FileReader();
    reader.onload = (e) => { this.imagePreviewUrl = e.target?.result as string; };
    reader.readAsDataURL(file);
  }

  extractText() {
    if (!this.selectedFile) return;
    this.ocrLoading = true;
    this.ocrError   = '';
    this.ocrFilled  = false;
    this.svc.uploadImageForOcr(this.selectedFile).subscribe({
      next: (res) => {
        this.attempt   = res.text;
        this.ocrFilled = true;
        this.ocrLoading = false;
      },
      error: (e) => {
        this.ocrError   = 'OCR failed: ' + (e.error?.error ?? e.message);
        this.ocrLoading = false;
      },
    });
  }

  clearImage() {
    this.selectedFile    = null;
    this.imagePreviewUrl = null;
    this.ocrFilled       = false;
    this.ocrError        = '';
    if (this.fileInputRef?.nativeElement) {
      this.fileInputRef.nativeElement.value = '';
    }
  }

  submit() {
    const submittedText = this.attempt.trim();

    // Build conversation array from prior exchanges so the backend can detect follow-ups
    const conversation: ConversationEntry[] = this.exchanges.map((ex, i) => ({
      student_attempt: this.attemptTexts[i],
      strategy:        ex.strategy,
      response:        ex.response,
    }));

    this.loading = true;
    this.error   = '';
    this.svc.submitAttempt(this.studentId, this.problemIndex, submittedText, conversation).subscribe({
      next: (r) => {
        this.exchanges.push(r);
        this.attemptTexts.push(submittedText);
        this.attempt = '';
        this.clearImage();
        this.loading      = false;
        this.shouldScroll = true;
      },
      error: (e) => { this.error = e.message; this.loading = false; },
    });
  }

  back() { this.router.navigate(['/problems']); }
  goHistory() { this.router.navigate(['/history', this.problemIndex]); }

  stateLabel(s: string) {
    return ({ correct: 'Correct ✓', partially_flawed: 'Partially Flawed', incorrect: 'Incorrect' } as Record<string, string>)[s] ?? s;
  }
}
