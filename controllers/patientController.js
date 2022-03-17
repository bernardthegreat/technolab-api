const sqlConfig = require("../config/database");
const mysql = require("mysql");
const conn = mysql.createPool(sqlConfig.sqlCredentials);
const helpers = require("../helpers/helpers");
const validateToken = require("../middleware/validateToken.js");
// JSON FORMAT FOR UPDATING //
// {
//   "first_name": "Bernard",
//   "middle_name": "Tiaga",
//   "last_name": "Gresola",
//   "birthdate": "1993-05-06",
//   "alias": "",
//   "gender": "M",
//   "address": "223 Col. Bonny Serrano Avenue, Barangay Horseshoe, Quezon City",
//   "email_address": "gresolabernard@gmail.com",
//   "contact_number": "09053254071",
//   "religion": "",
//   "civil_status": "S",
//   "active": 1,
//   "patient_no": 202202270000018
// }
// JSON FORMAT FOR UPDATING //

// JSON FORMAT FOR ADDING //
// {
//   "first_name": "Bernard",
//   "middle_name": "Tiaga",
//   "last_name": "Gresola",
//   "birthdate": "1993-05-06",
//   "alias": "",
//   "gender": "M",
//   "address": "Quezon City",
//   "email_address": "gresolabernard@gmail.com",
//   "contact_number": "09053254071",
//   "religion": "",
//   "civil_status": "S"
// }
// JSON FORMAT FOR ADDING //

async function getAllPatients(req, res) {
  const bearerHeader = req.headers["authorization"];
  if (bearerHeader === undefined) {
    res.status(401).send({ error: "Token is required" });
    return;
  }
  const token = validateToken(bearerHeader);
  if (token.error) {
    res.status(403).send({ error: token.error });
    return;
  }
  conn.getConnection(function (err, connection) {
    if (err) throw err; // not connected!
    var sqlWhere = "limit 500";
    if (req.params.search) {
      sqlWhere = `where (first_name = '${req.params.first_name}' or last_name = '${req.params.last_name}')`;
    }

    if (req.params.patientNo) {
      sqlWhere = `where patient_no = '${req.params.patientNo}'`;
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
    `;
    connection.query(sqlQuery, function (error, results, fields) {
      if (results.length === 0) {
        res.send({ message: "Patient not found" });
        return;
      }
      res.send(results);
      connection.release();
      if (error) throw error;
    });
  });
}

async function updatePatient(req, res) {
  const bearerHeader = req.headers["authorization"];
  if (bearerHeader === undefined) {
    res.status(401).send({ error: "Token is required" });
    return;
  }
  const token = validateToken(bearerHeader);
  if (token.error) {
    res.status(403).send({ error: token.error });
    return;
  }
  conn.getConnection(function (err, connection) {
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
      patient_no = '${req.body.patient_no}'
    `;
    connection.beginTransaction(function (err) {
      if (err) {
        throw err;
      }
      connection.query(sqlQuery, function (error, results, fields) {
        if (error) {
          return connection.rollback(function () {
            res.send(error);
          });
        }
        connection.commit(function (err) {
          if (err) {
            return connection.rollback(function () {
              res.send(err);
              // throw err;
            });
          }
          res.send({
            success: "Patient has been updated",
          });
        });
        connection.release();
        if (error)
          // throw error;
          res.send(error);
      });
    });
  });
}

async function addPatient(req, res) {
  const bearerHeader = req.headers["authorization"];
  if (bearerHeader === undefined) {
    res.status(401).send({ error: "Token is required" });
    return;
  }
  const token = validateToken(bearerHeader);
  if (token.error) {
    res.status(403).send({ error: token.error });
    return;
  }
  conn.getConnection(async function (err, connection) {
    if (err) throw err; // not connect
    let sqlSelect = `SELECT MAX(id) last_inserted_id FROM patients`;
    let generatedPatientID = "";
    connection.query(sqlSelect, async function (error, results, fields) {
      generatedPatientID = await generatePatientID(results);
      var sqlQuery = `
        INSERT INTO patients
          (
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
            civil_status
          )
        VALUES
          (
            '${generatedPatientID}',
            '${req.body.first_name}',
            '${req.body.middle_name}',
            '${req.body.last_name}',
            '${req.body.birthdate}',
            '${req.body.alias}',
            '${req.body.gender}',
            '${req.body.address}',
            '${req.body.email_address}',
            '${req.body.contact_number}',
            '${req.body.religion}',
            '${req.body.civil_status}'
          )
      `;
      connection.beginTransaction(function (err) {
        if (err) {
          throw err;
        }
        let sqlCheckDuplicate = `SELECT
          first_name,
          last_name,
          birthdate
        from patients
          where 
        first_name = '${req.body.first_name}'
        and last_name = '${req.body.last_name}'
        and birthdate = '${req.body.birthdate}'`;
        connection.query(sqlCheckDuplicate, function (error, results, fields) {
          if (results.length > 0) {
            res.status(403).send({ error: "Patient already registered" });
            return;
          }
          connection.query(sqlQuery, function (error, results, fields) {
            if (error) {
              return connection.rollback(function () {
                res.send(error);
                // throw error;
              });
            }

            connection.commit(async function (err) {
              if (err) {
                return connection.rollback(function () {
                  res.send(err);
                  // throw err;
                });
              }

              res.send({
                success: "Patient has been added",
              });
            });

            connection.release();
            if (error) res.send(error);
            // throw error;
          });
        });
      });
      if (error) throw error;
    });
  });
}

async function generatePatientID(lastInsertedID) {
  const dateToday = new Date().toISOString().substr(0, 10).replaceAll("-", "");
  let lastInsertedId =
    lastInsertedID[0].last_inserted_id === null
      ? 1
      : lastInsertedID[0].last_inserted_id;
  let zeroFilledLastID = ("000000" + lastInsertedId).slice(-6);
  let patientNumber = helpers.generateCheckDigit(dateToday, zeroFilledLastID);
  return patientNumber;
}

module.exports = {
  getAllPatients,
  updatePatient,
  addPatient,
};
