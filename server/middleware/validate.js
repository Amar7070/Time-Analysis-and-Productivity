import { z } from "zod";

const validate = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    return next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return res.status(422).json({
        success: false,
        message: "Validation Error",
        errors: formattedErrors,
      });
    }
    return res.status(500).json({ success: false, message: "Server Error during validation" });
  }
};

export default validate;
