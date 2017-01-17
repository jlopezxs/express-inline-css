const express = require('express');
const swig = require('swig');
const criticalCss = require('../lib/index').default;
const PORT = 3000;
const app = express();

swig.setDefaults({ cache: false });

app.engine('swig', swig.renderFile);
app.set('views', './client/templates');
app.set('view cache', false);
app.set('view engine', 'swig');

app.use(express.static('client/public'));

app.use(criticalCss({
  override: true,
  cssFile: '../example/client/public/css/style.css'
}));

app.get('/', (req, res) => {
  res.render('index');
});

app.listen(PORT, () => {
  console.log(`CriticalCSS Test listen on port ${PORT}`);
});
