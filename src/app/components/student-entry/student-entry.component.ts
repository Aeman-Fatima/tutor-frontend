import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-student-entry',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <div class="min-h-screen relative overflow-hidden bg-slate-950 flex items-center justify-center px-4">

      <!-- decorative background glow -->
      <div class="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-violet-500/20 blur-3xl"></div>
      <div class="pointer-events-none absolute -bottom-28 -right-20 w-96 h-96 rounded-full bg-violet-500/10 blur-3xl"></div>
      <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_60%)]"></div>

      <div class="w-full max-w-sm relative">

        <!-- Logo / title -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-500 mb-4 shadow-lg shadow-violet-500/30">
            <span class="text-white text-2xl font-bold">∑</span>
          </div>
          <h1 class="text-2xl font-bold text-slate-100">AI Math Tutor</h1>
          <p class="text-slate-400 text-sm mt-1">Adaptive Socratic guidance for math word problems</p>
        </div>

        <!-- Card -->
        <div class="app-card p-8">
          <p class="text-slate-300 text-sm mb-5">Enter your name or student ID to begin.</p>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Student ID</mat-label>
            <input matInput [(ngModel)]="studentId" (keyup.enter)="proceed()" placeholder="e.g. aeman" autofocus />
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Access code</mat-label>
            <input matInput type="password" [(ngModel)]="accessCode" (keyup.enter)="proceed()" placeholder="only needed on the public demo" />
          </mat-form-field>

          <button mat-raised-button
            class="btn-primary w-full mt-2 !py-1"
            [disabled]="!studentId.trim()"
            (click)="proceed()">
            Start
          </button>

          <button mat-stroked-button
            class="btn-outline w-full mt-2 !py-1"
            (click)="requestDemo()">
            Request a Demo
          </button>
        </div>

        <p class="text-center text-xs text-slate-500 mt-6">
          Works through the steps with you — it won't just hand you the answer.
        </p>

      </div>
    </div>
  `,
})
export class StudentEntryComponent {
  studentId = '';
  accessCode = '';
  constructor(private router: Router) {}
  proceed() {
    const id = this.studentId.trim();
    if (!id) return;
    localStorage.setItem('student_id', id);
    if (this.accessCode.trim()) {
      localStorage.setItem('access_code', this.accessCode.trim());
    }
    this.router.navigate(['/custom-problem']);
  }
  requestDemo() {
    this.router.navigate(['/request-demo']);
  }
}
