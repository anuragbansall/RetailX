import CartModel from "../models/Cart.model.js";

export const getCart = (req, res) => {
  res.send("Get cart");
};

export const addToCart = (req, res) => {
  res.send("Add to cart");
};

export const updateCartItem = (req, res) => {
  res.send("Update cart item");
};

export const deleteCartItem = (req, res) => {
  res.send("Delete cart item");
};

export const clearCart = (req, res) => {
  res.send("Clear cart");
};
