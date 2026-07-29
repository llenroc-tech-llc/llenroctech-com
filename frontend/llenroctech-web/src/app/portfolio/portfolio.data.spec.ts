import { PORTFOLIO_PROJECTS } from './portfolio.data';

describe('portfolio content',()=>{
  it('keeps verified live URLs centralized',()=>{expect(PORTFOLIO_PROJECTS.find(x=>x.id==='robot-mower')?.liveUrl).toBe('https://robot.llenroctech.com/');expect(PORTFOLIO_PROJECTS.find(x=>x.id==='push-up-sit-up-365')?.liveUrl).toBe('https://pu-su-365.com/');expect(PORTFOLIO_PROJECTS.find(x=>x.id==='reddick-foundation')?.liveUrl).toBe('https://thereddickfoundation.com/');});
  it('links CustomerConnect to its live website',()=>{const project=PORTFOLIO_PROJECTS.find(x=>x.id==='customerconnect');expect(project?.title).toBe('CustomerConnect');expect(project?.status).toBe('Live');expect(project?.liveUrl).toBe('https://customerconnect.llenroctech.com/');});
  it('keeps design concepts supported by repository images',()=>{expect(PORTFOLIO_PROJECTS.filter(x=>x.section==='templates').every(x=>x.image&&x.status==='Design Concept')).toBeTrue();});
  it('keeps marketplace content out of owned project data',()=>{expect(PORTFOLIO_PROJECTS.some(x=>x.title.includes('ThemeForest')||x.title.includes('Envato'))).toBeFalse();});
});
