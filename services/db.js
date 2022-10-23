const sqlite3 = require("sqlite3").verbose();
const path = require('path');
const moment = require('moment');
const utils = require('./utils');
const db_path = path.join(__dirname, 'ccp.db')
const PARTICIPANTS_TABLE = 'PARTICIPANTS';
const POINTS_TABLE = 'CC_POINTS';
const REDEMPTIONS_TABLE = 'REDEMPTIONS';

function directToCorrectPointsPage(table_name)
{
    switch(table_name)
    {
        case POINTS_TABLE:
            return 'points';
        case REDEMPTIONS_TABLE:
            return 'redemptions';
    }
    return '';
}

// Creates a new SQLite3 "ccp.db" file
const db = new sqlite3.Database(db_path, err => {
    if(err) {
        return console.log(err.message);
    }
    console.log('Successful connection to the database "ccp.db"');
});

// Participants TABLE SQL
const create_Participants_table_SQL = `CREATE TABLE IF NOT EXISTS ${PARTICIPANTS_TABLE} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    NAME TEXT NOT NULL UNIQUE,
    PHONE_NUMBER INTEGER NOT NULL UNIQUE,
    EMAIL TEXT,
    POINTS REAL NOT NULL,
    ACTIVE INTEGER NOT NULL,
    DATE_CREATED DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);`;

// POINTS TABLE SQL
const create_points_table_SQL = `CREATE TABLE IF NOT EXISTS ${POINTS_TABLE} (
    id INTEGER PRIMARY KEY,
    POINTS REAL NOT NULL UNIQUE,
    TIME_ENTERED DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PHONE_NUMBER INTEGER NOT NULL,
    FOREIGN KEY (PHONE_NUMBER)
        REFERENCES ${PARTICIPANTS_TABLE} (PHONE_NUMBER)
);`;

// REDEMPTIONS TABLE
const create_redemptions_table_SQL = `CREATE TABLE IF NOT EXISTS ${REDEMPTIONS_TABLE} (
    id INTEGER PRIMARY KEY,
    REDEEMED_POINTS REAL NOT NULL UNIQUE,
    TIME_ENTERED DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PHONE_NUMBER INTEGER NOT NULL,
    FOREIGN KEY (PHONE_NUMBER)
        REFERENCES ${PARTICIPANTS_TABLE} (PHONE_NUMBER)
);`;

// JS object that contains all the table creation SQL
const table_creation_SQL = {
    PARTICIPANTS_TABLE: create_Participants_table_SQL,
    POINTS_TABLE: create_points_table_SQL,
    REDEMPTIONS_TABLE: create_redemptions_table_SQL
}

// Creates a single SQLite table
function createTable(table_name, sql) {
    db.run(sql, err => {
        if(err) {
            return console.log(err.message);
        }
        console.log(`Successful creation of "${table_name}" table!`)
        
    });
}

// Calls all of the table creation SQL
function createTables(tables) {
    for (const [table_name, sql] of Object.entries(tables)) {
        createTable(table_name, sql);
    }
}

// Insert a new participant into the system
function insertParticipant(name, phone_number, email, points) {
    db.run(`INSERT INTO ${PARTICIPANTS_TABLE} (NAME, PHONE_NUMBER, EMAIL, POINTS, ACTIVE) 
            VALUES (?,?,?,?, ?);`, [name, phone_number, email, points, 1], function(err){
                if(err)
                {
                    console.log(err.message);
                }
    });
}

// Get all of the active participants
function getParticipants(res) {
    const sql = `SELECT * FROM ${PARTICIPANTS_TABLE} WHERE ACTIVE = 1 ORDER BY NAME`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return console.log(err.message);
        }
        res.render('participants', {model: rows, search: false, n_sort_id: "desc", pn_sort_id: "desc", p_sort_id: "desc"});
    });
}

// Create an ordered render for particpants
function participantOrderRender(res, rows, order, order_by)
{
    let order_id = utils.inverseSortOrder(order.toLowerCase());
    let n_sort_id = "desc";
    let pn_sort_id = "desc";
    let p_sort_id = "desc";

    switch(order_by)
    {
        case "NAME":
            n_sort_id = order_id;
            break;
        case "PHONE_NUMBER":
            pn_sort_id = order_id;
            break;
        case "POINTS":
            p_sort_id = order_id;
            break;
    }
    res.render('participants', {model: rows, search: false, n_sort_id: n_sort_id,  pn_sort_id: pn_sort_id, p_sort_id: p_sort_id});
}

// Get the participants by some kind of order
function getParticipantsByOrder(res, order_by, desc=true)
{
    let order = 'ASC';
    if(desc)
        order = 'DESC';
    let sql = `SELECT * FROM ${PARTICIPANTS_TABLE} WHERE ACTIVE = 1 ORDER BY ${order_by} ${order}`;
    db.all(sql, [], (err, rows) => {
        if (err) {
                return console.log(err.message);
        }
        participantOrderRender(res, rows, formatted_date, order, order_by);
    });
}

// Get all of the active participants in descending order by player name
function getParticipantsByNameDesc(res) {
    getParticipantsByOrder(res, "NAME", true);
}

// Get all of the active participants in asscending order by player name
function getParticipantsByPlayerNameAsc(res) {
    getParticipantsByOrder(res, "NAME", false);
}

// Get all of the active participants in descending order by player id
function getParticipantsByPhoneNumberDesc(res) {
    getParticipantsByOrder(res, "PHONE_NUMBER", true);
}

// Get all of the active participants in ascending order by player id
function getParticipantsByPhoneNumberAsc(res) {
    getParticipantsByOrder(res, "PHONE_NUMBER", false);
}

// Get all of the active participants in descending order by count
function getParticipantsByPointsDesc(res) {
    getParticipantsByOrder(res, "POINTS", true);
}

// Get all of the active participants in ascending order by count
function getParticipantsByPointsAsc(res) {
    getParticipantsByOrder(res, "POINTS", false);
}

// Search Participants
function searchParticipants(req, res)
{
    let participant = utils.strip(req.body.search);
    let sql = `SELECT * FROM ${PARTICIPANTS_TABLE} WHERE (INSTR(LOWER(NAME), LOWER(?)) > 0 OR INSTR(PHONE_NUMBER, ?) > 0) AND ACTIVE = 1;`;
    // OR INSTR(PHONE_NUMBER, "?") > 0;
    if(participant.length)
    {
        db.all(sql, [participant, participant], (err, rows) => {
            if(err) {
                return console.log(err.message);
            }
            res.render('participants', {model: rows, search: true, n_sort_id: "desc", pn_sort_id: "desc", p_sort_id: "desc"});
        });
    }
    else
        getParticipants(res);

}

// Return the data of a participant by using their phone number
function getParticipantByPhoneNumber(req, res) {
    const phone_number = req.params.PHONE_NUMBER;
    const sql = `SELECT * FROM ${PARTICIPANTS_TABLE} WHERE PHONE_NUMBER = ?`;
    db.get(sql, phone_number, (err, row) => {
        if(err) {
            return console.log(err.message);
        }
        res.render('edit', {model: row});
    });
}

function updatePhoneNumber(table_name, old_phone_number, new_phone_number)
{
    const sql = `UPDATE ${table_name} SET PHONE_NUMBER = ? WHERE PHONE_NUMBER = ?`;
    const PHONE_NUMBERs = [new_phone_number, old_phone_number]
    db.run(sql, PHONE_NUMBERs, err => {
        if(err)
            console.log(err.message);
    });
}

// Add a new participant form
function addParticipantForm(req, res) {
    const sql = `SELECT * FROM ${PARTICIPANTS_TABLE} ORDER BY NAME`;
    db.get(sql, [], (err, model) => {
        if(err) {
            console.log(err.message);
        }
        res.render('add_participant', {model: model});
    });
}

// Add new participant
function addParticipant(req, res) {
    const name = req.body.NAME.toUpperCase();
    const phone_number = req.body.PHONE_NUMBER;
    const points = req.body.POINTS;
    const email = req.body.EMAIL;
    const sql = `SELECT NAME FROM ${PARTICIPANTS_TABLE} WHERE NAME = ? OR PHONE_NUMBER = ?`;
    db.get(sql, [name, phone_number], (err, row) => {
        if(err) {
            console.log(err.message);
        }
        if(row && row.NAME) {
            setParticipantToActive(phone_number);
        }
        else {
            insertParticipant(name, phone_number, email, points);
        }
        insertPoints(POINTS_TABLE, points, phone_number);
        res.redirect('/participants');
    });
}

// Edit participant form
function editParticipantForm(req, res) {
    const sql = `SELECT * FROM ${PARTICIPANTS_TABLE} ORDER BY NAME`;
    db.get(sql, [], (err, model) => {
        if(err) {
            console.log(err.message);
        }
        res.render('edit_participant', {model: model});
    });
}

// Update the data of a participant by usering their phone number
function editParticipantByPhoneNumber(req, res) {
    let sql = `SELECT * FROM ${PARTICIPANTS_TABLE} WHERE PHONE_NUMBER = ?`;
    let phone_number = req.params.PHONE_NUMBER;
    let old_phone_number = null;
    let new_phone_number = req.body.PHONE_NUMBER;
    let points = req.body.POINTS;
    db.get(sql, phone_number, (err, row) => 
    {
        if(err)
        {
            console.log(err.message);
        }
        if(row)
            old_phone_number = row.PHONE_NUMBER;
        if(old_phone_number)
        {
            sql = `UPDATE ${PARTICIPANTS_TABLE} SET NAME = ?, PHONE_NUMBER = ?, POINTS = ? WHERE PHONE_NUMBER = ?`;
            db.run(sql, [req.body.PLAYER_NAME, new_phone_number, points, old_phone_number], err => 
            {
                if (err) 
                {
                    return console.log(err.message);
                }
                res.redirect('/participants');
            });
        }
        res.redirect('/participants');
    });
}

function setParticipantToActive(phone_number)
{
    const sql = `UPDATE ${PARTICIPANTS_TABLE} SET ACTIVE = 1 WHERE PHONE_NUMBER = ?`;
    db.run(sql, phone_number, err => {
        if(err){
            console.log(err.message);
        }
    });
}


// Remove a participant form
function removeParticipantForm(req, res) {
    const phone_number = req.params.PHONE_NUMBER;
    const sql = `SELECT * FROM ${PARTICIPANTS_TABLE} WHERE PHONE_NUMBER = ?`;
    db.get(sql, phone_number, (err, row) => {
        if(err) {
            return console.log(err.message);
        }
        console.log(phone_number);
        res.render('remove_participant', {model: row});
    });
}

// Remove a participant by phone number
function removeParticipantByPhoneNumber(req, res) {
    const phone_number = req.body.PHONE_NUMBER;
    // Remove all of the points from the points table
    let sql = `DELETE FROM ${POINTS_TABLE} WHERE PHONE_NUMBER = ?`;
    db.run(sql, phone_number, err => {
        if(err) {
            return console.log(err.message);
        }
        // Remove all of the points from the redemptions table
        sql = `DELETE FROM ${REDEMPTIONS_TABLE} WHERE PHONE_NUMBER = ?`;
        db.run(sql, phone_number, err => {
            if(err) {
                return console.log(err.message);
            }
            sql = `DELETE FROM ${PARTICIPANTS_TABLE} WHERE PHONE_NUMBER = ?`;
            db.run(sql, phone_number, err => {
                if(err) {
                    return console.log(err.message);
                }
                res.redirect('/participants');
            });
        });
    });
}

// POINTS //
// Get points by player phone number

// Insert a new points for a player
function insertPoints(table_name, points, phone_number) {
    const current_time = new Date();
    db.run(`INSERT INTO ${table_name} (POINTS, PHONE_NUMBER, TIME_ENTERED) 
    VALUES (?,?,?);`, [points, phone_number, current_time], function(err){
        if(err) {
            return console.log(err.message);
        }
    });
}

function getPoints(table_name, phone_number)
{
    let points = 0;
    const sql = `SELECT POINTS FROM ${table_name} WHERE PHONE_NUMBER = ?`
    db.all(sql, phone_number, (err, rows) => {
        if(err) {
            console.log(err.message);
        }
        rows.forEach(row => {points += row.POINTS});
    });
    return points;
}

function updatPointsEntry(table_name, points, id)
{
    const sql = `UPDATE ${table_name} SET POINTS = ? WHERE id = ?`;
    db.run(sql, [points, id], err => {
        if(err) {
            console.log(err.message);
        }
    });
}

function updateParticipantPoints(phone_number)
{
    let points = getPoints(POINTS_TABLE, phone_number);
    let redemption_points = getPoints(REDEMPTIONS_TABLE, phone_number);
    let total_points = points - redemption_points;
    const sql = `UPDATE ${PARTICIPANTS_TABLE} SET POINTS = ? WHERE PHONE_NUMBER = ?`;
    db.run(sql, [total_points, phone_number], err => {
        if(err) {
            console.log(err.message);
        }
    });
}

/*
function getWheelSpinsByPhoneNumber(req, res) {
    const id = req.params.PHONE_NUMBER;
    const sql = `SELECT WHEEL_SPINS.id, WHEEL_SPINS.WHEEL_SPIN_NUMBER, WHEEL_SPINS.TIME_ENTERED, Participants.PLAYER_NAME, Participants.PHONE_NUMBER 
    FROM WHEEL_SPINS
    JOIN Participants ON WHEEL_SPINS.PHONE_NUMBER = Participants.PHONE_NUMBER
    WHERE WHEEL_SPINS.PHONE_NUMBER = ?`;
    db.all(sql, id, (err, row) => {
        if(err) {
            return console.log(err.message);
        }
        res.render('wheel_spins', {model: row, moment: moment});
    });
}
*/

// Handles points for the main points form and the redeem points form
function handlePointsForm(table_name, req, res) 
{
    const phone_number = req.params.PHONE_NUMBER;
    let page_type = 'points';
    if(table_name === REDEMPTIONS_TABLE)
        page_type = 'redemptions';
    let sql = `SELECT * FROM ${PARTICIPANTS_TABLE} WHERE PHONE_NUMBER = ?`;
    db.get(sql, phone_number, (err, row_1) => 
    {
        if(err) 
        {
            return console.log(err.message);
        }
        sql = `SELECT * FROM ${table_name} WHERE PHONE_NUMBER = ?`;
        db.all(sql, phone_number, (err, row_2) => 
        {
            if(err) 
            {
                return console.log(err.message);
            }
            res.render('handle_points', {model: row_1, page: page_type});
        });
    });
}

// Add or redeem points
function handlePoints(table_name, req, res) {
    const phone_number = req.body.PHONE_NUMBER;
    const points = req.body.POINTS;
    insertPoints(table_name, points, phone_number);
    updateParticipantPoints(phone_number);
    res.redirect(`/${directToCorrectPointsPage(table_name)}/${phone_number}`);  
}

// Update points or redemptions, form
function updatePointsForm(table_name, req, res)
{
    const id = req.params.id;
    const sql = `SELECT id, POINTS, PHONE_NUMBER, TIME_ENTERED FROM ${table_name} WHERE id = ?`;
    db.get(sql, id, (err, row) => {
        if(err) {
            return console.log(err.message);
        }
        res.render('handle_points', {model: row, moment: moment});
    });
}

// Update points
function updatePointsByID(table_name, req, res) 
{
    const id = req.params.id;
    const points = req.body.POINTS;
    const phone_number = req.body.PHONE_NUMBER;
    const sql = `UPDATE ${table_name} SET POINTS = ? WHERE id = ?`;
    db.run(sql, [points, id], err =>
    {
        if (err)
        {
            return console.log(err.message);
        }
        res.redirect(`/${directToCorrectPointsPage(table_name)}/${phone_number}`);
    });
}

// Remove points form
function deletePointsForm(table_name, req, res) {
    const id = req.params.id;
    let sql = `SELECT * FROM ${table_name} WHERE id = ?`;
    db.get(sql, id, (err, row_1) => {
        if(err) {
            return console.log(err.message);
        }
        sql = `SELECT * FROM ${table_name} WHERE PHONE_NUMBER = ?`;
        db.all(sql, row_1.PHONE_NUMBER, (err, row_2) => {
        if(err) {
            return console.log(err.message);
        }
        console.log(`count: ${row_2.length}`);
        res.render('remove_points', {model: row_1, count: row_2.length, moment: moment});
        });
    });
}

// Remove points
function removePoints(table_name, req, res) {
    const id = req.params.id;
    const phone_number = req.body.PHONE_NUMBER;
    const total = parseInt(req.body.TOTAL);
    if(total > 1)
    {
        const sql = `DELETE FROM ${table_name} WHERE id = ?`;
        db.run(sql, id, err => {
            if(err) {
                return console.log(err.message);
            }
            updateParticipantPoints(phone_number);
            res.redirect(`/${directToCorrectPointsPage(table_name)}/${phone_number}`);
        });
    }
    else
    {
        res.render('message', {
            message: {
            title: "Error: Cannot Delete", 
            content: "Participant must have at least one points entry.",
            link: `/${directToCorrectPointsPage(table_name)}/${phone_number}`
        }});
    }
}



function setActivationForParticipants(active)
{
    let sql = `UPDATE ${PARTICIPANTS_TABLE} SET ACTIVE = ?;`;
    db.run(sql, active, err => {
        if (err) {
            return console.log(err.message);
        }
    });
}

// Activate all Participants
function activateParticipants()
{
    setActivationForParticipants(1);
}

// Deactivate all Participants
function deactivateParticipants()
{
    setActivationForParticipants(0);
    sql = `UPDATE Participants SET POINTS = 1`;
    db.run(sql, [], err => {
        if (err) {
            return console.log(err.message);
        }
    });
}

module.exports = {
    table_creation_SQL,
    createTable,
    createTables,
    getParticipants,
    addParticipantForm,
    addParticipant,
    editParticipantForm,
    editParticipantByPhoneNumber,
    removeParticipantForm,
    removeParticipantByPhoneNumber,
}