require("dotenv/config");
const sqlConfig = require("../config/database");
const jwt = require("jsonwebtoken");
const mysql = require("mysql");
const conn = mysql.createPool(sqlConfig.sqlCredentials);
const bcrypt = require("bcrypt");
const helpers = require("../helpers/helpers.js");
const redis = require("redis");

async function authenticate(req, res) {
  conn.getConnection(function (err, connection) {
    if (err) return err; // not connected!
    var sqlWhere = "";
    if (req.body.username) {
      sqlWhere = `where username = '${req.body.username}'`;
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
        left join laboratory_sections ld on ur.laboratory_section_id = ld.id
      ${sqlWhere}
    `;
    connection.query(sqlQuery, async function (error, results, fields) {
      if (results.length === 0) {
        res.status(403).send({ error: "Authentication error: User not found" });
        return;
      }
      const hash = await verifyHash(req.body.password, results[0].password);
      if (!hash) {
        res
          .status(403)
          .send({ error: "Authentication error: Password does not match" });
        return;
      }
      const jwtToken = await generateJWTToken(
        req.body.username,
        req.body.password
      );
      const tokenDetails = {
        token: jwtToken,
        status: 1,
      };
      
      const tokenRedis = await helpers.checkRedisToken(tokenDetails);
      if (tokenRedis.error) {
        return tokenRedis.error
      }
      await helpers.cacheUserCredentials(results)
      const userAuthDetails = {
        token: jwtToken,
        userDetails: results,
      };
      res.status(200).send(userAuthDetails);
      connection.release();
      if (error) return error;
    });
  });
}

async function getCachedUserCredentials (req, res) {
  const validate = await helpers.validateTokenizations(
    req.headers["authorization"]
  );
  if (validate.error) {
    res.status(validate.type).send({ error: validate.error });
    return;
  }
  const cachedUserCredentials = await helpers.getCachedCredentials(req.params.userKey);
  if (cachedUserCredentials) {
    res.status(200).send(cachedUserCredentials)
  } else {
    res.status(403).send({ error: cachedUserCredentials });
  }
}

async function verifyHash(password, hashPassword) {
  const match = await bcrypt.compare(password, hashPassword);
  if (match) {
    return true;
  } else {
    return false;
  }
}

async function generateJWTToken(credentials) {
  const expiresIn = 259200;
  // const expiresIn = 15;
  var token = jwt.sign(
    {
      username: credentials.username,
      password: credentials.password,
    },
    process.env.TOKEN,
    { expiresIn }
  );
  const jwtAuth = {
    token: token,
    type: "bearer",
    expiresat: expiresIn,
  };
  return jwtAuth;
}

async function logout(req, res) {
  const validate = await helpers.validateTokenizations(
    req.headers["authorization"]
  );
  if (validate.error) {
    res.status(validate.type).send({ error: validate.error });
    return;
  }
  const tokenStatus = await helpers.addRedisToken(req.headers["authorization"]);
  if (tokenStatus) {
    res.status(200).send({ success: "Successfully logout" });
  } else {
    res.status(403).send({ error: tokenStatus.error });
  }
}

module.exports = {
  authenticate,
  getCachedUserCredentials,
  logout,
};
