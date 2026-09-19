import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttemptResult } from '../../services/tutor.service';

/** Renders the problem statement plus the running thread of attempt/response exchanges. */
@Component({
  selector: 'app-conversation-thread',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="app-card px-5 sm:px-6 py-5">
      <p class="text-xs uppercase tracking-widest text-violet-400 font-semibold mb-2">{{ problemLabel }}</p>
      <p class="text-slate-100 text-base leading-relaxed whitespace-pre-wrap">{{ question }}</p>
    </div>

    <ng-container *ngFor="let ex of exchanges; let i = index">

      <div class="flex justify-end msg-in">
        <div class="max-w-[85%] sm:max-w-lg bg-violet-500/10 border border-violet-500/25 rounded-2xl rounded-tr-sm px-5 py-3">
          <p class="text-xs text-violet-400 font-semibold mb-1 uppercase tracking-wide">Attempt {{ i + 1 }}</p>
          <p class="text-slate-200 text-sm whitespace-pre-wrap leading-relaxed">{{ displayTexts[i] }}</p>
        </div>
      </div>

      <div class="flex items-center gap-2 px-1 flex-wrap msg-in">
        <span *ngIf="ex.classification.is_followup" class="badge badge-info">follow-up reply</span>
        <ng-container *ngIf="!ex.classification.is_followup">
          <span [class]="'state-' + ex.classification.state" class="text-xs">{{ stateLabel(ex.classification.state) }}</span>
          <span class="text-slate-600 text-xs">·</span>
        </ng-container>
        <code class="bg-slate-800 text-violet-300 text-xs px-2 py-0.5 rounded-md font-mono">{{ ex.strategy }}</code>
        <span *ngIf="ex.classification.weak_step" class="text-slate-500 text-xs truncate max-w-[10rem] sm:max-w-xs">
          · {{ ex.classification.weak_step }}
        </span>
        <span *ngIf="ex.srs_skipped" class="text-xs text-slate-600">(SRS not updated)</span>
      </div>

      <div class="flex justify-start msg-in">
        <div class="max-w-[85%] sm:max-w-lg">
          <p class="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wide px-1">Tutor</p>
          <div class="tutor-response rounded-2xl rounded-tl-sm">{{ ex.response }}</div>
        </div>
      </div>

      <div class="text-xs text-slate-500 px-1 msg-in" *ngIf="ex.srs_card && !ex.srs_skipped">
        SRS: next review in <strong class="text-violet-400">{{ ex.srs_card.interval }}d</strong>
        · ease {{ ex.srs_card.ease_factor | number:'1.2-2' }}
        · reps {{ ex.srs_card.repetitions }}
      </div>

      <hr *ngIf="i < exchanges.length - 1" class="border-slate-800" />

    </ng-container>
  `,
})
export class ConversationThreadComponent {
  @Input() question = '';
  @Input() problemLabel = 'Problem';
  @Input() exchanges: AttemptResult[] = [];
  @Input() displayTexts: string[] = [];

  stateLabel(s: string) {
    return ({ correct: 'Correct ✓', partially_flawed: 'Partially Flawed', incorrect: 'Incorrect' } as Record<string, string>)[s] ?? s;
  }
}
