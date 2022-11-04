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
    res.redirect('participants/1');
});

app.get('/participants', (req, res) => {
    switch(req.originalUrl)
    {
        case '/participants':
            res.redirect('participants/1');
            break;
        case '/participants/':
            res.redirect('1');
            break;
    }
});

app.get('/participants/:page_number', (req, res) => {
    let page_number = parseInt(req.params.page_number);
    db.getParticipants(res, page_number);
});

app.get('/participants/search/:page_number', (req, res) => {
    let page_number = parseInt(req.params.page_number);
    db.searchParticipants(req, res, page_number);
});

// Add participant
app.get('/add_participant', (req, res) => {
    db.addParticipantForm(req, res);
});

app.post('/add_participant', (req, res) => {
    db.addParticipant(req, res);
});

// edit participant
app.get('/edit_participant/:PHONE_NUMBER/:page_number', (req, res) => {
    db.editParticipantForm(req, res);
});

app.post('/edit_participant/:PHONE_NUMBER/:NAME/:EMAIL', (req, res) => {
    db.editParticipantByPhoneNumber(req, res);
});

// remove participant
app.get('/remove_participant/:PHONE_NUMBER/:page_number', (req, res) => {
    db.removeParticipantForm(req, res);
});

app.post('/remove_participant', (req, res) => {
    db.removeParticipantByPhoneNumber(req, res);
});

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

/*
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
*/

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