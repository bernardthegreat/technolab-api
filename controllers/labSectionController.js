const sqlConfig = require("../config/database");
const mysql = require("mysql");
const conn = mysql.createPool(sqlConfig.sqlCredentials);
const helpers = require("../helpers/helpers");
// JSON FORMAT FOR UPDATING //
// {
//   "name": "Hematology",
//   "description": "Hematology Department"
//   "active": 1
// }
// JSON FORMAT FOR UPDATING //

// JSON FORMAT FOR ADDING //
// {
//   "name": "Hematology",
//   "description": "Hematology Department"
// }
// JSON FORMAT FOR ADDING //

async function getAllSections(req, res) {
  const validate = await helpers.validateTokenizations(
    req.headers["authorization"]
  );
  if (validate.error) {
    res.status(validate.type).send({ error: validate.error });
    return
  }
  conn.getConnection(function (err, connection) {
    if (err) throw err; // not connected!
    var sqlWhere = "";
    if (req.params.sectionName) {
      sqlWhere = `where name = '${req.params.sectionName}'`;
    }
    var sqlQuery = `SELECT
        id,
        name,
        description,
        active,
        datetime_created,
        datetime_updated,
        remarks
      FROM laboratory_sections
      ${sqlWhere}
    `;
    connection.query(sqlQuery, function (error, results, fields) {
      if (results.length === 0) {
        res.send({ message: "Lab Section not found" });
        return;
      }
      res.send(results);
      connection.release();
      if (error) throw error;
    });
  });
}

async function updateSection(req, res) {
  const validate = await helpers.validateTokenizations(
    req.headers["authorization"]
  );
  if (validate.error) {
    res.status(validate.type).send({ error: validate.error });
    return
  }
  conn.getConnection(function (err, connection) {
    if (err) throw err; // not connected!
    var sqlQuery = `UPDATE laboratory_sections SET
      name = '${req.body.name}',
      description = '${req.body.description}',
      active = '${req.body.active}',
      datetime_updated = CURRENT_TIMESTAMP
    where
      id = '${req.body.laboratory_section_id}'
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
            success: "Lab Section has been updated",
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

async function addSection(req, res) {
  const validate = await helpers.validateTokenizations(
    req.headers["authorization"]
  );
  if (validate.error) {
    res.status(validate.type).send({ error: validate.error });
    return
  }
  conn.getConnection(async function (err, connection) {
    if (err) throw err; // not connected!
    var sqlQuery = `
      INSERT INTO laboratory_sections 
        (
          name,
          description
        )
      VALUES
        (
          '${req.body.name}',
          '${req.body.description}'
        )
    `;
    connection.beginTransaction(function (err) {
      if (err) {
        throw err;
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
            success: "Lab Section has been added",
          });
        });
        connection.release();
        if (error) res.send(error);
        // throw error;
      });
    });
  });
}

module.exports = {
  getAllSections,
  updateSection,
  addSection,
};
