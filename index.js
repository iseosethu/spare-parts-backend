const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static('uploads'))

const ordersRouter = require('./routes/orders')
app.use('/orders', ordersRouter)

const productsRouter = require('./routes/products')
app.use('/products', productsRouter)

// Routes
app.use('/categories', require('./routes/categories'));
//app.use('/products', require('./routes/products'));
//app.use('/orders', require('./routes/orders'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));