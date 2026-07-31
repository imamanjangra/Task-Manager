import { Request, Response, NextFunction } from "express";
import { ZodTypeAny } from "zod";

type ValidateSchema = {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
};

export const validate =
  (schemas: ValidateSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as any;
      }

      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as any;
      }

      next();
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        errors: error.flatten(),
      });
    }
  };