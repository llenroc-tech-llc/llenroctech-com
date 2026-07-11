import { Component } from '@angular/core';
import { ClassManagerService } from '../../services/classmanaer.service';
@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styles: ``
})
export class HomeComponent {
  constructor(private classManager: ClassManagerService) {
    this.classManager.setClass('main-hero-area2');
  }
}
