import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TutorService, SrsCard } from '../../services/tutor.service';

@Component({
  selector: 'app-srs-dashboard',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatToolbarModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <mat-toolbar class="!bg-teal-600 !text-white shadow-md">
      <button mat-icon-button (click)="back()"><mat-icon>arrow_back</mat-icon></button>
      <span class="font-semibold">Spaced Repetition Schedule</span>
    </mat-toolbar>

    <div class="max-w-3xl mx-auto px-4 py-8">

      <div *ngIf="loading" class="flex justify-center py-16">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <ng-container *ngIf="!loading">

        <!-- Due today alert -->
        <div *ngIf="dueNow.length > 0"
          class="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-5 flex items-start gap-3">
          <mat-icon class="!text-amber-500 shrink-0 mt-0.5">schedule</mat-icon>
          <div>
            <p class="text-amber-800 font-semibold text-sm mb-2">
              {{ dueNow.length }} problem(s) due for review today
            </p>
            <div class="flex flex-wrap gap-2">
              <button mat-stroked-button
                *ngFor="let c of dueNow"
                class="!border-amber-400 !text-amber-700 !rounded-lg !text-xs"
                (click)="goToProblem(c.problem_index)">
                Problem {{ c.problem_index + 1 }}
              </button>
            </div>
          </div>
        </div>

        <p *ngIf="cards.length === 0" class="text-slate-400 text-sm py-4">
          No SRS cards yet — attempt some problems first.
        </p>

        <!-- Schedule table -->
        <div *ngIf="cards.length > 0" class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-100">
            <h2 class="text-base font-semibold text-slate-800">
              Full schedule — <span class="text-teal-600">{{ studentId }}</span>
            </h2>
          </div>
          <table mat-table [dataSource]="cards" class="w-full">

            <ng-container matColumnDef="problem">
              <th mat-header-cell *matHeaderCellDef class="!text-slate-500 !text-xs">Problem</th>
              <td mat-cell *matCellDef="let c">
                <a class="text-teal-600 cursor-pointer text-sm font-medium hover:underline"
                   (click)="goToProblem(c.problem_index)">
                  Problem {{ c.problem_index + 1 }}
                </a>
              </td>
            </ng-container>

            <ng-container matColumnDef="due_date">
              <th mat-header-cell *matHeaderCellDef class="!text-slate-500 !text-xs">Next Review</th>
              <td mat-cell *matCellDef="let c" class="!text-slate-700 !text-sm">
                {{ c.due_date }}
                <span *ngIf="c.due_now" class="due-chip ml-2">DUE</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="interval">
              <th mat-header-cell *matHeaderCellDef class="!text-slate-500 !text-xs">Interval</th>
              <td mat-cell *matCellDef="let c" class="!text-slate-600 !text-sm">{{ c.interval }}d</td>
            </ng-container>

            <ng-container matColumnDef="repetitions">
              <th mat-header-cell *matHeaderCellDef class="!text-slate-500 !text-xs">Reps</th>
              <td mat-cell *matCellDef="let c" class="!text-slate-600 !text-sm">{{ c.repetitions }}</td>
            </ng-container>

            <ng-container matColumnDef="ease_factor">
              <th mat-header-cell *matHeaderCellDef class="!text-slate-500 !text-xs">Ease</th>
              <td mat-cell *matCellDef="let c" class="!text-slate-600 !text-sm">
                {{ c.ease_factor | number:'1.2-2' }}
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row; columns: cols;"
              [class.bg-amber-50]="row.due_now"
              class="hover:bg-slate-50"></tr>
          </table>
        </div>
      </ng-container>
    </div>
  `,
})
export class SrsDashboardComponent implements OnInit {
  studentId = localStorage.getItem('student_id') || '';
  cards: SrsCard[] = [];
  dueNow: SrsCard[] = [];
  loading = true;
  cols = ['problem', 'due_date', 'interval', 'repetitions', 'ease_factor'];

  constructor(private svc: TutorService, private router: Router) {}

  ngOnInit() {
    if (!this.studentId) { this.router.navigate(['/']); return; }
    this.svc.getSrs(this.studentId).subscribe({
      next: (cs) => { this.cards = cs; this.dueNow = cs.filter(c => c.due_now); this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  back() { this.router.navigate(['/problems']); }
  goToProblem(idx: number) { this.router.navigate(['/problem', idx]); }
}
