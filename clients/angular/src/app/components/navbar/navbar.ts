import { Component, Input } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-navbar',
  imports: [MatIconModule, MatToolbar, MatButtonModule, MatTooltipModule, MatMenuModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  // Pass in a signal from parent
  @Input({ required: true }) title!: () => string;
  @Input({ required: true }) toggleDrawer!: () => void;
  
  isConnected: boolean = false;
  
  unpairDevice() {
    this.isConnected = false;
  }
  pairDevice() {
    this.isConnected = true;
  }


  onMenuClick() {
    this.toggleDrawer();
  }

  
  goToPharmetrix() {
    window.open('https://thepharmetrix.netlify.app', '_blank');
  }

  goToGithub() {
    window.open('https://github.com/imprakhartripathi/Pharmetrix', '_blank');
  }
}
