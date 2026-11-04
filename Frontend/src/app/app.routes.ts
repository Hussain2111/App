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
import { authGuardGuard } from './auth-guard-guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: Landing },
  {
    path: '',
    component: Shell,
    children: [
      { path: 'dashboard', component: Dashboard, data: { view: 'overview' }, canMatch: [authGuardGuard] },
      { path: 'dashboard/analytics', component: Dashboard, data: { view: 'analytics' }, canMatch: [authGuardGuard] },
      { path: 'dashboard/audit', component: Dashboard, data: { view: 'audit' }, canMatch: [authGuardGuard] },
      { path: 'dashboard/planner', component: Planner, data: { view: 'calendar' }, canMatch: [authGuardGuard] },
      { path: 'dashboard/planner/draft', component: Planner, data: { view: 'draft' }, canMatch: [authGuardGuard] },
      { path: 'dashboard/planner/review', component: Planner, data: { view: 'review' }, canMatch: [authGuardGuard] },
      { path: 'hot-topics', component: Discovery, data: { view: 'discover' }, canMatch: [authGuardGuard] },
      { path: 'hot-topics/saved', component: Discovery, data: { view: 'saved' }, canMatch: [authGuardGuard] },
      { path: 'hot-topics/updates', component: Discovery, data: { view: 'updates' }, canMatch: [authGuardGuard] },
      { path: 'competitors', component: Competitors },
      { path: 'competitors/compare', component: Competitors, data: { view: 'compare' }, canMatch: [authGuardGuard] },
      { path: 'chat', component: Chat },
      { path: 'settings', component: Settings, data: { view: 'general' }, canMatch: [authGuardGuard] },
      { path: 'settings/instagram', component: Settings, data: { view: 'instagram' }, canMatch: [authGuardGuard] },
      { path: 'settings/content', component: Settings, data: { view: 'content' }, canMatch: [authGuardGuard] },
      { path: 'settings/privacy', component: Settings, data: { view: 'privacy' }, canMatch: [authGuardGuard] },
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
    canMatch: [authGuardGuard],
  },
  {
    path: 'step2',
    component: Step2,
    canMatch: [authGuardGuard],
  },
  {
    path: 'step3',
    component: Step3,
    canMatch: [authGuardGuard],
  },
  { path: 'recover', component: PublicInfo, data: { kind: 'recover' } },
  { path: 'privacy', component: PublicInfo, data: { kind: 'privacy' } },
  { path: 'terms', component: PublicInfo, data: { kind: 'terms' } },
  { path: 'contact', component: PublicInfo, data: { kind: 'contact' } },
  { path: '**', component: PublicInfo, data: { kind: 'missing' } },
];
