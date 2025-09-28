const express = require('express')
const router = express.Router()
const db = require('../db')

router.use((req, res, next) => {
  console.log('📥 Incoming request:', req.method, req.url)
  next()
})

// GET all categories
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM categories ORDER BY id DESC')
    res.json(result.rows)
  } catch (err) {
    console.error('❌ Fetch categories error:', err)
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

// POST create category
router.post('/', async (req, res) => {
  console.log('📥 Incoming POST /categories:', req.body)

  const { name } = req.body
  if (!name) return res.status(400).json({ error: 'Name is required' })

  try {
    const result = await db.query(
      'INSERT INTO categories (name) VALUES ($1) RETURNING *',
      [name]
    )
    res.json({ success: true, category: result.rows[0] })
  } catch (err) {
    console.error('❌ Create category error:', err)
    res.status(500).json({ error: 'Failed to create category' })
  }
})

// PUT update category
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { name } = req.body
  if (!name) return res.status(400).json({ error: 'Name is required' })

  try {
    await db.query('UPDATE categories SET name = $1 WHERE id = $2', [name, id])
    res.json({ success: true, updated: { id, name } })
  } catch (err) {
    console.error('❌ Update category error:', err)
    res.status(500).json({ error: 'Failed to update category' })
  }
})

// DELETE category
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    await db.query('DELETE FROM categories WHERE id = $1', [id])
    res.json({ success: true, deletedId: id })
  } catch (err) {
    console.error('❌ Delete category error:', err)
    res.status(500).json({ error: 'Failed to delete category' })
  }
})

module.exports = router