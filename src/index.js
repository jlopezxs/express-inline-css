import flatten from 'lodash.flatten';
import uniq from 'lodash.uniq';
import fs from 'fs';

const RE_CLASS = /class="([^"]*)"/gi
const DEFAULT_SELECTORS = ['html', 'body', 'h1', 'h2', 'h3']

let cache = {}

function expressCriticalCSS ({
  override = true,
  cssFilePath
} = {}) {
  function _getClassSelectors ({ content = '' }) {
    let result = []
    let matches
    while (matches) {
      result.push(matches[1].split(' '))
      matches = RE_CLASS.exec(content)
    }
    return uniq(flatten(result)).map(className => `.${className}`).concat(DEFAULT_SELECTORS)
  }

  function _getStylesheet () {
    return new Promise((resolve, reject) => {
      fs.readFile(cssFilePath, 'utf8', (err, file) => {
        if (err) {
          return reject(err)
        }
        return resolve(file)
      })
    })
  }

  function _extractCss ({ stylesheet = '', selectors = [] }) {
    let styles = stylesheet.split('}')
    let styleRules = []
    styles.forEach(style => {
      style += '}'
      style = style.replace(/\r\n|\n|\r|\s\s+/gm, ' ')
      selectors.forEach(selector => {
        if (!style.includes('@media') && style.includes(selector)) {
          styleRules.push(style)
        }
      })
    })
    return styleRules
  }

  function crticalCSS (req, res, next) {
    const renderCallback = callback => {
      return (err, html) => {
        if (err) {
          return next(err)
        }
        const classSelectors = _getClassSelectors({ content: html })
        const cacheKey = classSelectors.join('')

        if (cache[cacheKey] || !cssFilePath) {
          if (!cssFilePath) {
            throw new Error('express-inline-css: cssFilePath is required')
          }
          res.send(html.replace(/(<\/head>)/i, `${cache[cacheKey] || ''}$1`))
        } else {
          _getStylesheet().then(stylesheet => {
            const cssRules = _extractCss({ stylesheet, selectors: classSelectors
            }).join('')
            const style = `<style>${cssRules}</style>`
            cache[cacheKey] = style
            res.send(html.replace(/(<\/head>)/i, `${style}$1`))
          }).catch(err => {
            return next(err)
          })
        }
      }
    }

    if (override === false) {
      res.renderInlineCSS = function (view, renderOpts, callback) {
        this.render(view, renderOpts, renderCallback(callback))
      }
    } else {
      res.oldRenderMethod = res.render
      res.render = function (view, renderOpts, callback) {
        this.oldRenderMethod(view, renderOpts, renderCallback(callback))
      }
    }

    return next()
  }

  return (crticalCSS)
}

export default expressCriticalCSS;