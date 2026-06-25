import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Problem {
  index: number;
  question: string;
}

export interface ConversationEntry {
  student_attempt: string;
  strategy: string;
  response: string;
}

export interface AttemptResult {
  ok: boolean;
  question: string;
  reference: { steps: string[]; answer: string };
  classification: { state: string; weak_step: string | null; reasoning: string; is_followup: boolean };
  strategy: string;
  response: string;
  srs_card: { interval: number; ease_factor: number; repetitions: number; due_date: string };
  srs_skipped?: boolean;
  error?: string;
}

export interface HistoryEntry {
  state: string;
  timestamp: string;
}

export interface SrsCard {
  problem_index: number;
  interval: number;
  ease_factor: number;
  repetitions: number;
  due_date: string;
  due_now: boolean;
}

@Injectable({ providedIn: 'root' })
export class TutorService {
  constructor(private http: HttpClient) {}

  getProblems(): Observable<Problem[]> {
    return this.http.get<Problem[]>('/api/problems');
  }

  submitAttempt(
    student_id: string,
    problem_index: number,
    student_attempt: string,
    conversation: ConversationEntry[] = [],
  ): Observable<AttemptResult> {
    return this.http.post<AttemptResult>('/api/attempt', {
      student_id,
      problem_index,
      student_attempt,
      conversation,
    });
  }

  getHistory(student_id: string, problem_index: number): Observable<HistoryEntry[]> {
    return this.http.get<HistoryEntry[]>(`/api/history/${student_id}/${problem_index}`);
  }

  getSrs(student_id: string): Observable<SrsCard[]> {
    return this.http.get<SrsCard[]>(`/api/srs/${student_id}`);
  }

  uploadImageForOcr(file: File): Observable<{ text: string }> {
    const form = new FormData();
    form.append('image', file);
    return this.http.post<{ text: string }>('/api/ocr', form);
  }
}
