
module.exports = function validateToken(bearerHeader) {

  if (typeof bearerHeader === undefined) {
    return {
      error: 'Token required'
    };
  }
  
  const jwt = require("jsonwebtoken");
  const bearerApikey=bearerHeader;
  const bearer=bearerHeader.split(' ');
  const bearerToken=bearer[1];
  
  try {
    
    //VALIDATE ACCESS KEY FIRST
    if (bearerToken===process.env.ACCESS_TOKEN){
      return {
        success: true
      }
    }

    //VALIDATE ACCESS KEY FIRST
    var decoded = jwt.verify(bearerToken, process.env.TOKEN);  
    return {
      success: decoded != undefined
    }

  } catch (error) {
    return {
      error: error,
      
    };
  }
};