import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TutorService } from '../../services/tutor.service';

@Component({
  selector: 'app-request-demo',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <div class="min-h-screen relative overflow-hidden bg-slate-950 flex items-center justify-center px-4">

      <div class="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-violet-500/20 blur-3xl"></div>
      <div class="pointer-events-none absolute -bottom-28 -right-20 w-96 h-96 rounded-full bg-violet-500/10 blur-3xl"></div>

      <div class="w-full max-w-sm relative">

        <button type="button" (click)="back()" class="text-slate-400 hover:text-slate-200 text-sm mb-6 flex items-center gap-1 transition-colors">
          ← Back
        </button>

        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-slate-100">Request a Demo</h1>
          <p class="text-slate-400 text-sm mt-1">Tell me a bit about yourself and I'll send you access.</p>
        </div>

        <div class="app-card p-8" *ngIf="!sent">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Name</mat-label>
            <input matInput [(ngModel)]="name" placeholder="Your name" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Email</mat-label>
            <input matInput type="email" [(ngModel)]="email" placeholder="you@example.com" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Reason (optional)</mat-label>
            <textarea matInput [(ngModel)]="reason" rows="3" placeholder="What would you like to see?"></textarea>
          </mat-form-field>

          <!-- honeypot: hidden from real users, bots tend to fill every field -->
          <input type="text" [(ngModel)]="company" name="company" tabindex="-1" autocomplete="off"
            class="!absolute !w-px !h-px !opacity-0 !pointer-events-none" aria-hidden="true" />

          <button mat-raised-button
            class="btn-primary w-full mt-2 !py-1"
            [disabled]="!isValid() || sending"
            (click)="submit()">
            <mat-spinner *ngIf="sending" diameter="16" class="!inline-block mr-2 align-middle"></mat-spinner>
            {{ sending ? 'Sending…' : 'Send Request' }}
          </button>

          <p *ngIf="error" class="text-red-400 text-sm mt-2">{{ error }}</p>
        </div>

        <div class="app-card p-8 text-center" *ngIf="sent">
          <p class="text-violet-400 text-2xl mb-2">✓</p>
          <p class="text-slate-100 font-semibold mb-1">Request sent</p>
          <p class="text-slate-400 text-sm">Thanks {{ name }} — I'll get back to you at {{ email }} soon.</p>
        </div>

      </div>
    </div>
  `,
})
export class RequestDemoComponent {
  name = '';
  email = '';
  reason = '';
  company = ''; // honeypot
  sending = false;
  sent = false;
  error = '';

  constructor(private router: Router, private svc: TutorService) {}

  isValid(): boolean {
    return this.name.trim().length > 0 && /\S+@\S+\.\S+/.test(this.email.trim());
  }

  submit() {
    if (!this.isValid() || this.sending) return;
    this.sending = true;
    this.error = '';
    this.svc.requestDemo(this.name.trim(), this.email.trim(), this.reason.trim()).subscribe({
      next: () => { this.sending = false; this.sent = true; },
      error: (e) => {
        this.sending = false;
        this.error = e.error?.error ?? 'Could not send your request. Please try again later.';
      },
    });
  }

  back() { this.router.navigate(['/']); }
}
