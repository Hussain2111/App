import { Routes } from '@angular/router';
import { Landing } from './features/landing/landing';
import { SignUp } from './sign-up/sign-up';
import { SignIn } from './sign-in/sign-in';
import { Step1 } from './connect/step1/step1';
import { Step2 } from './connect/step2/step2';
import { Step3 } from './connect/step3/step3';
import { Shell } from './workspace/shell';
import { Dashboard } from './workspace/dashboard';
import { Planner } from './workspace/planner';
import { Discovery } from './workspace/discovery';
import { Competitors } from './workspace/competitors';
import { Chat } from './workspace/chat';
import { Settings } from './workspace/settings';
import { States } from './workspace/states';
import { PublicInfo } from './public-info';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: Landing },
  {
    path: '',
    component: Shell,
    children: [
      { path: 'dashboard', component: Dashboard, data: { view: 'overview' } },
      { path: 'dashboard/analytics', component: Dashboard, data: { view: 'analytics' } },
      { path: 'dashboard/audit', component: Dashboard, data: { view: 'audit' } },
      { path: 'dashboard/planner', component: Planner, data: { view: 'calendar' } },
      { path: 'dashboard/planner/draft', component: Planner, data: { view: 'draft' } },
      { path: 'dashboard/planner/review', component: Planner, data: { view: 'review' } },
      { path: 'hot-topics', component: Discovery, data: { view: 'discover' } },
      { path: 'hot-topics/saved', component: Discovery, data: { view: 'saved' } },
      { path: 'hot-topics/updates', component: Discovery, data: { view: 'updates' } },
      { path: 'competitors', component: Competitors },
      { path: 'competitors/compare', component: Competitors, data: { view: 'compare' } },
      { path: 'chat', component: Chat },
      { path: 'settings', component: Settings, data: { view: 'general' } },
      { path: 'settings/instagram', component: Settings, data: { view: 'instagram' } },
      { path: 'settings/content', component: Settings, data: { view: 'content' } },
      { path: 'settings/privacy', component: Settings, data: { view: 'privacy' } },
      { path: 'states', component: States },
    ],
  },

  {
    path: 'sign-up',
    component: SignUp,
  },
  {
    path: 'sign-in',
    component: SignIn,
  },
  {
    path: 'step1',
    component: Step1,
  },
  {
    path: 'step2',
    component: Step2,
  },
  {
    path: 'step3',
    component: Step3,
  },
  { path: 'recover', component: PublicInfo, data: { kind: 'recover' } },
  { path: 'privacy', component: PublicInfo, data: { kind: 'privacy' } },
  { path: 'terms', component: PublicInfo, data: { kind: 'terms' } },
  { path: 'contact', component: PublicInfo, data: { kind: 'contact' } },
  { path: '**', component: PublicInfo, data: { kind: 'missing' } },
];
