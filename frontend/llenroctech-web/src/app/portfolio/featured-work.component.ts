import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PortfolioCardComponent } from './portfolio-card.component';
import { PORTFOLIO_PROJECTS } from './portfolio.data';

@Component({selector:'app-featured-work',standalone:true,imports:[RouterLink,PortfolioCardComponent],template:`<section class="featured-work" aria-labelledby="home-featured-title"><div class="heading"><p>SELECTED PROJECTS</p><h2 id="home-featured-title">Featured Work</h2><span>Selected platforms and digital experiences designed and developed by Llenroc Tech.</span></div><div class="grid">@for(project of projects;track project.id){<app-portfolio-card [project]="project" [compact]="true"/>}</div><a class="all-work" routerLink="/portfolio">View all work <span aria-hidden="true">→</span></a></section>`,styles:[`.featured-work{padding:50px 0}.heading p{color:#facd2c;font-weight:800;font-size:.75rem;letter-spacing:.1em}.heading h2{color:#fff}.heading span{color:#b8c2ce}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;margin:28px 0}.all-work{color:#facd2c;font-weight:800}@media(max-width:650px){.grid{grid-template-columns:1fr}}`]})
export class FeaturedWorkComponent { readonly projects=PORTFOLIO_PROJECTS.filter(x=>['enterprise-customer-platform','robot-mower','push-up-sit-up-365','reddick-foundation'].includes(x.id)); }
