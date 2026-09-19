import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { TutorService, TopicProgress } from '../../services/tutor.service';
import { AppToolbarComponent } from '../../shared/app-toolbar/app-toolbar.component';

const TOPIC_LABELS: Record<string, string> = {
  rate: 'Rate & Speed',
  percentage: 'Percentages',
  ratio: 'Ratios',
  geometry: 'Geometry',
  multi_step_arithmetic: 'Multi-Step Arithmetic',
};

const STATE_ICON: Record<string, string> = {
  correct: '✓',
  partially_flawed: '~',
  incorrect: '✗',
};

const STATE_COLOUR: Record<string, string> = {
  correct: 'badge-success',
  partially_flawed: 'badge-warning',
  incorrect: 'badge-danger',
};

@Component({
  selector: 'app-problem-list',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatIconModule, AppToolbarComponent],
  template: `
    <app-toolbar title="Pick a Problem" [showBack]="false"></app-toolbar>

    <div class="page-shell">

      <!-- Loading -->
      <div *ngIf="loading" class="flex flex-col items-center py-16">
        <mat-spinner diameter="40"></mat-spinner>
        <p class="text-slate-400 mt-4 text-sm">Loading problems…</p>
      </div>

      <!-- Error -->
      <div *ngIf="error" class="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
        {{ error }}
      </div>

      <ng-container *ngIf="!loading && !error">

        <!-- Overview stats -->
        <div class="grid grid-cols-3 gap-3 mb-6" *ngIf="totalProblems > 0">
          <div class="app-card px-4 py-3 text-center">
            <p class="text-2xl font-bold text-slate-100">{{ totalAttempted }}<span class="text-slate-600">/{{ totalProblems }}</span></p>
            <p class="text-xs text-slate-400 mt-0.5">Attempted</p>
          </div>
          <div class="app-card px-4 py-3 text-center">
            <p class="text-2xl font-bold text-violet-400">{{ (overallAccuracy * 100) | number:'1.0-0' }}%</p>
            <p class="text-xs text-slate-400 mt-0.5">Accuracy</p>
          </div>
          <div class="app-card px-4 py-3 text-center">
            <p class="text-2xl font-bold text-slate-100">{{ topicGroups.length }}</p>
            <p class="text-xs text-slate-400 mt-0.5">Topics</p>
          </div>
        </div>

        <!-- Custom problem entry point -->
        <div
          class="app-card app-card-hover border-dashed !border-violet-500/40 px-4 py-3 mb-8 flex items-center justify-between"
          (click)="goCustom()">
          <div class="flex items-center gap-3">
            <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-violet-500/10 text-violet-400 shrink-0">
              <mat-icon class="!text-lg">add_circle_outline</mat-icon>
            </span>
            <div>
              <p class="text-sm font-semibold text-slate-200">Custom Problem</p>
              <p class="text-xs text-slate-400">Enter any math word problem and get coached through it</p>
            </div>
          </div>
          <mat-icon class="text-slate-600">chevron_right</mat-icon>
        </div>

        <!-- Topics grouped -->
        <div class="space-y-8">
          <div *ngFor="let tg of topicGroups">

            <!-- Topic heading + aggregate grade -->
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-base font-bold text-slate-200">{{ topicLabel(tg.topic) }}</h3>
              <div class="flex items-center gap-2">
                <div class="text-xs text-slate-500">{{ attemptedCount(tg) }}/{{ tg.problems.length }} attempted</div>
                <div *ngIf="attemptedCount(tg) > 0" class="badge" [ngClass]="scoreChipClass(tg.score)">
                  {{ (tg.score * 100) | number:'1.0-0' }}%
                </div>
              </div>
            </div>

            <!-- Progress bar -->
            <div class="progress-track mb-3" *ngIf="attemptedCount(tg) > 0">
              <div class="progress-fill" [ngClass]="scoreFillClass(tg.score)" [style.width.%]="tg.score * 100"></div>
            </div>

            <!-- Problem cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div *ngFor="let p of tg.problems"
                class="app-card app-card-hover px-4 py-3"
                (click)="selectProblem(p.index)">
                <div class="flex items-start gap-3">
                  <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-violet-500/10
                               text-violet-400 text-xs font-bold shrink-0 mt-0.5">
                    {{ p.index + 1 }}
                  </span>
                  <p class="text-slate-300 text-sm leading-relaxed flex-1 line-clamp-2">{{ p.question }}</p>
                  <span *ngIf="p.latest_state" class="badge shrink-0 mt-0.5" [ngClass]="STATE_COLOUR[p.latest_state]">
                    {{ STATE_ICON[p.latest_state] }} {{ stateLabel(p.latest_state) }}
                  </span>
                  <span *ngIf="!p.latest_state" class="badge badge-neutral shrink-0 mt-0.5">New</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `,
})
export class ProblemListComponent implements OnInit {
  topicGroups: TopicProgress[] = [];
  loading = true;
  error = '';
  studentId = localStorage.getItem('student_id') || '';

  STATE_COLOUR = STATE_COLOUR;
  STATE_ICON = STATE_ICON;

  constructor(private svc: TutorService, private router: Router) {}

  ngOnInit() {
    if (!this.studentId) { this.router.navigate(['/']); return; }
    this.svc.getProgress(this.studentId).subscribe({
      next: (groups) => { this.topicGroups = groups; this.loading = false; },
      error: (e) => { this.error = 'Could not load problems: ' + e.message; this.loading = false; },
    });
  }

  get totalProblems(): number {
    return this.topicGroups.reduce((sum, tg) => sum + tg.problems.length, 0);
  }

  get totalAttempted(): number {
    return this.topicGroups.reduce((sum, tg) => sum + this.attemptedCount(tg), 0);
  }

  get overallAccuracy(): number {
    const attempted = this.topicGroups.flatMap(tg => tg.problems).filter(p => p.latest_state !== null);
    if (attempted.length === 0) return 0;
    const correct = attempted.filter(p => p.latest_state === 'correct').length;
    return correct / attempted.length;
  }

  topicLabel(topic: string): string {
    return TOPIC_LABELS[topic] ?? topic;
  }

  stateLabel(state: string): string {
    if (state === 'correct') return 'Correct';
    if (state === 'partially_flawed') return 'Partial';
    return 'Incorrect';
  }

  attemptedCount(tg: TopicProgress): number {
    return tg.problems.filter(p => p.latest_state !== null).length;
  }

  scoreChipClass(score: number): string {
    if (score >= 0.75) return 'badge-success';
    if (score >= 0.4) return 'badge-warning';
    return 'badge-danger';
  }

  scoreFillClass(score: number): string {
    if (score >= 0.75) return 'bg-emerald-500';
    if (score >= 0.4) return 'bg-amber-500';
    return 'bg-red-500';
  }

  selectProblem(index: number) { this.router.navigate(['/problem', index]); }
  goCustom() { this.router.navigate(['/custom-problem']); }
}
