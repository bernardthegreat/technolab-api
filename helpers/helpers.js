const cdigit = require("cdigit");
const redis = require("redis");
// const cryptojs = require("crypto-js");
// const btoa = require("btoa");
// const atob = require("atob");
// var axios = require("axios");
// const mailjet = require("node-mailjet").connect(
//   process.env.MAIL_JET_PUBLIC_KEY,
//   process.env.MAIL_JET_PRIVATE_KEY
// );
const fs = require("fs");
const path = require("path");
// const { get } = require("../routes/posts");

const encryptionKey = "57s8d30cs7";

function getIp(remoteAddress) {
  let ip = remoteAddress.split(":");
  ip = ip[ip.length - 1];
  return ip;
}

function randomString(length) {
  const string = Math.random()
    .toString(36)
    .substring(3, 3 + length)
    .toUpperCase();

  return string;
}

function encrypt(string) {
  const encrypted = btoa(cryptojs.AES.encrypt(string, encryptionKey));
  return encrypted;
}

function decrypt(string) {
  const decrypted = cryptojs.AES.decrypt(atob(string), encryptionKey).toString(
    cryptojs.enc.Utf8
  );
  return decrypted;
}

function generateCheckDigit(details, digit) {
  const generatedDigit = cdigit.luhn.generate(digit);
  const validatedDigit = cdigit.luhn.validate(generatedDigit);
  if (validatedDigit) {
    const uniqueDigit = `${details}${generatedDigit}`;
    return uniqueDigit;
  } else {
    return false;
  }
}

async function checkRedisToken(tokenDetails) {
  if (typeof tokenDetails === undefined) {
    return {
      error: "Token required",
    };
  }

  var jwtToken = "";
  if (tokenDetails.status === 1) {
    jwtToken = tokenDetails.token.token;
  } else {
    const bearer = tokenDetails.token.split(" ");
    jwtToken = bearer[1];
  }
  try {
    const client = redis.createClient();
    client.on("error", (err) => console.log("Redis Client Error", err));
    await client.connect();
    const result = await client.LRANGE("authToken", 0, 99999999);
    if (result.indexOf(jwtToken) > -1) {
      return {
        error: "Invalid Token",
      };
    } else {
      return {
        success: "Token accepted",
      };
    }
  } catch (err) {
    return err;
  }
}

async function addRedisToken(tokenDetails) {
  try {
    const client = redis.createClient();
    await client.connect();
    client.on("error", (err) => console.log("Redis Client Error", err));
    const token = tokenDetails.split(" ")[1];
    await client.lPush("authToken", token);
    return true;
  } catch (error) {
    return {
      error: error.toString(),
    };
  }
}

async function cacheUserCredentials(userCredentials) {
  try {
    const client = redis.createClient();
    await client.connect();
    await client.setEx(userCredentials[0].username, 3600, JSON.stringify(userCredentials))
    client.on("error", (err) => console.log("Redis Client Error", err));
    return true
  } catch (error) {
    return {
      error: error.toString(),
    };
  }
}

async function getCachedCredentials (userKey) {
  try {
    const client = redis.createClient();
    await client.connect();
    const cachedUser = await client.get(userKey)
    client.on("error", (err) => console.log("Redis Client Error", err));
    return {
      success: true,
      userDetails: JSON.parse(cachedUser)
    }
  } catch (error) {
    return {
      error: error.toString(),
    };
  }
}

async function validateTokenizations(tokenBearer) {
  const bearerHeader = tokenBearer;
  if (bearerHeader === undefined) {
    return {
      error: "Token is required",
      type: 401
    };
  }
  const token = await validateToken(bearerHeader);
  if (token.error) {
    return { 
      error: token.error,
      type: 403
    };
  }
  const tokenDetails = {
    token: bearerHeader,
    status: 2,
  };
  const tokenRedis = await checkRedisToken(tokenDetails);
  if (tokenRedis.error) {
    return {
      error: tokenRedis.error,
      type: 403
    };
  }
  return { success: 'Validation success' }
}

function validateToken(bearerHeader) {
  if (typeof bearerHeader === undefined) {
    return {
      error: "Token required",
    };
  }
  const jwt = require("jsonwebtoken");
  const bearerApikey = bearerHeader;
  const bearer = bearerHeader.split(" ");
  const bearerToken = bearer[1];

  try {
    //VALIDATE ACCESS KEY FIRST
    if (bearerToken === process.env.ACCESS_TOKEN) {
      return {
        success: true,
      };
    }

    //VALIDATE ACCESS KEY FIRST
    var decoded = jwt.verify(bearerToken, process.env.TOKEN);
    return {
      success: decoded != undefined,
    };
  } catch (error) {
    return {
      error: error,
    };
  }
}

module.exports = {
  getIp,
  randomString,
  encrypt,
  decrypt,
  generateCheckDigit,
  checkRedisToken,
  addRedisToken,
  validateTokenizations,
  cacheUserCredentials,
  getCachedCredentials
};
