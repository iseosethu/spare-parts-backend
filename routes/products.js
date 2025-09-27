const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all products
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// PUT update a product by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { stock, price, category_id } = req.body;

  if (stock == null || price == null || category_id == null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await db.query(
      'UPDATE products SET stock = $1, price = $2, category_id = $3 WHERE id = $4',
      [stock, price, category_id, id]
    );

    res.json({
      success: true,
      updatedProduct: { id, stock, price, category_id }
    });
  } catch (err) {
    console.error('❌ Update error:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

module.exports = router;