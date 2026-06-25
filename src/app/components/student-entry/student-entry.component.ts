import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-student-entry',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <div class="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div class="w-full max-w-sm">

        <!-- Logo / title -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600 mb-4 shadow-md">
            <span class="text-white text-2xl font-bold">∑</span>
          </div>
          <h1 class="text-2xl font-bold text-slate-800">AI Math Tutor</h1>
          <p class="text-slate-500 text-sm mt-1">Adaptive Socratic guidance for GSM8K problems</p>
        </div>

        <!-- Card -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <p class="text-slate-600 text-sm mb-5">Enter your name or student ID to begin.</p>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Student ID</mat-label>
            <input matInput [(ngModel)]="studentId" (keyup.enter)="proceed()" placeholder="e.g. aeman" />
          </mat-form-field>

          <button mat-raised-button
            class="w-full mt-2 !bg-teal-600 !text-white !rounded-lg !py-1"
            [disabled]="!studentId.trim()"
            (click)="proceed()">
            Start
          </button>
        </div>

      </div>
    </div>
  `,
})
export class StudentEntryComponent {
  studentId = '';
  constructor(private router: Router) {}
  proceed() {
    const id = this.studentId.trim();
    if (!id) return;
    localStorage.setItem('student_id', id);
    this.router.navigate(['/problems']);
  }
}
