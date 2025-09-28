const express = require('express')
const router = express.Router()
const db = require('../db')

router.post('/', async (req, res) => {
  const { name, address, phone, cart } = req.body

  if (!name || !address || !phone || !Array.isArray(cart)) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  try {
    const result = await db.query(
      'INSERT INTO orders (customer_name, address, phone, items, total) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, address, phone, JSON.stringify(cart), total]
    )
    res.json({ success: true, order: result.rows[0] })
  } catch (err) {
    console.error('❌ Order placement error:', err)
    res.status(500).json({ error: 'Failed to place order' })
  }
})

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM orders ORDER BY created_at DESC')
    res.json(result.rows)
  } catch (err) {
    console.error('❌ Fetch orders error:', err)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

router.put('/:id/status', async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  try {
    await db.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id])
    res.json({ success: true })
  } catch (err) {
    console.error('❌ Status update error:', err)
    res.status(500).json({ error: 'Failed to update status' })
  }
})

router.get('/category-demand', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.name AS category, SUM((item->>'quantity')::int) AS total_ordered
      FROM orders o,
           jsonb_array_elements(o.items) AS item
      JOIN products p ON (item->>'id')::int = p.id
      JOIN categories c ON p.category_id = c.id
      GROUP BY c.name
      ORDER BY total_ordered DESC
    `)
    res.json(result.rows)
  } catch (err) {
    console.error('❌ Failed to fetch category demand:', err)
    res.status(500).json({ error: 'Demand fetch failed' })
  }
})


module.exports = router