export const validate = (schema) => (req, res, next) => {
  try {
    const validated = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    
    // Attach validated data back to req
    req.body = validated.body;
    req.query = validated.query;
    req.params = validated.params;
    
    next();
  } catch (error) {
    next(error); // Caught by errorHandler as ZodError
  }
};
