// Validates req.body against a Zod schema and replaces it with the parsed data.
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Invalid input",
        details: result.error.flatten().fieldErrors,
      });
    }
    req.body = result.data;
    next();
  };
}

module.exports = validate;
