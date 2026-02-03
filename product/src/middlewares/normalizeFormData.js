export default function normalizeFormData(req, res, next) {
  const contentType = req.headers["content-type"] || "";
  const isMultipart = contentType.includes("multipart/form-data");

  if (!isMultipart) {
    return next();
  }

  const coerceValue = (val) => {
    if (typeof val !== "string") return val;
    const trimmed = val.trim();

    // Try JSON for objects/arrays
    if (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))
    ) {
      try {
        return JSON.parse(trimmed);
      } catch (_) {
        /* ignore */
      }
    }

    // Booleans
    if (trimmed.toLowerCase() === "true") return true;
    if (trimmed.toLowerCase() === "false") return false;

    // Numbers
    if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) {
      const num = Number(trimmed);
      if (!Number.isNaN(num)) return num;
    }

    return val;
  };

  const setNested = (obj, path, value) => {
    const parts = path.split(".");
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      const key = parts[i];
      if (cur[key] == null || typeof cur[key] !== "object") {
        cur[key] = {};
      }
      cur = cur[key];
    }
    cur[parts[parts.length - 1]] = value;
  };

  const body = req.body || {};
  const newBody = { ...body };

  // Move dotted keys into nested objects and coerce types
  Object.keys(body).forEach((key) => {
    const val = coerceValue(body[key]);
    if (key.includes(".")) {
      setNested(newBody, key, val);
      delete newBody[key];
    } else {
      newBody[key] = val;
    }
  });

  req.body = newBody;
  next();
}
