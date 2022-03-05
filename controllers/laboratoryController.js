const sqlConfig = require("../config/database")
const mysql = require('mysql');
const conn = mysql.createPool(sqlConfig.sqlCredentials)
// JSON FORMAT FOR UPDATING //
// {
//   "laboratory_id": "1",
//   "code": "UERMMMCI",
//   "name": "University of the East Ramon Magsaysay Memorial Medical Center, Inc.",
//   "description": "UERM",
//   "address": "Aurora Blvd., Brgy. Doña Imelda, Quezon City",
//   "contact_number": "12345673213218",
//   "active": 1
// }
// JSON FORMAT FOR UPDATING //

// JSON FORMAT FOR ADDING //
// {
//   "code": "UERMMMCI",
//   "name": "University of the East Ramon Magsaysay Memorial Medical Center, Inc.",
//   "description": "UERM",
//   "address": "Aurora Blvd., Brgy. Doña Imelda, Quezon City",
//   "contact_number": "12345678"
// }
// JSON FORMAT FOR ADDING //

async function getAllLaboratories (req, res) {
  conn.getConnection(function(err, connection) {
    if (err) throw err; // not connected!
    var sqlWhere = ''
    if (req.params.labName) {
      sqlWhere = `where name = '${req.params.labName}'`
    }
    var sqlQuery = `SELECT
        id,
        code,
        name,
        description,
        address,
        contact_number,
        active,
        datetime_created,
        datetime_updated,
        remarks
      FROM laboratories
      ${sqlWhere}
    `
    console.log(sqlQuery)
    connection.query(sqlQuery, function (error, results, fields) {
      if (results.length === 0) {
        res.send({ message: 'Laboratory not found'})
        return
      }
      res.send(results)
      connection.release();
      if (error) throw error;
    });
  });
}

async function updateLaboratory (req, res) {
  conn.getConnection(function(err, connection) {
    if (err) throw err; // not connected!
    var sqlQuery = `UPDATE laboratories SET
      code = '${req.body.code}',
      name = '${req.body.name}',
      description = '${req.body.description}',
      contact_number = '${req.body.contact_number}',
      address = '${req.body.address}',
      active = '${req.body.active}',
      datetime_updated = CURRENT_TIMESTAMP
    where
      id = '${req.body.laboratory_id}'
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
            success: 'Laboratory has been updated'
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

async function addLaboratory (req, res) {
  conn.getConnection(async function(err, connection) {
    if (err) throw err; // not connected!
    var sqlQuery = `
      INSERT INTO laboratories 
        (
          code,
          name,
          description,
          address,
          contact_number
        )
      VALUES
        (
          '${req.body.code}',
          '${req.body.name}',
          '${req.body.description}',
          '${req.body.address}',
          '${req.body.contact_number}'
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
            success: 'Laboratory has been added'
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
  getAllLaboratories,
  updateLaboratory,
  addLaboratory,
};
