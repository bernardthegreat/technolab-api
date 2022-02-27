require('dotenv/config');
const sqlConfig = require("../config/database")
const jwt = require("jsonwebtoken");
const mysql = require('mysql');
const conn = mysql.createPool(sqlConfig.sqlCredentials)
const bcrypt = require('bcrypt');

async function authenticate (req, res) {
  conn.getConnection(function(err, connection) {
    if (err) throw err; // not connected!
    var sqlWhere = ''
    if (req.body.username) {
      sqlWhere = `where username = '${req.body.username}'`
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
        ld.name laboratory_department,
        u.datetime_created,
        u.datetime_updated
      FROM users u
        join user_roles ur on u.id = ur.user_id
        join roles r on ur.role_id = r.id
        left join laboratory_departments ld on ur.laboratory_department_id = ld.id
      ${sqlWhere}
    `
    connection.query(sqlQuery, async function (error, results, fields) {
      if (results.length === 0) {
        res.send({ message: 'User not found'})
        return
      }
      const hash = await verifyHash(req.body.password, results[0].password)
      if (!hash) {
        res.status(403).send({ error: 'Authentication error: Password does not match' });
        return
      }
      const jwtToken = await generateJWTToken(req.body.username, req.body.password)
      console.log(jwtToken)
      const userAuthDetails = {
        token: jwtToken,
        userDetails: results
      }
      res.status(200).send(userAuthDetails);
      connection.release();
      if (error) throw error;
    });
  });
}

async function verifyHash (password, hashPassword) {
  const match = await bcrypt.compare(password, hashPassword);
  if(match) {
    return true
  } else {
    return false
  }
}

async function generateJWTToken (credentials) {
  const expiresIn = 60;
  var token = jwt.sign(
    {
      username: credentials.username,
      password: credentials.password
    },
  process.env.TOKEN, { expiresIn });
  const jwtAuth = {
    token: token,
    type: "bearer",
    expiresat: expiresIn
  };
  return jwtAuth
}

// async function validateToken(req, res) {
//   const token = req.headers["authorization"]
//   const bearer = token.split(' ');
//   const bearerToken = bearer[1];
  
//   try {
//     var decoded = jwt.verify(bearerToken, process.env.TOKEN);
//     res.send({message: 'success'})
//     return decoded != undefined;
//   } catch (error) {
//     res.send({message: 'error'})
//     return false;
//   }
// }


module.exports = {
  authenticate
};
