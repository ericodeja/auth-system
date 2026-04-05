import type { Request, Response, NextFunction } from "express";
import type { ObjectSchema } from "joi";
import HttpError from "../utils/http-error.utils";

const validate = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body ?? {}, {
      abortEarly: false, // collect all errors not just the first
      stripUnknown: true, // remove fields not in the schema
    });
    if (error) {
      const errors = error.details.map((d) => d.message);
      return next(new HttpError(400, errors.join(", ")));
    }

    req.body = value; // replace the req.body with the clean/validated version
    next();
  };
};

export default validate;
