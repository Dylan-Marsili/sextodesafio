import { Router } from 'express';
import ProductModel from '../models/Product.js'; // Asumiendo que tienes un modelo de producto

const productsRouter = Router();

productsRouter.get('/', async (req, res, next) => {
  try {
    let { limit, page, query, sort } = req.query;
    limit = parseInt(limit) || 10;
    page = parseInt(page) || 1;

    const skip = (page - 1) * limit;

    let queryObject = {};
    if (query) {
      queryObject = { $or: [{ title: { $regex: query, $options: 'i' } }, { description: { $regex: query, $options: 'i' } }] };
    }

    let sortObject = {};
    if (sort) {
      sortObject = { price: sort === 'asc' ? 1 : -1 };
    }

    const totalProducts = await ProductModel.countDocuments(queryObject);
    const totalPages = Math.ceil(totalProducts / limit);

    const products = await ProductModel.find(queryObject).skip(skip).limit(limit).sort(sortObject).exec();

    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const prevLink = hasPrevPage ? `/api/products?limit=${limit}&page=${page - 1}&query=${query}&sort=${sort}` : null;
    const nextLink = hasNextPage ? `/api/products?limit=${limit}&page=${page + 1}&query=${query}&sort=${sort}` : null;

    const result = {
      status: 'success',
      payload: products,
      totalPages,
      prevPage: page - 1,
      nextPage: page + 1,
      page,
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink,
    };

    res.json(result);
  } catch (error) {
    next(error);
  }
});

productsRouter.get('/:pid', async (req, res, next) => {
  try {
    const pid = req.params.pid;
    const product = await ProductModel.findOne({ id: pid });

    if (product) {
      res.json(product);
    } else {
      res.status(404).send('Product not found');
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.post('/', async (req, res, next) => {
  try {
    const product = new ProductModel(req.body);
    await product.save();

    res.json(product);
  } catch (error) {
    next(error);
  }
});

productsRouter.put('/:pid', async (req, res, next) => {
  try {
    const pid = req.params.pid;
    const product = await ProductModel.findOneAndUpdate({ id: pid }, req.body, { new: true });

    if (product) {
      res.json(product);
    } else {
      res.status(404).send('Product not found');
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.delete('/:pid', async (req, res, next) => {
  try {
    const pid = req.params.pid;
    const product = await ProductModel.findOneAndDelete({ id: pid });

    if (product) {
      res.send('Product deleted successfully');
    } else {
      res.status(404).send('Product not found');
    }
  } catch (error) {
    next(error);
  }
});

export default productsRouter;
