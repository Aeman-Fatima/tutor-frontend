import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export const METHOD_LABELS: Record<string, string> = {
  direct: 'Direct Arithmetic',
  algebra: 'Algebra (variables & equations)',
  unit_rate: 'Unit Rate',
  proportion: 'Proportion Table',
  percentage: 'Percentage / Decimal',
};

/** Pill-style picker for which solution method the student intends to use on their first attempt. */
@Component({
  selector: 'app-method-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule],
  template: `
    <div class="mb-4">
      <p class="text-xs text-slate-500 font-semibold mb-2 uppercase tracking-wide">Solution method</p>
      <div class="flex flex-wrap gap-2">
        <button type="button" *ngFor="let m of methods"
          class="method-pill" [class.method-pill-active]="selectedMethod === m"
          (click)="select(m)">
          {{ methodLabel(m) }}
        </button>
        <button type="button" class="method-pill" [class.method-pill-active]="selectedMethod === 'other'"
          (click)="select('other')">
          Other
        </button>
      </div>

      <mat-form-field *ngIf="selectedMethod === 'other'" appearance="outline" class="w-full mt-2">
        <mat-label>Describe your approach</mat-label>
        <input matInput [ngModel]="customMethodText" (ngModelChange)="customMethodTextChange.emit($event)"
          placeholder="e.g. draw a diagram and count…" />
      </mat-form-field>
    </div>
  `,
})
export class MethodSelectorComponent {
  @Input() methods: string[] = [];
  @Input() selectedMethod = 'direct';
  @Output() selectedMethodChange = new EventEmitter<string>();
  @Input() customMethodText = '';
  @Output() customMethodTextChange = new EventEmitter<string>();

  select(m: string) {
    this.selectedMethod = m;
    this.selectedMethodChange.emit(m);
  }

  methodLabel(m: string): string {
    return METHOD_LABELS[m] ?? m;
  }
}
