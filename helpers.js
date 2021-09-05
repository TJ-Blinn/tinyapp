
// function returns the URLs where the userID is equal to the id of the currently logged-in user.
const urlsForUser = function (id, urlDb) {
// urlDb === urlDatabase added as 2nd argument here. It is calling on the urlDabase from the express_sever file,
// containing dyniamically added urls from browser.
// Accessing what is passed into when Ic all the function.
  
  const userURLS = {};
  const keys = Object.keys(urlDb);
  
  for (const key of keys) {
    if (urlDb[key].userID === id) {
      userURLS[key] = urlDb[key]; // assigning key value pair into our empty object | value of the key becomes the value inside urlDatabase
    }
  }
  //console.log("ID++++++++++++++", id);
  return userURLS;
};

// 5 character string composed of characters picked randomly for shortURL
const generateRandomString = function (length) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

// email verification function || check at point of registration and loggin in
const getUserByEmail = (email, users) => {
  for (const key in users) {
    if (users[key].email === email) {
      return users[key]; // user object
    }
  }
  return false;
};

// ------------------5 character string composed of characters picked randomly for userID
const generateUserID = function (length) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

module.exports = {getUserByEmail, urlsForUser, generateRandomString, generateUserID };