const express = require('express');
const bodyParser = require('body-parser');
const db = require('./services/db');
const app = express();
const port = 3001;

/* Setup App */
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended: false })); // <--- middleware configuration
app.use(bodyParser.json());
db.createTables(db.table_creation_SQL);


app.get('/', (req, res) => {
    res.redirect('participants');
});

app.get('/participants', (req, res) => {
    db.getParticipants(res);
});

// Add participant
app.get('/add_participant', (req, res) => {
    db.addParticipantForm(req, res);
});

app.post('/add_participant', (req, res) => {
    db.addParticipant(req, res);
});

// edit participant
app.get('/edit_participant/:PHONE_NUMBER', (req, res) => {
    db.editParticipantForm(req, res);
});

app.post('/edit_participant', (req, res) => {
    db.editParticipantByPhoneNumber(req, res);
});

// remove participant
app.get('/remove_participant/:PHONE_NUMBER', (req, res) => {
    db.removeParticipantForm(req, res);
});

app.post('/remove_participant', (req, res) => {
    db.removeParticipantByPhoneNumber(req, res);
});

app.listen(port, () => {
    console.log(`App listening at 192.168.0.13 on port ${port}`);
});