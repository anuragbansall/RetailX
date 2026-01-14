import { config } from "../config/index.js";

export const setAuthCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "Strict", // TODO: Set to "Lax" if you need cross-site / cross-port requests
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const clearAuthCookie = (res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "Strict", // TODO: Set to "Lax" if you need cross-site / cross-port requests
  });
};
