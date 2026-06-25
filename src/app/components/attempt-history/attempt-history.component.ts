import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TutorService, HistoryEntry } from '../../services/tutor.service';

@Component({
  selector: 'app-attempt-history',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatToolbarModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <mat-toolbar class="!bg-teal-600 !text-white shadow-md">
      <button mat-icon-button (click)="back()"><mat-icon>arrow_back</mat-icon></button>
      <span class="font-semibold">History — Problem {{ problemIndex + 1 }}</span>
    </mat-toolbar>

    <div class="max-w-3xl mx-auto px-4 py-8">
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

        <div class="px-6 py-4 border-b border-slate-100">
          <h2 class="text-base font-semibold text-slate-800">Attempt history for <span class="text-teal-600">{{ studentId }}</span></h2>
        </div>

        <div class="px-6 py-6">
          <div *ngIf="loading" class="flex justify-center py-8">
            <mat-spinner diameter="36"></mat-spinner>
          </div>

          <p *ngIf="!loading && history.length === 0" class="text-slate-400 text-sm py-4">
            No attempts recorded yet for this problem.
          </p>

          <table mat-table [dataSource]="history" *ngIf="!loading && history.length > 0" class="w-full">
            <ng-container matColumnDef="attempt">
              <th mat-header-cell *matHeaderCellDef class="!text-slate-500 !text-xs">#</th>
              <td mat-cell *matCellDef="let row; let i = index" class="!text-slate-600">{{ i + 1 }}</td>
            </ng-container>
            <ng-container matColumnDef="state">
              <th mat-header-cell *matHeaderCellDef class="!text-slate-500 !text-xs">State</th>
              <td mat-cell *matCellDef="let row">
                <span [class]="'state-' + row.state">{{ stateLabel(row.state) }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="timestamp">
              <th mat-header-cell *matHeaderCellDef class="!text-slate-500 !text-xs">Time</th>
              <td mat-cell *matCellDef="let row" class="!text-slate-400 !text-xs">
                {{ row.timestamp | date:'short' }}
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row; columns: cols;" class="hover:bg-slate-50"></tr>
          </table>

          <!-- Dot progression -->
          <div *ngIf="!loading && history.length > 0" class="mt-6">
            <p class="text-xs text-slate-400 mb-2 uppercase tracking-wide">Attempt progression</p>
            <div class="flex gap-2 flex-wrap">
              <div *ngFor="let h of history; let i = index"
                [ngClass]="{
                  'bg-emerald-500': h.state === 'correct',
                  'bg-amber-500':   h.state === 'partially_flawed',
                  'bg-red-500':     h.state === 'incorrect'
                }"
                class="w-5 h-5 rounded-full shadow-sm"
                [title]="'Attempt ' + (i+1) + ': ' + h.state">
              </div>
            </div>
          </div>
        </div>
<!-- 
        <div class="px-6 py-4 border-t border-slate-100">
          <button mat-raised-button
            class="!bg-teal-600 !text-white !rounded-lg"
            (click)="goBack()">
            Try this problem
          </button>
        </div> -->
      </div>
    </div>
  `,
})
export class AttemptHistoryComponent implements OnInit {
  problemIndex = 0;
  studentId = localStorage.getItem('student_id') || '';
  history: HistoryEntry[] = [];
  loading = true;
  cols = ['attempt', 'state', 'timestamp'];

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
    return ({ correct: 'Correct', partially_flawed: 'Partial', incorrect: 'Incorrect' } as Record<string,string>)[s] ?? s;
  }
  back() { this.router.navigate(['/problems']); }
  goBack() { this.router.navigate(['/problem', this.problemIndex]); }
}
