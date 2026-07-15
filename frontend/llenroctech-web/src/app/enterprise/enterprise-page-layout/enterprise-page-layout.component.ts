import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopbarComponent } from '../../layout/components/topbar/topbar.component';

@Component({
  selector: 'app-enterprise-page-layout',
  standalone: true,
  imports: [RouterOutlet, TopbarComponent],
  templateUrl: './enterprise-page-layout.component.html',
})
export class EnterprisePageLayoutComponent {}
