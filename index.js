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

/* ### ### ### SORTING ### ### ### */

// NAME SORT
// #############################################################
app.get('/participants_name_desc', (req, res) => {
    db.getParticipantsByNameDesc(res);
});

app.post('/participants_name_desc', (req, res) => {
    db.getParticipantsByNameDesc(res);
});

app.get('/participants_name_asc', (req, res) => {
    db.getParticipantsByNameAsc(res);
});

app.post('/participants_name_asc', (req, res) => {
    db.getParticipantsByNameAsc(res);
});

// PHONE_NUMBER SORT
// #############################################################
app.get('/participants_phone_number_desc', (req, res) => {
    db.getParticipantsByPhoneNumberDesc(res);
});

app.post('/participants_phone_number_desc', (req, res) => {
    db.getParticipantsByPhoneNumberDesc(res);
});

app.get('/participants_phone_number_asc', (req, res) => {
    db.getParticipantsByPhoneNumberAsc(res);
});

app.post('/participants_phone_number_asc', (req, res) => {
    db.getParticipantsByPhoneNumberAsc(res);
});

// EMAIL SORT
// #############################################################
app.get('/participants_email_desc', (req, res) => {
    db.getParticipantsByEmailDesc(res);
});

app.post('/participants_email_desc', (req, res) => {
    db.getParticipantsByEmailDesc(res);
});

app.get('/participants_email_asc', (req, res) => {
    db.getParticipantsByEmailAsc(res);
});

app.post('/participants_email_asc', (req, res) => {
    db.getParticipantsByEmailAsc(res);
});

// POINTS SORT
// #############################################################
app.get('/participants_points_desc', (req, res) => {
    db.getParticipantsByPointsDesc(res);
});

app.post('/participants_points_desc', (req, res) => {
    db.getParticipantsByPointsDesc(res);
});

app.get('/participants_points_asc', (req, res) => {
    db.getParticipantsByPointsAsc(res);
});

app.post('/participants_points_asc', (req, res) => {
    db.getParticipantsByPointsAsc(res);
});
// #############################################################


app.listen(port, () => {
    console.log(`App listening at 192.168.0.13 on port ${port}`);
});