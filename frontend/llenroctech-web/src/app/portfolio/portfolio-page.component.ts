import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { TopbarComponent } from '../layout/components/topbar/topbar.component';
import { MarketplaceGalleryComponent } from './marketplace-gallery.component';
import { PortfolioCardComponent } from './portfolio-card.component';
import { PORTFOLIO_PROJECTS, TRUSTED_TECHNOLOGIES } from './portfolio.data';

@Component({selector:'app-portfolio-page',standalone:true,imports:[RouterLink,TopbarComponent,PortfolioCardComponent,MarketplaceGalleryComponent],templateUrl:'./portfolio-page.component.html',styleUrl:'./portfolio-page.component.scss'})
export class PortfolioPageComponent implements OnInit,OnDestroy {
  readonly featured=PORTFOLIO_PROJECTS.filter(x=>x.section==='featured'); readonly templates=PORTFOLIO_PROJECTS.filter(x=>x.section==='templates'); readonly innovation=PORTFOLIO_PROJECTS.filter(x=>x.section==='innovation'); readonly technologies=TRUSTED_TECHNOLOGIES;
  private canonical?:HTMLLinkElement; private schema?:HTMLScriptElement;
  constructor(private title:Title,private meta:Meta,@Inject(DOCUMENT) private document:Document){}
  ngOnInit(){const description='Explore software platforms, business websites, AI initiatives, design concepts, and digital experiences created by Llenroc Tech.';this.title.setTitle('Portfolio | Llenroc Tech');[['description',description],['og:title','Portfolio | Llenroc Tech'],['og:description',description],['og:url','https://llenroctech.com/portfolio'],['og:type','website'],['twitter:card','summary_large_image']].forEach(([name,content])=>this.meta.updateTag(name.startsWith('og:')?{property:name,content}:{name,content}));this.canonical=this.document.createElement('link');this.canonical.rel='canonical';this.canonical.href='https://llenroctech.com/portfolio';this.document.head.appendChild(this.canonical);this.schema=this.document.createElement('script');this.schema.type='application/ld+json';this.schema.text=JSON.stringify({'@context':'https://schema.org','@type':'CollectionPage',name:'Llenroc Tech Portfolio',url:'https://llenroctech.com/portfolio',isPartOf:{'@type':'WebSite',name:'Llenroc Tech',url:'https://llenroctech.com/'},breadcrumb:{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:'https://llenroctech.com/'},{'@type':'ListItem',position:2,name:'Portfolio',item:'https://llenroctech.com/portfolio'}]}});this.document.head.appendChild(this.schema);}
  ngOnDestroy(){this.canonical?.remove();this.schema?.remove();this.meta.removeTag("property='og:title'");this.meta.removeTag("property='og:description'");this.meta.removeTag("property='og:url'");this.meta.removeTag("property='og:type'");}
}
