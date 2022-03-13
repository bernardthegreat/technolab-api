const sqlConfig = require("../config/database")
const mysql = require('mysql');
const conn = mysql.createPool(sqlConfig.sqlCredentials)
const validateToken = require('../middleware/validateToken.js');
// JSON FORMAT FOR UPDATING //
// {
//   "name": "IT",
//   "description": "IT Role",
//   "is_admin": 0,
//   "active": 1,
//   "role_id": 8
// }
// JSON FORMAT FOR UPDATING //

// JSON FORMAT FOR ADDING //
// {
//   "code": "architectc400",
//   "name": "Architect C400",
//   "description": "Chemistry Machine",
//   "laboratory_section_id": 2
// }
// JSON FORMAT FOR ADDING //

async function getAllInstruments (req, res) {
  const bearerHeader=req.headers["authorization"];
  if (bearerHeader===undefined){
    res.status(401).send({ error: "Token is required" });
    return   
  }
  const token = validateToken(bearerHeader)
  if (token.error) {
    res.status(403).send({ error: token.error });
    return
  }
  conn.getConnection(function(err, connection) {
    if (err) throw err; // not connected!
    var sqlWhere = ''
    if (req.params.name) {
      sqlWhere = `where name = '${req.params.name}'`
    }
    var sqlQuery = `SELECT
        id,
        code,
        name
        description,
        laboratory_section_id
        active,
        datetime_created,
        datetime_updated,
        remarks
      FROM instruments
      ${sqlWhere}
    `
    connection.query(sqlQuery, function (error, results, fields) {
      if (results.length === 0) {
        res.send({ message: 'Instrument not found'})
        return
      }
      res.send(results)
      connection.release();
      if (error) throw error;
    });
  });
}

async function updateInstrument (req, res) {
  const bearerHeader=req.headers["authorization"];
  if (bearerHeader===undefined){
    res.status(401).send({ error: "Token is required" });
    return   
  }
  const token = validateToken(bearerHeader)
  if (token.error) {
    res.status(403).send({ error: token.error });
    return
  }
  conn.getConnection(function(err, connection) {
    if (err) throw err; // not connected!
    var sqlQuery = `UPDATE instruments SET
      code = '${req.body.code}',
      name = '${req.body.name}',
      description = '${req.body.description}',
      laboratory_section_id = '${req.body.laboratory_section_id}',
      active = '${req.body.active}',
      datetime_updated = CURRENT_TIMESTAMP
    where
      id = '${req.body.instrument_id}'
    `
    connection.beginTransaction(function(err) {
      if (err) { throw err; }
      connection.query(sqlQuery, function (error, results, fields) {
        if (error) {
          return connection.rollback(function() {
            res.send(error)
          });
        }
        connection.commit(function(err) {
          if (err) {
            return connection.rollback(function() {
              res.send(err)
              // throw err;
            });
          }
          res.send({
            success: 'Instrument has been updated'
          })
        });
        connection.release();
        if (error) 
          // throw error;
          res.send(error)
      });
    });
  });
}

async function addInstrument (req, res) {
  const bearerHeader=req.headers["authorization"];
  if (bearerHeader===undefined){
    res.status(401).send({ error: "Token is required" });
    return   
  }
  const token = validateToken(bearerHeader)
  if (token.error) {
    res.status(403).send({ error: token.error });
    return
  }
  conn.getConnection(async function(err, connection) {
    if (err) throw err; // not connected!
    var sqlQuery = `
      INSERT INTO instruments
        (
          code,
          name,
          description,
          laboratory_section_id
        )
      VALUES
        (
          '${req.body.code}',
          '${req.body.name}',
          '${req.body.description}',
          '${req.body.laboratory_section_id}'
        )
    `
    connection.beginTransaction(function(err) {
      if (err) { throw err; }
      connection.query(sqlQuery, function (error, results, fields) {
        if (error) {
          return connection.rollback(function() {
            res.send(error)
            // throw error;
          });
        }
        connection.commit(async function(err) {
          if (err) {
            return connection.rollback(function() {
              res.send(err)
              // throw err;
            });
          }
          res.send({
            success: 'Instrument has been added'
          })
        });
        connection.release();
        if (error) 
          res.send(error)
          // throw error;
      });
    });
  });
}

module.exports = {
  getAllInstruments,
  updateInstrument,
  addInstrument,
};
