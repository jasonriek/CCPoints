const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();
const port = 3001;

/* Setup App */
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(port, () => {
    console.log(`App listening at 192.168.0.13 on port ${port}`);
});