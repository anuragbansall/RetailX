import CartModel from "../models/Cart.model.js";

export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await CartModel.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    let cart = await CartModel.findOne({ userId });

    if (!cart) {
      cart = new CartModel({
        userId,
        items: [],
        totalPrice: 0,
      });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId,
    );

    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        productId,
        quantity,
      });
    }

    await cart.save();

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const itemId = req.params.id;
    const { quantity } = req.body;

    const cart = await CartModel.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId,
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    cart.items[itemIndex].quantity = quantity;

    await cart.save();

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const itemId = req.params.id;

    const cart = await CartModel.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId,
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    cart.items.splice(itemIndex, 1);

    await cart.save();
    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await CartModel.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ message: "Server error" });
  }
};
