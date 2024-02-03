// routes/views.router.js
import { Router } from 'express';
import ProductModel from '../models/Product.js';
import CartModel from '../models/Cart.js';

const viewsRouter = Router();

// GET /products
viewsRouter.get('/products', async (req, res, next) => {
  try {
    const { limit, page } = req.query;
    const perPage = parseInt(limit) || 10;
    const currentPage = parseInt(page) || 1;

    const totalProducts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalProducts / perPage);

    const products = await ProductModel.find()
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res.render('products', {
      products,
      totalPages,
      currentPage,
    });
  } catch (error) {
    next(error);
  }
});

// GET /products/:pid
viewsRouter.get('/products/:pid', async (req, res, next) => {
  try {
    const pid = req.params.pid;
    const product = await ProductModel.findById(pid);

    if (product) {
      res.render('product-details', { product });
    } else {
      res.status(404).send('Product not found');
    }
  } catch (error) {
    next(error);
  }
});

// GET /carts/:cid
viewsRouter.get('/carts/:cid', async (req, res, next) => {
  try {
    const cid = req.params.cid;
    const cart = await CartModel.findById(cid).populate('products.product', '-_id -__v');

    if (cart) {
      res.render('cart', { cart });
    } else {
      res.status(404).send('Cart not found');
    }
  } catch (error) {
    next(error);
  }
});

export default viewsRouter;
