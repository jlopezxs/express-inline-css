'use strict'
const flatten = require('lodash.flatten')
const uniq = require('lodash.uniq')
const fs = require('fs')

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
        if (style.indexOf('@media') === -1 && style.indexOf(selector) !== -1) {
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
            console.warning('express-inline-css: cssFilePath is required')
          }
          res.send(html.replace(/(<head>.?)/g, `$1${cache[cacheKey] || ''}`))
        } else {
          _getStylesheet().then(stylesheet => {
            const cssRules = _extractCss({ stylesheet, selectors: classSelectors
            }).join('')
            const style = `<style>${cssRules}</style>`
            cache[cacheKey] = style
            res.send(html.replace(/(<head>.?)/g, `$1${style}`))
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

module.exports = expressCriticalCSS
