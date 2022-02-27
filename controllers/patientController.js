const sqlConfig = require("../config/database")
const mysql = require('mysql');
const conn = mysql.createPool(sqlConfig.sqlCredentials)
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
//   "name": "IT",
//   "description": "IT Role",
//   "is_admin": 1
// }
// JSON FORMAT FOR ADDING //

async function getAllPatients (req, res) {
  conn.getConnection(function(err, connection) {
    if (err) throw err; // not connected!
    var sqlWhere = 'limit 500'
    if (req.params.search) {
      sqlWhere = `where (first_name = '${req.params.first_name}' or last_name = '${req.params.last_name}')`
    }

    if (req.params.patientID) {
      sqlWhere = `where patient_id = '${req.params.patient_id}'`
    }

    var sqlQuery = `SELECT
        id,
        patient_no,
        first_name,
        middle_name,
        last_name,
        birthdate,
        alias,
        gender,
        address,
        email_address,
        contact_number,
        religion,
        civil_status,
        active,
        datetime_created,
        datetime_updated,
        remarks
      FROM patients
      ${sqlWhere}
    `
    connection.query(sqlQuery, function (error, results, fields) {
      if (results.length === 0) {
        res.send({ message: 'Patient not found'})
        return
      }
      res.send(results)
      connection.release();
      if (error) throw error;
    });
  });
}

async function updateRole (req, res) {
  conn.getConnection(function(err, connection) {
    if (err) throw err; // not connected!
    var sqlQuery = `UPDATE patients SET
      first_name = '${req.body.first_name}',
      middle_name = '${req.body.middle_name}',
      last_name = '${req.body.last_name}',
      birthdate = '${req.body.birthdate}',
      alias = '${req.body.alias}',
      gender = '${req.body.gender}',
      address = '${req.body.address}',
      email_address = '${req.body.email_address}',
      contact_number = '${req.body.contact_number}',
      religion = '${req.body.religion}',
      civil_status = '${req.body.civil_status}',
      active = '${req.body.active}',
      datetime_updated = CURRENT_TIMESTAMP
    where
      id = '${req.body.role_id}'
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
            success: 'Role has been updated'
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

async function addPatient (req, res) {
  conn.getConnection(async function(err, connection) {
    if (err) throw err; // not connected!
    var sqlQuery = `
      INSERT INTO patients
        (
          patient_id,
          first_name,
          middle_name,
          last_name,
          birthdate,
          alias,
          gender,
          address,
          email_address,
          contact_number,
          religion,
          civil_status
        )
      VALUES
        (
          '${patient_id}',
          '${first_name}',
          '${middle_name}',
          '${last_name}',
          '${birthdate}',
          '${alias}',
          '${gender}',
          '${address}',
          '${email_address}',
          '${contact_number}',
          '${religion}',
          '${civil_status}'
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
            success: 'Role has been added'
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
  getAllPatients,
  updateRole,
  addPatient,
};
