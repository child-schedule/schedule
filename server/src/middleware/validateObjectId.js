const mongoose = require('mongoose');

// Express route-param handler: rejects a malformed id with a clean 400
// instead of letting Mongoose's findById throw an uncaught CastError that
// the generic error handler would otherwise report as a raw 500.
function validateObjectId(req, res, next, value) {
  if (!mongoose.isValidObjectId(value)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  next();
}

module.exports = validateObjectId;
