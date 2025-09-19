import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Sidebar } from './components/sidebar/sidebar';
import { Navbar } from './components/navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatSidenavModule, Sidebar, Navbar],
  template: `
    <mat-drawer-container class="container" autosize>
      <mat-drawer class="sidenav" mode="over" [opened]="isDrawerOpen()">
        <app-sidebar></app-sidebar>
      </mat-drawer>

      <div class="content">
        <app-navbar [title]="title" [toggleDrawer]="toggleDrawer"> </app-navbar>
        <router-outlet></router-outlet>
      </div>
    </mat-drawer-container>
  `,
  styles: `
    .container{
      height: 100vh;
      width: 100vw;
    }
    .sidenav {
      width: 20%;
    }
  `
})
export class App {
  readonly title = signal('Pharmetrix EDC Module Dashboard');
  readonly isDrawerOpen = signal(false);

  toggleDrawer = () => {
    this.isDrawerOpen.update((v) => !v);
  };
}
