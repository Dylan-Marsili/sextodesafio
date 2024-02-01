// routes/carts.router.js
import { Router } from 'express';
import CartModel from '../models/Cart';
import ProductModel from '../models/Product';

const cartsRouter = Router();

// POST /api/carts
cartsRouter.post('/', async (req, res, next) => {
  try {
    const cart = await CartModel.create({ products: [] });
    res.json(cart);
  } catch (error) {
    next(error);
  }
});

// GET /api/carts/:cid
cartsRouter.get('/:cid', async (req, res, next) => {
  try {
    const cid = req.params.cid;

    const cart = await CartModel.findById(cid).populate('products.product', '-_id -__v');

    if (cart) {
      res.json(cart.products);
    } else {
      res.status(404).send('Cart not found');
    }
  } catch (error) {
    next(error);
  }
});

// DELETE /api/carts/:cid/products/:pid
cartsRouter.delete('/:cid/products/:pid', async (req, res, next) => {
  try {
    const { cid, pid } = req.params;

    const cart = await CartModel.findById(cid);

    if (cart) {
      cart.products = cart.products.filter((product) => product.product.toString() !== pid);
      await cart.save();
      res.json(cart);
    } else {
      res.status(404).send('Cart not found');
    }
  } catch (error) {
    next(error);
  }
});

// PUT /api/carts/:cid
cartsRouter.put('/:cid', async (req, res, next) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;

    const cart = await CartModel.findById(cid);

    if (cart) {
      cart.products = products;
      await cart.save();
      res.json(cart);
    } else {
      res.status(404).send('Cart not found');
    }
  } catch (error) {
    next(error);
  }
});

// PUT /api/carts/:cid/products/:pid
cartsRouter.put('/:cid/products/:pid', async (req, res, next) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    const cart = await CartModel.findById(cid);

    if (cart) {
      const product = cart.products.find((p) => p.product.toString() === pid);

      if (product) {
        product.quantity = quantity;
        await cart.save();
        res.json(cart);
      } else {
        res.status(404).send('Product not found in the cart');
      }
    } else {
      res.status(404).send('Cart not found');
    }
  } catch (error) {
    next(error);
  }
});

// DELETE /api/carts/:cid
cartsRouter.delete('/:cid', async (req, res, next) => {
  try {
    const { cid } = req.params;

    const cart = await CartModel.findById(cid);

    if (cart) {
      cart.products = [];
      await cart.save();
      res.json(cart);
    } else {
      res.status(404).send('Cart not found');
    }
  } catch (error) {
    next(error);
  }
});

export default cartsRouter;
