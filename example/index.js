const express = require('express');
const swig = require('swig');
const criticalCss = require('../dist/index').default;
const PORT = 3000;
const app = express();

swig.setDefaults({ cache: false });

app.engine('swig', swig.renderFile);
app.set('views', `${ __dirname}/client/templates`);
app.set('view cache', false);
app.set('view engine', 'swig');

app.use(express.static(`${ __dirname}/client/public`));

app.use(criticalCss({
  override: true,
  cssFilePath: `${ __dirname}/client/public/css/style.css`
}));

app.get('/', (req, res) => {
  res.render('index');
});

app.listen(PORT, () => {
  console.log(`CriticalCSS Test listen on port ${PORT}`);
});
