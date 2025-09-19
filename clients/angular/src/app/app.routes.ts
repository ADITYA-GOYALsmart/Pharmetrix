import { Routes } from '@angular/router';
import { Homepage } from './components/homepage/homepage';
import { Notfound } from './components/notfound/notfound';

export const routes: Routes = [
  { path: '', component: Homepage },
  { path: '**', component: Notfound },
];
