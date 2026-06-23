const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Express route-param handler: every schedule route takes :date as a
// "YYYY-MM-DD" string (per the schema) — reject anything else with a clean
// 400 instead of silently creating/querying a schedule keyed on garbage input.
function validateDateParam(req, res, next, value) {
  if (!DATE_PATTERN.test(value)) {
    return res.status(400).json({ error: 'date must be in YYYY-MM-DD format' });
  }
  next();
}

module.exports = validateDateParam;
