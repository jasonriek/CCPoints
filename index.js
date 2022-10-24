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

app.get('/participants/search', (req, res) => {
    db.searchParticipants(req, res);
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
    db.getParticipantsByNameDesc(req, res);
});

app.get('/participants_name_asc', (req, res) => {
    db.getParticipantsByNameAsc(req, res);
});

// PHONE_NUMBER SORT
// #############################################################
app.get('/participants_phone_number_desc', (req, res) => {
    db.getParticipantsByPhoneNumberDesc(req, res);
});

app.get('/participants_phone_number_asc', (req, res) => {
    db.getParticipantsByPhoneNumberAsc(req, res);
});

// POINTS SORT
// #############################################################
app.get('/participants_points_desc', (req, res) => {
    db.getParticipantsByPointsDesc(req, res);
});

app.get('/participants_points_asc', (req, res) => {
    db.getParticipantsByPointsAsc(req, res);
});
// #############################################################

// POINTS
app.get('/points/:PHONE_NUMBER', (req, res) => {
    db.pointsForm(req, res);
});

// Add Points
app.get('/add_points/:PHONE_NUMBER', (req, res) => {
    db.handlePointsForm(db.POINTS_TABLE, req, res);
});

app.post('/add_points/:PHONE_NUMBER', (req, res) => {
    db.handlePoints(db.POINTS_TABLE, req, res);
});

// Redeem Points 
app.get('/redeem_points/:PHONE_NUMBER', (req, res) => {
    db.handlePointsForm(db.REDEMPTIONS_TABLE, req, res);
});

app.post('/redeem_points/:PHONE_NUMBER', (req, res) => {
    db.handlePoints(db.REDEMPTIONS_TABLE, req, res);
});

// Update Point Entry Form
app.get('/edit_point_entry/:NAME/:id', (req, res) => {
    db.updatePointsForm(db.POINTS_TABLE, req, res);
});

// Update Point Entry
app.post('/edit_point_entry/:id', (req, res) => {
    db.updatePointsByID(db.POINTS_TABLE, req, res);
});

// Update Redeemed Entry Form
app.get('/edit_redeemed_entry/:NAME/:id', (req, res) => {
    db.updatePointsForm(db.REDEMPTIONS_TABLE, req, res);
});

// Update Redeemed Entry 
app.post('/edit_redeemed_entry/:id', (req, res) => {
    db.updatePointsByID(db.REDEMPTIONS_TABLE, req, res);
});

// Remove Point Entry Form
app.get('/remove_point_entry/:NAME/:id', (req, res) => {
    db.removePointsForm(db.POINTS_TABLE, req, res);
});

// Remove Point Entry 
app.post('/remove_point_entry/:id', (req, res) => {
    db.removePointsByID(db.POINTS_TABLE, req, res);
});

// Remove Redeemed Entry Form
app.get('/remove_redeemed_entry/:NAME/:id', (req, res) => {
    db.removePointsForm(db.REDEMPTIONS_TABLE, req, res);
});

// Remove Redeemed Entry 
app.post('/remove_redeemed_entry/:id', (req, res) => {
    db.removePointsByID(db.REDEMPTIONS_TABLE, req, res);
});


app.listen(port, () => {
    console.log(`App listening at 192.168.0.13 on port ${port}`);
});