const express = require('express')
const router = express.Router()
const db = require('../db')
const multer = require('multer')
const path = require('path')

// Setup multer for image uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})
const upload = multer({ storage })

// GET all products
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM products')
    res.json(result.rows)
  } catch (err) {
    console.error('❌ Fetch all error:', err)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// GET single product by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const result = await db.query('SELECT * FROM products WHERE id = $1', [id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.json(result.rows[0])
  } catch (err) {
    console.error('❌ Fetch single error:', err)
    res.status(500).json({ error: 'Failed to fetch product' })
  }
})

// POST create new product
router.post('/', async (req, res) => {
  const { name, stock, price, category_id, image_url } = req.body
  if (!name || stock == null || price == null || category_id == null) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const result = await db.query(
      'INSERT INTO products (name, stock, price, category_id, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, stock, price, category_id, image_url || '']
    )
    res.json({ success: true, product: result.rows[0] })
  } catch (err) {
    console.error('❌ Create error:', err)
    res.status(500).json({ error: 'Failed to create product' })
  }
})

// PUT update product by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { stock, price, category_id } = req.body

  if (stock == null || price == null || category_id == null) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    await db.query(
      'UPDATE products SET stock = $1, price = $2, category_id = $3 WHERE id = $4',
      [stock, price, category_id, id]
    )

    res.json({
      success: true,
      updatedProduct: { id, stock, price, category_id }
    })
  } catch (err) {
    console.error('❌ Update error:', err)
    res.status(500).json({ error: 'Failed to update product' })
  }
})

// DELETE product by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    await db.query('DELETE FROM products WHERE id = $1', [id])
    res.json({ success: true, deletedId: id })
  } catch (err) {
    console.error('❌ Delete error:', err)
    res.status(500).json({ error: 'Failed to delete product' })
  }
})

// POST image upload
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }
  res.json({ success: true, filename: req.file.filename })
})

module.exports = router