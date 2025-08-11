 function generateUniqueCode() {
  // Generate a random 6-digit number
  const randomNumber = Math.floor(100000 + Math.random() * 900000);

  // Return the generated code with the "RES_" prefix
  return randomNumber;
}

module.exports = { generateUniqueCode };
