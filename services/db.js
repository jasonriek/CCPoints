const path = require('path');
const { format } = require('date-fns-tz');
const { parseISO } = require('date-fns');
const utils = require('./utils');
const db_path = path.join(__dirname, 'ccp.db')
const PARTICIPANTS_TABLE = 'PARTICIPANTS';
const POINTS_TABLE = 'CC_POINTS';
const REDEMPTIONS_TABLE = 'REDEMPTIONS';
const Database = require('better-sqlite3');
const database = new Database(db_path, { verbose: console.log });

// $$$ GLOBALS $$$
// let point_changes_global = false;

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

// Participants TABLE SQL
const create_Participants_table_SQL = `CREATE TABLE IF NOT EXISTS ${PARTICIPANTS_TABLE} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    NAME TEXT NOT NULL,
    PHONE_NUMBER INTEGER NOT NULL UNIQUE,
    EMAIL TEXT,
    POINTS REAL NOT NULL,
    ACTIVE INTEGER NOT NULL,
    TIME_ENTERED DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);`;

// POINTS TABLE SQL
const create_points_table_SQL = `CREATE TABLE IF NOT EXISTS ${POINTS_TABLE} (
    id INTEGER PRIMARY KEY,
    POINTS REAL NOT NULL,
    TIME_ENTERED DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PHONE_NUMBER INTEGER NOT NULL,
    FOREIGN KEY (PHONE_NUMBER)
        REFERENCES ${PARTICIPANTS_TABLE} (PHONE_NUMBER)
);`;

// REDEMPTIONS TABLE
const create_redemptions_table_SQL = `CREATE TABLE IF NOT EXISTS ${REDEMPTIONS_TABLE} (
    id INTEGER PRIMARY KEY,
    POINTS REAL NOT NULL,
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
    try 
    {
        const table_create_query = database.prepare(sql);
        table_create_query.run();
        console.log(`Successful creation of "${table_name}" table!`);
    }
    catch(error){return console.error(error)}
}

// Calls all of the table creation SQL
function createTables(tables) {
    for (const [table_name, sql] of Object.entries(tables)) {
        createTable(table_name, sql);
    }
}

// Insert a new participant into the system
function insertParticipant(name, phone_number, email) {
    try 
    {
        const sql = `INSERT INTO ${PARTICIPANTS_TABLE} 
        (NAME, PHONE_NUMBER, EMAIL, POINTS, ACTIVE) VALUES (?,?,?,?,?);`;
        const insert_query = database.prepare(sql);
        insert_query.run([name, phone_number, email, 0, 1]);
    }
    catch(error){return console.error(error)}
}

function updateEntryTime(table_name, entry_id)
{
    try 
    {
        const sql = `UPDATE ${table_name} SET TIME_ENTERED = DATETIME('now') WHERE id = ?`;
        const update_query = database.prepare(sql);
        update_query.run([entry_id]);
        
    }
    catch(error){console.error(error);}
}

function updateParticipantPoints(phone_number)
{
    try 
    {
        let points = 0;
        let redemption_points = 0;
        let total_points = 0;

        // GET POINTS TOTAL
        let sql = `SELECT SUM(POINTS) AS n FROM ${POINTS_TABLE} WHERE PHONE_NUMBER = ?`;
        const points_query = database.prepare(sql);
        const points_row = points_query.get([phone_number]);
        if(points_row && points_row.n)
            points = points_row.n;
        //console.log(`points: ${points}`);
        // GET REDEMPTION TOTAL
        sql = `SELECT SUM(POINTS) AS n FROM ${REDEMPTIONS_TABLE} WHERE PHONE_NUMBER = ?`;
        const redemptions_query = database.prepare(sql);
        const redemptions_row = redemptions_query.get([phone_number]);
        if(redemptions_row && redemptions_row.n)
            redemption_points = redemptions_row.n;
        //console.log(`redeemed points: ${redemption_points}`)
        // UPDATE POINTS TOTALS
        total_points = points - redemption_points;
        sql = `UPDATE ${PARTICIPANTS_TABLE} SET POINTS = ? WHERE PHONE_NUMBER = ?`;
        const run_query = database.prepare(sql);
        run_query.run([total_points, phone_number]);
    }
    catch(error){ return console.error(error);}
}

// Get all of the active participants
function getParticipants(res, page_number = 1) {
    try 
    {   
        let pagination_count = 0;
        let remainder = 0;
        let count = 0;
        console.log("here...");
        let sql = `SELECT COUNT(*) AS 'count' FROM ${PARTICIPANTS_TABLE}`;
        let offset = (5 * (page_number - 1));
        
        const row_query =  database.prepare(sql);
        const row = row_query.get();
        count = row.count;
        pagination_count = Math.trunc(count / 5);
        remainder = (count % 5);
        if(remainder)
            pagination_count++;
        
        sql = `SELECT * FROM ${PARTICIPANTS_TABLE} WHERE ACTIVE = 1 ORDER BY NAME LIMIT 5 OFFSET ${offset}`;
        const all_participants_query = database.prepare(sql);
        const rows = all_participants_query.all();
        
        res.render('participants', {model: rows, 
                                    search: false, 
                                    n_sort_id: "desc", 
                                    pn_sort_id: "desc", 
                                    e_sort_id: "desc", 
                                    p_sort_id: "desc", 
                                    last_search: "", 
                                    search_pag: "",
                                    result: "",
                                    count: pagination_count, 
                                    remainder: remainder,
                                    page_number: `${page_number}`});
    }
    catch (error){return console.error(error);}
}

// Create an ordered render for particpants
function participantOrderRender(res, rows, order, order_by, last_search)
{
    let order_id = utils.inverseSortOrder(order.toLowerCase());
    let n_sort_id = "desc";
    let pn_sort_id = "desc";
    let e_sort_id = "desc";
    let p_sort_id = "desc";

    switch(order_by)
    {
        case "NAME":
            n_sort_id = order_id;
            break;
        case "PHONE_NUMBER":
            pn_sort_id = order_id;
            break;
        case "EMAIL":
            e_sort_id = order_id;
            break;
        case "POINTS":
            p_sort_id = order_id;
            break;
    }
    res.render('participants', {model: rows, 
                                search: false, 
                                n_sort_id: n_sort_id,  
                                pn_sort_id: pn_sort_id, 
                                e_sort_id: e_sort_id, 
                                p_sort_id: p_sort_id, 
                                last_search: last_search});
}

// Get the participants by some kind of order
function getParticipantsByOrder(req, res, order_by, desc=true)
{
    let participant = '';
    let values = [];
    let order = 'ASC';
    let last_search = '';
    if(desc)
        order = 'DESC';
    let sql = `SELECT * FROM ${PARTICIPANTS_TABLE} WHERE ACTIVE = 1 ORDER BY ${order_by} ${order}`;
    if(Object.values(req.query).length && req.query.h)
    {
        sql = `SELECT * FROM ${PARTICIPANTS_TABLE} WHERE (INSTR(LOWER(NAME), LOWER(?)) > 0 OR INSTR(PHONE_NUMBER, ?) > 0) AND ACTIVE = 1 ORDER BY ${order_by} ${order}`;
        participant = utils.strip(req.query.h);
        if(!utils.containsAnyLetters(participant))
            participant = participant.replace(/[^0-9]/g, '');
        last_search = participant;
        values  = [participant, participant];
    }
    try 
    {
        const rows_query = database.prepare(sql);
        const rows = rows_query.all(values);
        participantOrderRender(res, rows, order, order_by, last_search);
    }
    catch(error){return console.error(error)}
}

// Get all of the active participants in descending order by player name
function getParticipantsByNameDesc(req, res) {
    getParticipantsByOrder(req, res, "NAME", true);
}

// Get all of the active participants in asscending order by player name
function getParticipantsByNameAsc(req, res) {
    getParticipantsByOrder(req, res, "NAME", false);
}

// Get all of the active participants in descending order by player id
function getParticipantsByPhoneNumberDesc(req, res) {
    getParticipantsByOrder(req, res, "PHONE_NUMBER", true);
}

// Get all of the active participants in ascending order by player id
function getParticipantsByPhoneNumberAsc(req, res) {
    getParticipantsByOrder(req, res, "PHONE_NUMBER", false);
}

// Get all of the active participants in descending order by email
function getParticipantsByEmailDesc(req, res) {
    getParticipantsByOrder(req, res, "EMAIL", true);
}

// Get all of the active participants in ascending order by email
function getParticipantsByEmailAsc(req, res) {
    getParticipantsByOrder(req, res, "EMAIL", false);
}

// Get all of the active participants in descending order by points
function getParticipantsByPointsDesc(req, res) {
    getParticipantsByOrder(req, res, "POINTS", true);
}

// Get all of the active participants in ascending order by points
function getParticipantsByPointsAsc(req, res) {
    getParticipantsByOrder(req, res, "POINTS", false);
}

// Search Participants
function searchParticipants(req, res, page_number=1)
{
    let participant = '';
    if(Object.values(req.query).length === 0)
    {
        res.redirect('/participants'); // empty
        return;
    }
    
        
    //let participant = utils.strip(req.params.search);
    participant = utils.strip(req.query.result);
    if(!utils.containsAnyLetters(participant))
        participant = participant.replace(/[^0-9]/g, '');

    console.log(`query result: ${participant}`);

    let pagination_count = 0;
    let remainder = 0;
    let count = 0;
    let sql = `SELECT COUNT(*) AS 'count' FROM ${PARTICIPANTS_TABLE} WHERE (INSTR(LOWER(NAME), LOWER(?)) > 0 OR INSTR(PHONE_NUMBER, ?) > 0) AND ACTIVE = 1`;
    let offset = (5 * (page_number - 1));
    
        
    const row_query_1 =  database.prepare(sql);
    const row_1 = row_query_1.get([participant, participant]);
    count = row_1.count;
    console.log(`search count ${count}`);
    pagination_count = Math.trunc(count / 5);
    remainder = (count % 5);
    if(remainder)
        pagination_count++;
    
    sql = `SELECT * FROM ${PARTICIPANTS_TABLE} WHERE (INSTR(LOWER(NAME), LOWER(?)) > 0 OR INSTR(PHONE_NUMBER, ?) > 0) AND ACTIVE = 1 LIMIT 5 OFFSET ${offset};`;
    // OR INSTR(PHONE_NUMBER, "?") > 0;
    if(participant.length)
    {
        try 
        {
            const rows_query_2 = database.prepare(sql);
            const rows_2 = rows_query_2.all([participant, participant]); 
            res.render('participants', {model: rows_2, 
                                        search: true, 
                                        n_sort_id: "desc", 
                                        pn_sort_id: "desc", 
                                        e_sort_id: "desc", 
                                        p_sort_id: "desc",
                                        search_pag: "search/",
                                        result: `?result=${participant}`, 
                                        last_search: participant,
                                        count: pagination_count, 
                                        remainder: remainder,
                                        page_number: `${page_number}`});
        }
        catch(error){return console.error(error);}
    }
    else {getParticipants(res);}

}

// Add a new participant form
function addParticipantForm(req, res) {
    try 
    {
        const sql = `SELECT * FROM ${PARTICIPANTS_TABLE} ORDER BY NAME`;
        const rows_query = database.prepare(sql);
        const rows = rows_query.get();
        res.render('add_participant', {model: rows});
    }
    catch(error){return console.error(error);}
}

// Add new participant
function addParticipant(req, res) {
    try 
    {
        const name = utils.strip(req.body.NAME.toUpperCase());
        const phone_number = req.body.PHONE_NUMBER.replace(/[^0-9]/g, '');
        //const points = req.body.POINTS.replace(/[^0-9]/g, '');
        const email = utils.strip(req.body.EMAIL);
        const sql = `SELECT NAME FROM ${PARTICIPANTS_TABLE} WHERE NAME = ? OR PHONE_NUMBER = ?`;
        const add_participant_query = database.prepare(sql);
        const row = add_participant_query.get([name, phone_number]);
        if(row && row.NAME)
        {
         setParticipantToActive(phone_number);
        }
        else 
        {
         insertParticipant(name, phone_number, email);
        }
        res.redirect('/participants');
    }
    catch(error){return console.error(error);}
}

// Edit participant form
function editParticipantForm(req, res) {
    try 
    {
        const phone_number = req.params.PHONE_NUMBER;
        const sql = `SELECT * FROM ${PARTICIPANTS_TABLE} WHERE PHONE_NUMBER = ?`;
        const rows_query = database.prepare(sql);
        const row = rows_query.get([phone_number]);
        res.render('edit_participant', {model: row});
    }
    catch(error){return console.error(error);}
}

// Update the data of a participant by usering their phone number
function editParticipantByPhoneNumber(req, res) {
    try
    {
        let phone_number = req.params.PHONE_NUMBER;
        let new_phone_number = req.body.PHONE_NUMBER;
        let name = req.params.NAME;
        let new_name = req.body.NAME;
        let email = req.params.EMAIL;
        let new_email = req.body.EMAIL;

        // UPDATE NAME
        if(new_name && name !== new_name) {
            const update_name_query = database.prepare(`UPDATE ${PARTICIPANTS_TABLE} SET NAME = ? WHERE PHONE_NUMBER = ?`);
            update_name_query.run([new_name, phone_number]);
        }
        
        // UPDATE EMAIL
        if(new_email && email !== new_email) {
            const update_email_query = database.prepare(`UPDATE ${PARTICIPANTS_TABLE} SET EMAIL = ? WHERE PHONE_NUMBER = ?`);
            update_email_query.run([new_email, phone_number]);
        }
        // UPDATE PHONE NUMBER
        if(new_phone_number && phone_number !== new_phone_number)
        {
            for(let table_name of [PARTICIPANTS_TABLE, POINTS_TABLE, REDEMPTIONS_TABLE]) {
                let update_phone_query = database.prepare(`UPDATE ${table_name} SET PHONE_NUMBER = ? WHERE PHONE_NUMBER = ?`);
                update_phone_query.run([new_phone_number, phone_number]);
            }
        }
    }
    catch(error){return console.error(error);}
    res.redirect('/participants');
}

function setParticipantToActive(phone_number)
{
    try 
    {
        const sql = `UPDATE ${PARTICIPANTS_TABLE} SET ACTIVE = 1 WHERE PHONE_NUMBER = ?`;
        const update_active_query = database.prepare(sql);
        update_active_query.run([phone_number]);
    }
    catch(error){return console.error(error);}
}

// Remove a participant form
function removeParticipantForm(req, res) {
    try
    {
        const phone_number = req.params.PHONE_NUMBER;
        const sql = `SELECT * FROM ${PARTICIPANTS_TABLE} WHERE PHONE_NUMBER = ?`;
        const row_query =  database.prepare(sql);
        const row = row_query.get([phone_number]);
        res.render('remove_participant', {model: row});
    }
    catch(error){return console.error(error);}
}

// Remove a participant by phone number
function removeParticipantByPhoneNumber(req, res) {
    try 
    {
        const phone_number = req.body.PHONE_NUMBER;
        for(let table_name of [PARTICIPANTS_TABLE, POINTS_TABLE, REDEMPTIONS_TABLE]) {
            const delete_query = database.prepare(`DELETE FROM ${table_name} WHERE PHONE_NUMBER = ?`);
            delete_query.run([phone_number]);
        }  
    }
    catch(error){return console.error(error);}
    res.redirect('/participants');
}

// POINTS //

// Insert a new points for a player
function insertPoints(table_name, points, phone_number) {
    try 
    {
        const sql = `INSERT INTO ${table_name} (POINTS, PHONE_NUMBER) VALUES (?,?)`;
        const insert_query = database.prepare(sql);
        insert_query.run([points, phone_number]);
    }
    catch(error){return console.error(error);}
}

function pointsForm(req, res)
{
    try 
    {
        let sql = `SELECT NAME, POINTS FROM ${PARTICIPANTS_TABLE} WHERE PHONE_NUMBER = ?`;
        const phone_number = req.params.PHONE_NUMBER;
        const row_query = database.prepare(sql); 
        const row = row_query.get([phone_number]);
        sql = `SELECT id, POINTS, datetime(TIME_ENTERED, 'localtime') as TE FROM ${POINTS_TABLE} WHERE PHONE_NUMBER = ?`;
        const points_rows_query = database.prepare(sql);
        const points_rows = points_rows_query.all([phone_number]);
        sql = `SELECT id, POINTS, datetime(TIME_ENTERED, 'localtime') as TE FROM ${REDEMPTIONS_TABLE} WHERE PHONE_NUMBER = ?`;
        const redeem_rows_query = database.prepare(sql);
        const redeem_rows = redeem_rows_query.all([phone_number]);
        res.render('points', {points_model: points_rows, 
                              redeem_model: redeem_rows, 
                              name: row.NAME, 
                              points: row.POINTS, 
                              phone_number: phone_number, 
                              p_sort_id: 'desc', 
                              t_sort_id: 'desc', 
                              format: format, 
                              parseISO: parseISO});
    }
    catch(error){return console.error(error);}
}

// Handles points for the main points form and the redeem points form
function handlePointsForm(table_name, req, res) 
{
    try 
    {
        let sql = `SELECT * FROM ${PARTICIPANTS_TABLE} WHERE PHONE_NUMBER = ?`;
        const phone_number = req.params.PHONE_NUMBER;
        const page_type = directToCorrectPointsPage(table_name);
        const row_query = database.prepare(sql);
        const row = row_query.get([phone_number]);
        res.render('handle_points', {model: row, page: page_type});
    }
    catch(error){return console.error(error);}
}

// Add or redeem points
function handlePoints(table_name, req, res) {
    const phone_number = req.body.PHONE_NUMBER;
    const points = req.body.POINTS;
    
    // Only positive numbers will get through
    if(points && parseFloat(points) > 0)
    {
     insertPoints(table_name, points, phone_number);
        //point_changes_global = true;
     updateParticipantPoints(phone_number);
    }
    res.redirect(`/points/${phone_number}`);  
}

// Update points or redemptions, form
function updatePointsForm(table_name, req, res)
{
    try 
    {
        const sql = `SELECT id, POINTS, PHONE_NUMBER, datetime(TIME_ENTERED, 'localtime') as TE FROM ${table_name} WHERE id = ?`;
        const id = req.params.id;
        const name = req.params.NAME;
        const page_type = directToCorrectPointsPage(table_name);
        const row_query = database.prepare(sql);
        const row = row_query.get([id]);
        res.render('edit_points', {model: row, name: name, page: page_type, format: format, parseISO: parseISO});
    }
    catch(error){return console.error(error);}
}

// Update points
function updatePointsByID(table_name, req, res) 
{
    try
    {
        const id = req.params.id;
        const points = req.body.POINTS;
        const phone_number = req.body.PHONE_NUMBER;
        const sql = `UPDATE ${table_name} SET POINTS = ? WHERE id = ?`;
        const update_points_query = database.prepare(sql);
        update_points_query.run([points, id]);
        updateParticipantPoints(phone_number);
        updateEntryTime(table_name, id);
        res.redirect(`/points/${phone_number}`);
    }
    catch(error){return console.error(error);}
}

// Remove point entry form
function removePointsForm(table_name, req, res) {
    try 
    {
        const sql = `SELECT id, POINTS, PHONE_NUMBER, datetime(TIME_ENTERED, 'localtime') as TE FROM ${table_name} WHERE id = ?`;
        const id = req.params.id;
        const name = req.params.NAME;
        const page_type = directToCorrectPointsPage(table_name);
        const row_query = database.prepare(sql);
        const row = row_query.get([id]);
        res.render('remove_points', {model: row, name: name, page: page_type, format: format, parseISO: parseISO});
    }
    catch(error){return console.error(error);}
}

// Remove points
function removePointsByID(table_name, req, res) {
    try 
    {
        const id = req.params.id;
        const phone_number = req.body.PHONE_NUMBER;
    
        const sql = `DELETE FROM ${table_name} WHERE id = ?`;
        const delete_query = database.prepare(sql);
        delete_query.run([id]);
        updateParticipantPoints(phone_number);
        // point_changes_global = true;
        res.redirect(`/points/${phone_number}`);
    }
    catch(error){return console.error(error);}
    
    /*else
    {
        res.render('message', {
            message: {
            title: "Error: Cannot Delete", 
            content: "Participant must have at least one points entry.",
            link: `/points/${phone_number}`
        }});
    }
    */
}

function setActivationForParticipants(active)
{
    try 
    {
        const sql = `UPDATE ${PARTICIPANTS_TABLE} SET ACTIVE = ?;`;
        const activate_query = database.prepare(sql);
        activate_query.run(active);
    }
    catch(error){return console.error(error);}
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
}

module.exports = {
    table_creation_SQL,
    POINTS_TABLE,
    REDEMPTIONS_TABLE,
    PARTICIPANTS_TABLE,
    createTable,
    createTables,
    getParticipants,
    searchParticipants,
    addParticipantForm,
    addParticipant,
    editParticipantForm,
    editParticipantByPhoneNumber,
    removeParticipantForm,
    removeParticipantByPhoneNumber,
    getParticipantsByNameDesc,
    getParticipantsByNameAsc,
    getParticipantsByPhoneNumberDesc,
    getParticipantsByPhoneNumberAsc,
    getParticipantsByEmailDesc,
    getParticipantsByEmailAsc,
    getParticipantsByPointsDesc,
    getParticipantsByPointsAsc,
    handlePointsForm,
    handlePoints,
    pointsForm,
    updatePointsForm,
    updatePointsByID,
    removePointsForm,
    removePointsByID,
}