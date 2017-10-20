import inlineCSS from '../index';

describe('inlineCSS', () => {
  describe('when you want override render method', () => {
    it('should be have render method', (done) => {
      let req = {};
      let res = {};

      const next = (err) => {
        expect(res).toHaveProperty('render');
        done();
      };

      inlineCSS({
        override: true,
        cssFilePath: '../client/public/css/style.css'
      })(req, res, next);
    });
  });

  describe('when you do NOT want override render method', () => {
    it('should be have renderInlineCSS method', (done) => {
      let req = {};
      let res = {};

      const next = (err) => {
        expect(res).toHaveProperty('renderInlineCSS');
        done();
      };

      inlineCSS({
        override: false,
        cssFilePath: '../client/public/css/style.css'
      })(req, res, next);
    });
  });
});
