import { Component } from '@angular/core';
import { TopbarComponent } from '../../layout/components/topbar/topbar.component';

@Component({ selector: 'app-privacy', standalone: true, imports: [TopbarComponent], templateUrl: './privacy.component.html', styleUrl: '../legal-page.scss' })
export class PrivacyComponent {}
