import type { Request, Response, NextFunction } from "express";
import type { ObjectSchema } from "joi";

const validate = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body ?? {}, {
      abortEarly: false, // collect all errors not just the first
      stripUnknown: true, // remove fields not in the schema
    });
    if (error) {
      const errors = error.details.map((d) => d.message);
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    req.body = value; // replace the req.body with the clean/validated version
    next();
  };
};

export default validate;
