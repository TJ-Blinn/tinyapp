const { assert } = require('chai');
const getUserByEmail = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user ID with valid email input', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = testUsers["userRandomID"];
    // console.log(user);
    // Write your assert statement here
    assert.deepEqual(user,expectedOutput);

  });
  it('should return false if no email found', function() {
    const user = getUserByEmail("1@1.com", testUsers); // User is equal to the RETURN of the function | compare return from function to expected output
    const expectedOutput = false;
    // console.log(user);
    // console.log(expectedOutput);
    assert.strictEqual(user,expectedOutput);
  });
});
// => npm test