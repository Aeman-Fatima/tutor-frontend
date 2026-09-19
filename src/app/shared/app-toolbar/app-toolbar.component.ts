import { Component, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

/** Shared top bar used by every inner page: branding/back button, title, and app-wide nav. */
@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatIconModule, MatButtonModule],
  template: `
    <mat-toolbar class="app-toolbar">
      <button *ngIf="showBack" mat-icon-button (click)="goBack()" aria-label="Back" class="!text-white shrink-0">
        <mat-icon>arrow_back</mat-icon>
      </button>
      <a *ngIf="!showBack" routerLink="/problems"
        class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/15 font-bold shrink-0 no-underline text-white">
        &Sigma;
      </a>

      <span class="font-semibold tracking-wide truncate ml-1">{{ title }}</span>

      <ng-content></ng-content>

      <span class="flex-1"></span>

      <ng-content select="[toolbar-extra]"></ng-content>

      <nav *ngIf="showNav" class="flex items-center gap-0.5 shrink-0">
        <a mat-icon-button routerLink="/problems" routerLinkActive="!bg-white/20 !rounded-lg"
          [routerLinkActiveOptions]="{ exact: true }" class="!text-white" aria-label="Problems" title="Problems">
          <mat-icon>list_alt</mat-icon>
        </a>
        <a mat-icon-button routerLink="/srs" routerLinkActive="!bg-white/20 !rounded-lg"
          class="!text-white" aria-label="Spaced repetition" title="Spaced repetition">
          <mat-icon>event_repeat</mat-icon>
        </a>
        <button mat-icon-button (click)="logout()" class="!text-white" aria-label="Switch student" title="Switch student">
          <mat-icon>logout</mat-icon>
        </button>
      </nav>
    </mat-toolbar>
  `,
})
export class AppToolbarComponent {
  @Input() title = '';
  @Input() showBack = true;
  @Input() showNav = true;
  @Input() backRoute: any[] = ['/problems'];

  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(this.backRoute);
  }

  logout() {
    localStorage.removeItem('student_id');
    this.router.navigate(['/']);
  }
}
