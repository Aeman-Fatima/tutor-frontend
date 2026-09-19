import { Routes } from '@angular/router';
import { StudentEntryComponent }       from './components/student-entry/student-entry.component';
import { ProblemListComponent }        from './components/problem-list/problem-list.component';
import { ProblemViewComponent }        from './components/problem-view/problem-view.component';
import { CustomProblemViewComponent }  from './components/custom-problem-view/custom-problem-view.component';
import { AttemptHistoryComponent }     from './components/attempt-history/attempt-history.component';
import { SrsDashboardComponent }       from './components/srs-dashboard/srs-dashboard.component';
import { RequestDemoComponent }        from './components/request-demo/request-demo.component';

export const routes: Routes = [
  { path: '',               component: StudentEntryComponent },
  { path: 'request-demo',   component: RequestDemoComponent },
  { path: 'problems',       component: ProblemListComponent },
  { path: 'problem/:index', component: ProblemViewComponent },
  { path: 'custom-problem', component: CustomProblemViewComponent },   // Change B
  { path: 'history/:index', component: AttemptHistoryComponent },
  { path: 'srs',            component: SrsDashboardComponent },
  { path: '**',             redirectTo: '' },
];
