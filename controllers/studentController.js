const { request } = require("express");
const sql=require("mssql");
const dbcontext=require("../config/database");
const validateToken = require('../middleware/validateToken.js');
const path = require('path')
const fs = require('fs')

module.exports.studentinfo_get = (req, res) => { 

  const bearerHeader=req.headers["authorization"];
  if (bearerHeader===undefined){
      res.status(401).send({ error: "Token is required" });
      return   
  }
  const token = validateToken(bearerHeader)
  if (token.error) {
    res.status(403).send({ error: token.error });
    return
  }

  const sn=req.params.sn
  void (async function () {
    try {
        
      //const t =await sql.connect(dbcontext);
        await sql.connect(dbcontext.sqlConfig);
        const sqlQuery = `exec [UE DATABASE].dbo.Usp_API_GetStudent '${sn}',''`;
        const result = await sql.query(sqlQuery);
        
        if (result.recordsets.length>0){
          res.status(200).send(result.recordsets);
        }
        else{
          res.status(404).send({ error: "Record not found" });
        }
        sql.close();

    } catch (error) {
        res.status(404).send({ error });
    }
  })();
}

module.exports.studentregistration_get=(req, res) => {
  const bearerHeader=req.headers["authorization"];
  if (bearerHeader===undefined){
      res.status(401).send({ error: "Token is required" });
      return   
  }
  const token = validateToken(bearerHeader)
  if (token.error) {
    res.status(403).send({ error: token.error });
    return
  }
    
  res.send('studentregistration');
}

module.exports.studentload_get=(req, res) =>{
  const bearerHeader=req.headers["authorization"];
  if (bearerHeader===undefined){
      res.status(401).send({ error: "Token is required" });
      return   
  }
  const token = validateToken(bearerHeader)
  if (token.error) {
    res.status(403).send({ error: token.error });
    return
  }

    const {sn,semester}=req.body;
    res.send('studentload');
}
module.exports.studentform9_get=(req, res) =>{

    try {
        const {sn}=req.body;
        res.send('studentform9');    
    } catch (error) {
        const err={ message : 'bad request'}
        res.status(400).send(err);
    }
    
}

module.exports.studentgrades_get=(req, res) =>{
  const bearerHeader=req.headers["authorization"];
  if (bearerHeader===undefined){
      res.status(401).send({ error: "Token is required" });
      return   
  }
  const token = validateToken(bearerHeader)
  if (token.error) {
    res.status(403).send({ error: token.error });
    return
  }


  const sn=req.params.sn;
  void (async function () {
    try {
        
      //const t =await sql.connect(dbcontext);
        await sql.connect(dbcontext.sqlConfig);
        const sqlQuery = `exec [UE database]..Usp_jf_GetFormIX2 '','${sn}','','','','','','','','','','','',0,'WEB'`;
        const result = await sql.query(sqlQuery);
        
        if (result.recordsets.length>0){
          res.status(200).send(result.recordsets);
        }
        sql.close();

    } catch (error) {
        res.status(404).send({ error });
    }
  })();
}

module.exports.student_academic_records_get=(req, res) => {
  const bearerHeader=req.headers["authorization"];
  if (bearerHeader===undefined){
      res.status(401).send({ error: "Token is required" });
      return   
  }
  const token = validateToken(bearerHeader)
  if (token.error) {
    res.status(403).send({ error: token.error });
    return
  }
    
  void (async function () {
    var sqlWhere = ''
    
    if (req.query.getAll) {
      sqlWhere = 'where convert(date, DateTimeCreated) >= DATEADD(day,-30, getdate()) and convert(date, DateTimeCreated) <= getdate()'
    } else {
      sqlWhere = `where ReferenceNumber = '${req.query.referenceID}'`
    }

    try {
      //const t =await sql.connect(dbcontext);
      await sql.connect(dbcontext.sqlConfig);
      const sqlQuery = `select 
        * from
      OnlinePayments..AcademicRecordsRequests
      ${sqlWhere}`;
      console.log(sqlQuery)
      const result = await sql.query(sqlQuery);
      
      if (result.recordsets.length>0){
        res.status(200).send(result.recordsets);
      }
      else{
        res.status(404).send({ error: "Record not found" });
      }
      sql.close();

    } catch (error) {
        res.status(404).send({ error });
    }
  })();
}

module.exports.student_request_academic_records_post = (req, res) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  
  const folder = path.join(__dirname, '../uploads/academic-records')
  void (async function () {
    try {
      // await sql.connect(sqlConfig);
      // const sqlQuery = `exec student request`;
      // const result = await sql.query(sqlQuery);
      // // sql.close();
      // res.send(result.recordset);
      // const result = result.recordset.length
      const result = 1
      if (result > 0) {
        const form = new formidable.IncomingForm()
        form.uploadDir = folder
        var requestID = '0000001'
        form.parse(req, (_, fields, files) => {
          // console.log('\n-----------')
          // console.log('Fields', fields)
          // lastname = fields.lastname
          // console.log('Received:', Object.keys(files))
          // console.log()
          res.send('Thank you')
          return fields.lastname
        })
        form.on('file', function(field, file) {
          const date = new Date()
          const year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date)
          const month = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(date)
          const day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date)
          const formattedDate = `${year}${month}${day}`;
          fs.rename(file.path, form.uploadDir + "/" + `${formattedDate}_${requestID}_${file.name}`, (err) => {
            if (err) throw err;
          });
        });
      }
    } catch (error) {
      res.send({ error });
    }
  })();
}

module.exports.studentTransac_get = (req, res) => { 

  const bearerHeader=req.headers["authorization"];
  if (bearerHeader===undefined){
      res.status(401).send({ error: "Token is required" });
      return   
  }
  const token = validateToken(bearerHeader)
  if (token.error) {
    res.status(403).send({ error: token.error });
    return
  }

  const sn=req.body.studID
  console.log(req)
  void (async function () {
    try {
      console.log(sn)
        
      //const t =await sql.connect(dbcontext);
        await sql.connect(dbcontext.sqlConfig);
        const sqlQuery = `exec [myUERM].dbo.GenerateStudBal '${sn}'`;
        const result = await sql.query(sqlQuery);
        
        if (result.recordsets.length>0){
          res.status(200).send(result.recordsets);
        }
        else{
          res.status(404).send({ error: "Record not found" });
        }
        sql.close();

    } catch (error) {
        res.status(404).send({ error });
    }
  })();
}

module.exports.studentPayment_get = (req, res) => { 

  const bearerHeader=req.headers["authorization"];
  if (bearerHeader===undefined){
      res.status(401).send({ error: "Token is required" });
      return   
  }
  const token = validateToken(bearerHeader)
  if (token.error) {
    res.status(403).send({ error: token.error });
    return
  }

  const sn=req.body.studID

  void (async function () {
    try {
      //const t =await sql.connect(dbcontext);
        await sql.connect(dbcontext.sqlConfig);
        var sqlQuery = `SELECT ISNULL(CONVERT(varchar,r.TransDate,1),'') as Transdate, payeeid,transactionid,`;
              sqlQuery += `currency+REPLACE(CONVERT(VARCHAR,CONVERT(MONEY, amount),1), '.00','') + ' '  AS amount,isnull(decision,'') decision,ISNULL(message,'')  `;
              sqlQuery += `FROM ONLINEPAYMENTS..PaymentOrders po WITH (NOLOCK) `;
              sqlQuery += `LEFT JOIN ONLINEPAYMENTS..Payments_OrdersResponse r `;
              sqlQuery += `WITH (NOLOCK) ON po.Transaction_UUID=r.req_transaction_uuid `;
              sqlQuery += `LEFT JOIN ONLINEPAYMENTS..[PaymentOrderType] pt `;
              sqlQuery += `ON po.paymentordertype=pt.paymentordertypeid `;
              sqlQuery += `WHERE payeeid = '${sn}'`;

        const result = await sql.query(sqlQuery);
        
        if (result.recordsets.length>0){
          res.status(200).send(result.recordsets[0]);
        }
        else{
          res.status(404).send({ error: "Record not found" });
        }
        sql.close();

    } catch (error) {
        res.status(404).send({ error });
    }
  })();
}