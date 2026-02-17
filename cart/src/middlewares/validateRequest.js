import { validationResult } from "express-validator";

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const raw = errors.array();
    const normalized = raw.map((e) => ({
      // express-validator v7 uses `path`; older versions used `param`.
      // Normalize to ensure tests expecting `param` succeed.
      param: e.param ?? e.path,
      msg: e.msg,
      value: e.value,
      location: e.location,
    }));

    return res.status(400).json({
      message: "Validation failed",
      errors: normalized,
    });
  }

  next();
};

export default validateRequest;
