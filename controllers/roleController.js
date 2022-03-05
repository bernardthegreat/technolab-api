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

async function getAllRoles (req, res) {
  conn.getConnection(function(err, connection) {
    if (err) throw err; // not connected!
    var sqlWhere = ''
    if (req.params.name) {
      sqlWhere = `where name = '${req.params.name}'`
    }
    var sqlQuery = `SELECT
        id,
        name,
        description,
        is_admin,
        active,
        datetime_created,
        datetime_updated,
        remarks
      FROM roles
      ${sqlWhere}
    `
    connection.query(sqlQuery, function (error, results, fields) {
      if (results.length === 0) {
        res.send({ message: 'Role not found'})
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
    var sqlQuery = `UPDATE roles SET
      name = '${req.body.name}',
      description = '${req.body.description}',
      is_admin = '${req.body.is_admin}',
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

async function addRole (req, res) {
  conn.getConnection(async function(err, connection) {
    if (err) throw err; // not connected!
    var sqlQuery = `
      INSERT INTO roles
        (
          name,
          description,
          is_admin
        )
      VALUES
        (
          '${req.body.name}',
          '${req.body.description}',
          '${req.body.is_admin}'
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
  getAllRoles,
  updateRole,
  addRole,
};
