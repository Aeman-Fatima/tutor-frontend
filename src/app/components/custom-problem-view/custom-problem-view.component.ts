/**
 * Custom Problem View
 *
 * Lets the student type any math word problem, then coaches them through it
 * using the same tutoring pipeline as GSM8K problems.
 *
 * The component has two phases:
 *   Phase 1 (question === ''): text area to enter the problem + "Start Solving" button
 *   Phase 2 (question !== ''): same conversation thread as ProblemViewComponent
 */

import { Component, OnInit, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TutorService, AttemptResult, ConversationEntry } from '../../services/tutor.service';
import { AppToolbarComponent } from '../../shared/app-toolbar/app-toolbar.component';
import { OcrUploadComponent } from '../../shared/ocr-upload/ocr-upload.component';
import { MethodSelectorComponent } from '../../shared/method-selector/method-selector.component';
import { ConversationThreadComponent } from '../../shared/conversation-thread/conversation-thread.component';

@Component({
  selector: 'app-custom-problem-view',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatProgressSpinnerModule,
    AppToolbarComponent, OcrUploadComponent, MethodSelectorComponent, ConversationThreadComponent,
  ],
  template: `
    <app-toolbar title="Custom Problem" [backRoute]="['/problems']">
      <span toolbar-extra class="text-sm opacity-80" *ngIf="exchanges.length">
        {{ exchanges.length }} attempt{{ exchanges.length > 1 ? 's' : '' }}
      </span>
    </app-toolbar>

    <div class="page-shell space-y-4">

      <!-- ── Phase 1: enter problem ─────────────────────────────────────── -->
      <ng-container *ngIf="!question">
        <div class="app-card px-5 sm:px-6 py-6">
          <h2 class="text-base font-semibold text-slate-100 mb-1">Enter your problem</h2>
          <p class="text-sm text-slate-400 mb-4">
            Type any math word problem — the tutor generates a reference solution and coaches you through it.
          </p>

          <div class="mb-4">
            <app-ocr-upload #questionOcr label="Upload question image" (extracted)="questionInput = $event"></app-ocr-upload>
          </div>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Problem text</mat-label>
            <textarea matInput [(ngModel)]="questionInput" rows="5"
              placeholder="e.g. A train travels at 60 km/h for 2.5 hours. How far does it travel?">
            </textarea>
          </mat-form-field>
          <div class="flex justify-end mt-2">
            <button mat-raised-button
              class="btn-primary"
              [disabled]="!questionInput.trim()"
              (click)="startProblem()">
              Start Solving
            </button>
          </div>
        </div>
      </ng-container>

      <!-- ── Phase 2: conversation thread ─────────────────────────────── -->
      <ng-container *ngIf="question">

        <app-conversation-thread
          [question]="question"
          problemLabel="Your Problem"
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
              placeholder="Show your steps and final answer"></textarea>
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

      </ng-container>
    </div>
  `,
})
export class CustomProblemViewComponent implements OnInit, AfterViewChecked {
  @ViewChild('inputArea') inputAreaRef!: ElementRef<HTMLDivElement>;
  @ViewChild('attemptOcr') attemptOcrRef!: OcrUploadComponent;
  @ViewChild('questionOcr') questionOcrRef!: OcrUploadComponent;

  questionInput = '';
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
  methodsLoading = false;

  constructor(private router: Router, private svc: TutorService) {}

  ngOnInit() {
    if (!this.studentId) { this.router.navigate(['/']); }
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.shouldScroll = false;
      this.inputAreaRef?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  startProblem() {
    const q = this.questionInput.trim();
    if (!q) return;
    this.question = q;
    this.methodsLoading = true;
    this.svc.getMethodsForQuestion(q).subscribe({
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
    this.svc.submitCustomAttempt(
      this.studentId, this.question, submittedText, conversation, method
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
}
