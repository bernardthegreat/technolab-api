const sql = require("mssql");
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

module.exports = {
  getIp,
  randomString,
  encrypt,
  decrypt
};
