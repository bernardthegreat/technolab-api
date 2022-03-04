const { request } = require("express");
const sqlConfig = require("../config/database")
const jwt = require("jsonwebtoken");
const mysql = require('mysql');
const conn = mysql.createPool(sqlConfig.sqlCredentials)
const bcrypt = require('bcrypt');
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
// JSON FORMAT FOR ADDING //
// {
//   "username": "testestest",
//   "password": "123456",
//   "first_name": "Bernard",
//   "middle_name": "Tiaga",
//   "last_name": "Gresola",
//   "signature": null,
//   "license_number": null,
//   "laboratory_section_id": null,
//   "role_id": 1
// }
// JSON FORMAT FOR ADDING //

// JSON FORMAT FOR UPDATING //
// {
//   "username": "btgresola1",
//   "password": "123456",
//   "first_name": "Bernard",
//   "middle_name": "Tiaga",
//   "last_name": "Gresola",
//   "signature": null,
//   "license_number": null,
//   "active": 1,
//   "user_id": 1,
//   "laboratory_section_id": null,
//   "role_id": 1
// }
// JSON FORMAT FOR UPDATING //

async function getAllUsers (req, res) {
  conn.getConnection(function(err, connection) {
    if (err) throw err; // not connected!
    var sqlWhere = ''
    if (req.params.username) {
      sqlWhere = `where username = '${req.params.username}'`
    }
    var sqlQuery = `SELECT
        u.id,
        username,
        password,
        first_name,
        middle_name,
        last_name, 
        signature,
        license_number,
        u.active,
        r.name role,
        r.id role_id,
        ls.name laboratory_section,
        u.datetime_created,
        u.datetime_updated
      FROM users u
        join user_roles ur on u.id = ur.user_id
        join roles r on ur.role_id = r.id
        left join laboratory_sections ls on ur.laboratory_section_id = ls.id
      ${sqlWhere}
      order by active desc
    `
    console.log(sqlQuery)
    connection.query(sqlQuery, function (error, results, fields) {
      if (results.length === 0) {
        res.send({ message: 'User not found'})
        return
      }
      res.send(results)
      connection.release();
      if (error) res.status(403).send({ error: error });;
    });
  });
}

async function updateUser (req, res) {
  conn.getConnection(async function(err, connection) {
    if (err) throw err; // not connected!
    const hashPassword = await generateHash(req.body.password)
    var sqlQuery = `UPDATE users SET
      username = '${req.body.username}',
      password = '${hashPassword}',
      first_name = '${req.body.first_name}',
      middle_name = '${req.body.middle_name}',
      last_name = '${req.body.last_name}',
      signature = '${req.body.signature}',
      license_number = '${req.body.license_number}',
      active = '${req.body.active}',
      datetime_updated = CURRENT_TIMESTAMP
    where
      id = '${req.body.user_id}'
    `
    console.log(sqlQuery)
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
          updateUserRole(connection, req.body)
          res.send({
            success: 'User has been updated'
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

async function addUser (req, res) {
  conn.getConnection(async function(err, connection) {
    if (err) throw err; // not connected!
    const hashPassword = await generateHash(req.body.password)
    var sqlQuery = `
      INSERT INTO users 
        (
          username,
          password,
          first_name,
          middle_name,
          last_name,
          signature,
          license_number
        )
      VALUES
        (
          '${req.body.username}',
          '${hashPassword}',
          '${req.body.first_name}',
          '${req.body.middle_name}',
          '${req.body.last_name}',
          '${req.body.signature}',
          '${req.body.license_number}'
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
          await insertUserRole(connection, req.body)
          res.send({
            success: 'User has been added'
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


async function insertUserRole (connection, userDetails) {
  let sqlSelect = `SELECT id from users where username = '${userDetails.username}'`
  connection.query(sqlSelect, function (error, results, fields) {
    connection.beginTransaction(function(err) {
      if (err) { throw err; }
      var sqlInsertRole = `
        INSERT INTO user_roles 
          (
            user_id,
            role_id,
            laboratory_section_id
          )
        VALUES
          (
            '${results[0].id}',
            '${userDetails.role_id}',
            ${userDetails.laboratory_section_id}
          )
      `
      connection.query(sqlInsertRole, function (error, results, fields) {
        if (error) {
          return connection.rollback(function() {
            return error
            // throw error;
          });
        }
        connection.commit(function(err) {
          if (err) {
            return connection.rollback(function() {
              return err
              // throw err;
            });
          }
        });
        if (error) 
          return error
          // throw error;
      })
    })
  })
}


async function updateUserRole (connection, userDetails) {
  connection.beginTransaction(function(err) {
    if (err) { throw err; }
    var sqlInsertRole = `
      UPDATE user_roles SET
        role_id = '${userDetails.role_id}',
        laboratory_section_id = ${userDetails.laboratory_section_id},
        datetime_updated = CURRENT_TIMESTAMP
      WHERE
        user_id = '${userDetails.user_id}'
    `
    connection.query(sqlInsertRole, function (error, results, fields) {
      if (error) {
        return connection.rollback(function() {
          return error
          // throw error;
        });
      }
      connection.commit(function(err) {
        if (err) {
          return connection.rollback(function() {
            return err
            // throw err;
          });
        }
      });
      if (error) 
        return error
        // throw error;
    })
  })
}

async function generateHash (password) {
  const hash = bcrypt.hashSync(password, salt);
  return hash
}


module.exports = {
  getAllUsers,
  updateUser,
  addUser,
};
