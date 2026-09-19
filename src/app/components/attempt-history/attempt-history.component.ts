import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TutorService, HistoryEntry } from '../../services/tutor.service';
import { AppToolbarComponent } from '../../shared/app-toolbar/app-toolbar.component';

const STATE_BADGE: Record<string, string> = {
  correct: 'badge-success',
  partially_flawed: 'badge-warning',
  incorrect: 'badge-danger',
};

const STATE_DOT: Record<string, string> = {
  correct: 'bg-emerald-500',
  partially_flawed: 'bg-amber-500',
  incorrect: 'bg-red-500',
};

@Component({
  selector: 'app-attempt-history',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, AppToolbarComponent],
  template: `
    <app-toolbar [title]="'History — Problem ' + (problemIndex + 1)" [backRoute]="['/problem', problemIndex]"></app-toolbar>

    <div class="page-shell">
      <div class="app-card overflow-hidden">

        <div class="px-5 sm:px-6 py-4 border-b border-slate-800">
          <h2 class="text-base font-semibold text-slate-100">
            Attempt history for <span class="text-violet-400">{{ studentId }}</span>
          </h2>
        </div>

        <div class="px-5 sm:px-6 py-6">
          <div *ngIf="loading" class="flex justify-center py-8">
            <mat-spinner diameter="36"></mat-spinner>
          </div>

          <p *ngIf="!loading && history.length === 0" class="text-slate-400 text-sm py-4">
            No attempts recorded yet for this problem.
          </p>

          <!-- Timeline -->
          <ol *ngIf="!loading && history.length > 0" class="space-y-0">
            <li *ngFor="let h of history; let i = index" class="flex gap-3 msg-in">
              <div class="flex flex-col items-center">
                <span class="w-3 h-3 rounded-full shrink-0 mt-1.5" [ngClass]="STATE_DOT[h.state]"></span>
                <span *ngIf="i < history.length - 1" class="w-px flex-1 bg-slate-800 my-1"></span>
              </div>
              <div class="flex-1 pb-5 flex items-center justify-between gap-3 flex-wrap">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium text-slate-200">Attempt {{ i + 1 }}</span>
                  <span class="badge" [ngClass]="STATE_BADGE[h.state]">{{ stateLabel(h.state) }}</span>
                </div>
                <span class="text-xs text-slate-500">{{ h.timestamp | date:'short' }}</span>
              </div>
            </li>
          </ol>

          <!-- Summary strip -->
          <div *ngIf="!loading && history.length > 0" class="mt-2 pt-4 border-t border-slate-800">
            <p class="text-xs text-slate-500 mb-2 uppercase tracking-wide">At a glance</p>
            <div class="flex gap-1.5 flex-wrap">
              <div *ngFor="let h of history; let i = index"
                [ngClass]="STATE_DOT[h.state]"
                class="w-5 h-5 rounded-full shadow-sm"
                [title]="'Attempt ' + (i+1) + ': ' + h.state">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AttemptHistoryComponent implements OnInit {
  problemIndex = 0;
  studentId = localStorage.getItem('student_id') || '';
  history: HistoryEntry[] = [];
  loading = true;

  STATE_BADGE = STATE_BADGE;
  STATE_DOT = STATE_DOT;

  constructor(private route: ActivatedRoute, private router: Router, private svc: TutorService) {}

  ngOnInit() {
    if (!this.studentId) { this.router.navigate(['/']); return; }
    this.problemIndex = Number(this.route.snapshot.paramMap.get('index') ?? 0);
    this.svc.getHistory(this.studentId, this.problemIndex).subscribe({
      next: (h) => { this.history = h; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  stateLabel(s: string) {
    return ({ correct: 'Correct', partially_flawed: 'Partial', incorrect: 'Incorrect' } as Record<string, string>)[s] ?? s;
  }
}
