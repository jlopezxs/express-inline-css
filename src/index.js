import { uniq, flatten } from 'lodash';
import fs from 'fs';

const RE_CLASS = /class="([^"]*)"/gi;
const DEFAULT_SELECTORS = ['html', 'body', 'h1', 'h2', 'h3'];

let memory = {};

function expressCriticalCSS({
  override = true,
  cssFile
} = {}) {

  const getClassSelectors = function({ content = '' }) {
    let result = [];
    let matches;
    while (matches = RE_CLASS.exec(content)) {
      result.push(matches[1].split(' '));
    }
    return uniq(flatten(result)).map(className => `.${className}`).concat(DEFAULT_SELECTORS);
  };

  const getStylesheet = function() {
    return new Promise((resolve, reject) => {
      fs.readFile(cssFile, 'utf8', (err, file) => {
        if (err) {
          return reject(err);
        }
        return resolve(file);
      });
    });
  };

  const extractCss = function({ stylesheet = '', selectors = []}) {
    let styles = stylesheet.split('}');
    let styleRules = [];
    styles.forEach(style => {
      style += '}';
      style = style.replace(/\r\n|\n|\r|\s\s+/gm, ' ');
      selectors.forEach(selector => {
        if (style.indexOf('@media') === -1 && style.indexOf(selector) !== -1) {
          styleRules.push(style);
        }
      });
    });
    return styleRules;
  };

  function crticalCSS(req, res, next) {
    const renderCallback = callback => {
      return (err, html) => {
        if (err) {
          return next(err);
        }
        const classSelectors = getClassSelectors({ content: html });
        const memoryKey = classSelectors.join('');

        if (memory[memoryKey] || !cssFile) {
          if(!cssFile) {
            console.warning('express-inline-css: cssFile is required');
          }
          res.send(html.replace(/(<head>.?)/g, `$1${memory[memoryKey] || ''}`));
        } else {
          getStylesheet().then(stylesheet => {
            const cssRules = extractCss({ stylesheet, selectors: classSelectors
            }).join('');
            const style = `<style>${cssRules}</style>`;
            memory[memoryKey] = style;
            res.send(html.replace(/(<head>.?)/g, `$1${style}`));
          }).catch(err => {
            return next(err);
          });
        }
      };
    };

    if (override === false) {
      res.renderInlineCSS = function(view, renderOpts, callback) {
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
