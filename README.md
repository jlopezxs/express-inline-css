# express-inline-css
> :zap: Express middleware to generate inline critical rendering CSS to improve render performance

## Installation

```sh
npm install --save express-inline-css
```

## Preview
```js

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

## Usage

inlineCSS({ cssFilePath, [override] });
<!-- {.font-large} -->
where:

- `cssFilePath`: Path of the final css file where rules are taken out.
- `override` (optional): It brings you the possibility to override the method render or use renderInlineCSS.

## License

MIT © [Jordi López](http://jlopezxs.github.io)
