import critical from 'critical';

function expressCriticalCSS({
  override = true,
  base = '',
  width = 1300,
  height = 900,
  minify = true
} = {}) {

  function crticalCSS(req, res, next) {
    const renderCallback = callback => {
      if (typeof callback === 'undefined') {
        return (err, html) => {
          if (err) {
            return next(err);
          }
          critical.generate({
            base,
            html,
            width,
            height,
            minify
          }, function(err, output) {
            const style = `<style>${output}</style>`;
            res.send(html.replace(/(<head>.?)/g,`$1${style}`));
          });
        };
      } else {
        return (err, html) => {
          if (html) {
            critical.generate({
              base,
              html,
              width,
              height
            }, function(err, output) {
              const style = `<style>${output}</style>`;
              res.send(html.replace(/(<head>.?)/g,`$1${style}`));
            });
          }
        };
      }
    };

    if (override === false) {
      res.renderCritical = function(view, renderOpts, callback) {
        this.render(view, renderOpts, renderCallback(callback));
      };
    } else {
      res.oldRender = res.render;
      res.render = function(view, renderOpts, callback) {
        this.oldRender(view, renderOpts, renderCallback(callback));
      };
    }

    return next();
  }

  return (crticalCSS);
}

export default expressCriticalCSS;
