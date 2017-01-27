# express-inline-css
> :zap: Express middleware to generate inline critical rendering CSS to improve render performance

## Installation

```sh
npm install --save express-inline-css
```

## Preview
```js
// Overriding the render method

import express from 'express';
import inlineCSS from 'express-inline-css';

const app = express();

app.use(inlineCSS({
  override: true,
  cssFilePath: '../client/public/css/style.css'
}));

app.get('/', (req, res) => {
  res.render('index', {});
});

```

```js
// Using renderInlineCSS method

import express from 'express';
import inlineCSS from 'express-inline-css';

const app = express();

app.use(inlineCSS({
  override: false,
  cssFilePath: '../client/public/css/style.css'
}));

app.get('/', (req, res) => {
  res.renderInlineCSS('index', {});
});

```

## Usage

inlineCSS({ cssFilePath, [override] });
<!-- {.font-large} -->
where:

- `cssFilePath`: Path of the final css file where rules are taken out.
- `override` (optional): It brings you the possibility to override the method render or use renderInlineCSS method.

## License

MIT © [Jordi López](http://jlopezxs.github.io)
