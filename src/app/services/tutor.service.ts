import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Problem {
  index: number;
  question: string;
  topic: string;
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
  topic?: string;
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
  due_now?: boolean;
}

export interface TopicProgress {
  topic: string;
  problems: { index: number; question: string; latest_state: string | null }[];
  score: number;
}

@Injectable({ providedIn: 'root' })
export class TutorService {
  constructor(private http: HttpClient) {}

  getProblems(): Observable<Problem[]> {
    return this.http.get<Problem[]>('/api/problems');
  }

  /** Change C: fetch applicable solution methods for a GSM8K problem */
  getMethodsForProblem(problem_index: number): Observable<{ methods: string[] }> {
    return this.http.get<{ methods: string[] }>(`/api/problems/${problem_index}/methods`);
  }

  /** Bug 2 fix: detect solution methods for any free-form question text (custom problems) */
  getMethodsForQuestion(question: string): Observable<{ methods: string[] }> {
    return this.http.post<{ methods: string[] }>('/api/problems/detect-methods', { question });
  }

  submitAttempt(
    student_id: string,
    problem_index: number,
    student_attempt: string,
    conversation: ConversationEntry[] = [],
    method?: string,   // Change C
  ): Observable<AttemptResult> {
    return this.http.post<AttemptResult>('/api/attempt', {
      student_id,
      problem_index,
      student_attempt,
      conversation,
      method,
    });
  }

  /** Change B: submit an attempt for a user-supplied custom problem */
  submitCustomAttempt(
    student_id: string,
    custom_problem: string,
    student_attempt: string,
    conversation: ConversationEntry[] = [],
    method?: string,
  ): Observable<AttemptResult> {
    return this.http.post<AttemptResult>('/api/attempt', {
      student_id,
      custom_problem,
      student_attempt,
      conversation,
      method,
    });
  }

  getHistory(student_id: string, problem_index: number): Observable<HistoryEntry[]> {
    return this.http.get<HistoryEntry[]>(`/api/history/${student_id}/${problem_index}`);
  }

  getSrs(student_id: string): Observable<SrsCard[]> {
    return this.http.get<SrsCard[]>(`/api/srs/${student_id}`);
  }

  getDueProblems(student_id: string): Observable<SrsCard[]> {
    return this.http.get<SrsCard[]>(`/api/srs/${student_id}/due`);
  }

  getProgress(student_id: string): Observable<TopicProgress[]> {
    return this.http.get<TopicProgress[]>(`/api/progress/${student_id}`);
  }

  uploadImageForOcr(file: File): Observable<{ text: string }> {
    const form = new FormData();
    form.append('image', file);
    return this.http.post<{ text: string }>('/api/ocr', form);
  }

  requestDemo(name: string, email: string, reason: string): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>('/api/demo-request', { name, email, reason });
  }
}
