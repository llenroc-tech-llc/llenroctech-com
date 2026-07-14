import { Component } from '@angular/core';
import { TopbarComponent } from '../../layout/components/topbar/topbar.component';
import { SiteFooterComponent } from '../../layout/components/site-footer/site-footer.component';

@Component({ selector: 'app-privacy', standalone: true, imports: [TopbarComponent, SiteFooterComponent], templateUrl: './privacy.component.html', styleUrl: '../legal-page.scss' })
export class PrivacyComponent {}
