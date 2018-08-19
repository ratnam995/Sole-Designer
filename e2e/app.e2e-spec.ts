import { SoleDesignerPage } from './app.po';

describe('sole-designer App', () => {
  let page: SoleDesignerPage;

  beforeEach(() => {
    page = new SoleDesignerPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
