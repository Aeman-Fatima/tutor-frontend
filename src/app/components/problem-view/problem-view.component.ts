import { Component, OnInit, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { TutorService, AttemptResult, ConversationEntry } from '../../services/tutor.service';
import { AppToolbarComponent } from '../../shared/app-toolbar/app-toolbar.component';
import { OcrUploadComponent } from '../../shared/ocr-upload/ocr-upload.component';
import { MethodSelectorComponent } from '../../shared/method-selector/method-selector.component';
import { ConversationThreadComponent } from '../../shared/conversation-thread/conversation-thread.component';

@Component({
  selector: 'app-problem-view',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatProgressSpinnerModule, MatIconModule,
    AppToolbarComponent, OcrUploadComponent, MethodSelectorComponent, ConversationThreadComponent,
  ],
  template: `
    <app-toolbar [title]="'Problem ' + (problemIndex + 1)" [backRoute]="['/problems']">
      <span toolbar-extra class="text-sm opacity-80 mr-1" *ngIf="exchanges.length">
        {{ exchanges.length }} attempt{{ exchanges.length > 1 ? 's' : '' }}
      </span>
      <button toolbar-extra mat-icon-button (click)="goHistory()" class="!text-white" title="History">
        <mat-icon>history</mat-icon>
      </button>
    </app-toolbar>

    <div class="page-shell space-y-4">

      <app-conversation-thread
        [question]="question"
        problemLabel="Problem"
        [exchanges]="exchanges"
        [displayTexts]="attemptTexts">
      </app-conversation-thread>

      <!-- Input area -->
      <div #inputArea class="app-card px-5 sm:px-6 py-5 sticky-input">
        <p class="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-4">
          {{ exchanges.length === 0 ? 'Your attempt' : 'Your response' }}
        </p>

        <app-method-selector
          *ngIf="exchanges.length === 0 && methods.length > 1"
          [methods]="methods"
          [(selectedMethod)]="selectedMethod"
          [(customMethodText)]="customMethodText">
        </app-method-selector>

        <div class="mb-4">
          <app-ocr-upload #attemptOcr label="Upload handwritten solution" (extracted)="attempt = $event"></app-ocr-upload>
        </div>

        <p *ngIf="methodsLoading" class="text-xs text-slate-400 mb-2 flex items-center gap-1">
          <mat-spinner diameter="12" class="!inline-block align-middle"></mat-spinner>
          Detecting methods…
        </p>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>{{ exchanges.length === 0 ? 'Working and final answer' : 'Follow-up or revised attempt' }}</mat-label>
          <textarea matInput [(ngModel)]="attempt" rows="4"
            [disabled]="methodsLoading"
            placeholder="Show your steps, e.g. 16 − 3 − 4 = 9 eggs, 9 × 2 = 18 dollars"></textarea>
        </mat-form-field>

        <div class="flex items-center justify-between mt-1">
          <button mat-button class="btn-ghost !text-sm" (click)="back()">
            ← Back to problems
          </button>
          <button mat-raised-button
            class="btn-primary"
            [disabled]="!attempt.trim() || loading"
            (click)="submit()">
            <mat-spinner *ngIf="loading" diameter="16" class="!inline-block mr-2 align-middle"></mat-spinner>
            {{ loading ? 'Submitting…' : 'Submit' }}
          </button>
        </div>

        <p *ngIf="error" class="text-red-400 text-sm mt-2">{{ error }}</p>
      </div>

    </div>
  `,
})
export class ProblemViewComponent implements OnInit, AfterViewChecked {
  @ViewChild('inputArea') inputAreaRef!: ElementRef<HTMLDivElement>;
  @ViewChild('attemptOcr') attemptOcrRef!: OcrUploadComponent;

  problemIndex = 0;
  question = '';
  attempt = '';
  loading = false;
  error = '';
  studentId = localStorage.getItem('student_id') || '';

  exchanges: AttemptResult[] = [];
  attemptTexts: string[] = [];
  private shouldScroll = false;

  methods: string[] = [];
  selectedMethod = 'direct';
  customMethodText = '';
  methodsLoading = true;

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

    this.svc.getMethodsForProblem(this.problemIndex).subscribe({
      next: (r) => {
        this.methods = r.methods;
        this.selectedMethod = r.methods[0] ?? 'direct';
        this.methodsLoading = false;
      },
      error: () => {
        this.methodsLoading = false;
      },
    });
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.shouldScroll = false;
      this.inputAreaRef?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  submit() {
    const submittedText = this.attempt.trim();

    const method = this.exchanges.length === 0
      ? (this.selectedMethod === 'other'
          ? (this.customMethodText.trim() ? `other:${this.customMethodText.trim()}` : 'direct')
          : this.selectedMethod)
      : undefined;

    const conversation: ConversationEntry[] = this.exchanges.map((ex, i) => ({
      student_attempt: this.attemptTexts[i],
      strategy: ex.strategy,
      response: ex.response,
    }));

    this.loading = true;
    this.error = '';
    this.svc.submitAttempt(
      this.studentId, this.problemIndex, submittedText, conversation, method
    ).subscribe({
      next: (r) => {
        this.exchanges.push(r);
        this.attemptTexts.push(submittedText);
        this.attempt = '';
        this.attemptOcrRef?.reset();
        this.loading = false;
        this.shouldScroll = true;
      },
      error: (e) => { this.error = e.message; this.loading = false; },
    });
  }

  back() { this.router.navigate(['/problems']); }
  goHistory() { this.router.navigate(['/history', this.problemIndex]); }
}
