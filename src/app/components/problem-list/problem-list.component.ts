import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TutorService, Problem } from '../../services/tutor.service';

@Component({
  selector: 'app-problem-list',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatToolbarModule, MatIconModule, MatButtonModule],
  template: `
    <!-- Toolbar -->
    <mat-toolbar class="!bg-teal-600 !text-white shadow-md">
      <span class="font-semibold tracking-wide">AI Math Tutor</span>
      <span class="flex-1"></span>
      <span class="text-sm opacity-80 mr-2">{{ studentId }}</span>
      <button mat-icon-button (click)="goSrs()" title="SRS Dashboard">
        <mat-icon>event_repeat</mat-icon>
      </button>
    </mat-toolbar>

    <div class="max-w-3xl mx-auto px-4 py-8">
      <h2 class="text-xl font-bold text-slate-800 mb-6">Pick a Problem</h2>

      <!-- Loading -->
      <div *ngIf="loading" class="flex flex-col items-center py-16">
        <mat-spinner diameter="40"></mat-spinner>
        <p class="text-slate-400 mt-4 text-sm">Loading problems from GSM8K…</p>
      </div>

      <!-- Error -->
      <div *ngIf="error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
        {{ error }}
      </div>

      <!-- Problem cards -->
      <div *ngIf="!loading && !error" class="space-y-3">
        <div *ngFor="let p of problems"
          class="bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-4 cursor-pointer
                 hover:border-teal-400 hover:shadow-md transition-all duration-150"
          (click)="selectProblem(p)">
          <div class="flex items-start gap-3">
            <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-teal-50
                         text-teal-700 text-xs font-bold shrink-0 mt-0.5">
              {{ p.index + 1 }}
            </span>
            <p class="text-slate-600 text-sm leading-relaxed line-clamp-2">{{ p.question }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ProblemListComponent implements OnInit {
  problems: Problem[] = [];
  loading = true;
  error = '';
  studentId = localStorage.getItem('student_id') || '';

  constructor(private svc: TutorService, private router: Router) {}

  ngOnInit() {
    if (!this.studentId) { this.router.navigate(['/']); return; }
    this.svc.getProblems().subscribe({
      next: (ps) => { this.problems = ps; this.loading = false; },
      error: (e) => { this.error = 'Could not load problems: ' + e.message; this.loading = false; },
    });
  }

  selectProblem(p: Problem) { this.router.navigate(['/problem', p.index]); }
  goSrs() { this.router.navigate(['/srs']); }
}
