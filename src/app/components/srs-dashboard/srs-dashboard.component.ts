import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { TutorService, SrsCard } from '../../services/tutor.service';
import { AppToolbarComponent } from '../../shared/app-toolbar/app-toolbar.component';

@Component({
  selector: 'app-srs-dashboard',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, AppToolbarComponent],
  template: `
    <app-toolbar title="Spaced Repetition Schedule" [backRoute]="['/problems']"></app-toolbar>

    <div class="page-shell">

      <div *ngIf="loading" class="flex justify-center py-16">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <ng-container *ngIf="!loading">

        <!-- Overview stats -->
        <div class="grid grid-cols-2 gap-3 mb-6" *ngIf="allCards.length > 0">
          <div class="app-card px-4 py-3 text-center">
            <p class="text-2xl font-bold text-slate-100">{{ allCards.length }}</p>
            <p class="text-xs text-slate-400 mt-0.5">Cards scheduled</p>
          </div>
          <div class="app-card px-4 py-3 text-center">
            <p class="text-2xl font-bold" [class.text-amber-400]="dueCards.length > 0" [class.text-emerald-400]="dueCards.length === 0">
              {{ dueCards.length }}
            </p>
            <p class="text-xs text-slate-400 mt-0.5">Due today</p>
          </div>
        </div>

        <!-- Due for review section -->
        <div *ngIf="dueCards.length > 0" class="bg-amber-500/10 border border-amber-500/30 rounded-2xl px-5 py-5 mb-6">
          <div class="flex items-center gap-2 mb-3">
            <mat-icon class="!text-amber-400">schedule</mat-icon>
            <h2 class="text-amber-300 font-bold text-base">
              Due for Review — {{ dueCards.length }} problem{{ dueCards.length !== 1 ? 's' : '' }}
            </h2>
          </div>
          <p class="text-amber-400/80 text-sm mb-3">These problems are scheduled for review today or are overdue.</p>
          <div class="flex flex-wrap gap-2">
            <button mat-stroked-button
              *ngFor="let c of dueCards"
              class="!border-amber-500/50 !text-amber-300 !rounded-lg !text-xs !font-semibold hover:!bg-amber-500/10 transition-colors"
              (click)="goToProblem(c.problem_index)">
              <mat-icon class="!text-xs !h-4 !w-4 mr-1">replay</mat-icon>
              Problem {{ c.problem_index + 1 }}
              <span class="ml-1 text-amber-400/70">(due {{ c.due_date }})</span>
            </button>
          </div>
        </div>

        <div *ngIf="dueCards.length === 0 && allCards.length > 0"
          class="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-5 py-4 mb-6 flex items-center gap-3">
          <mat-icon class="!text-emerald-400">check_circle</mat-icon>
          <p class="text-emerald-300 text-sm font-medium">All caught up — no problems due for review today.</p>
        </div>

        <p *ngIf="allCards.length === 0" class="text-slate-400 text-sm py-4">
          No SRS cards yet — attempt some problems first.
        </p>

        <!-- Full schedule -->
        <div *ngIf="allCards.length > 0" class="app-card overflow-hidden">
          <div class="px-5 sm:px-6 py-4 border-b border-slate-800">
            <h2 class="text-base font-semibold text-slate-100">
              Full schedule — <span class="text-violet-400">{{ studentId }}</span>
            </h2>
          </div>

          <ul class="divide-y divide-slate-800">
            <li *ngFor="let c of allCards"
              class="px-5 sm:px-6 py-3 flex items-center justify-between gap-3 flex-wrap hover:bg-slate-800/40 transition-colors"
              [ngClass]="isDue(c) ? 'bg-amber-500/5' : ''">
              <a class="text-violet-400 cursor-pointer text-sm font-medium hover:underline shrink-0"
                (click)="goToProblem(c.problem_index)">
                Problem {{ c.problem_index + 1 }}
              </a>
              <div class="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                <span>Next: <strong class="text-slate-300 font-medium">{{ c.due_date }}</strong>
                  <span *ngIf="isDue(c)" class="due-chip ml-1">DUE</span>
                </span>
                <span>{{ c.interval }}d interval</span>
                <span>{{ c.repetitions }} reps</span>
                <span>ease {{ c.ease_factor | number:'1.2-2' }}</span>
              </div>
            </li>
          </ul>
        </div>
      </ng-container>
    </div>
  `,
})
export class SrsDashboardComponent implements OnInit {
  studentId = localStorage.getItem('student_id') || '';
  allCards: SrsCard[] = [];
  dueCards: SrsCard[] = [];
  loading = true;
  today = new Date().toISOString().slice(0, 10);

  constructor(private svc: TutorService, private router: Router) {}

  ngOnInit() {
    if (!this.studentId) { this.router.navigate(['/']); return; }
    forkJoin({
      all: this.svc.getSrs(this.studentId),
      due: this.svc.getDueProblems(this.studentId),
    }).subscribe({
      next: ({ all, due }) => {
        this.allCards = all;
        this.dueCards = due;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  isDue(c: SrsCard): boolean {
    return c.due_date <= this.today;
  }

  goToProblem(idx: number) { this.router.navigate(['/problem', idx]); }
}
