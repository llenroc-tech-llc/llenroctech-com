import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-forms-index',
  imports: [CommonModule, RouterModule],
  templateUrl: './forms-index.component.html',
  styleUrl: './forms-index.component.scss'
})
export class FormsIndexComponent {
  heading = 'Forms';
  // Replace with your real auth/role logic or a canActivate guard on admin routes
  isAdmin = true;
  showSectionHeader = true;
}
