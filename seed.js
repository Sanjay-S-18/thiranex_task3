require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const connectDB = require('../config/db');

// Connect to Database
connectDB();

const seedData = async () => {
  try {
    // Clear existing data
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log('Existing data cleared...');

    // Hash passwords for seed users
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const userPassword = await bcrypt.hash('sanjay123', salt);

    // Create Users
    const users = await User.insertMany([
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: adminPassword,
        role: 'admin',
      },
      {
        name: 'Sanjay',
        email: 'sanjay@example.com',
        password: userPassword,
        role: 'user',
      },
    ]);

    const adminUser = users[0]._id;

    // Create Products
    const products = [
      {
        name: 'Quantum X Pro Wireless Mouse',
        image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        description: 'Ultra-lightweight gaming mouse with 26,000 DPI sensor, dual-mode wireless connectivity, and customizable RGB lighting. Perfect for high-intensity work and play.',
        category: 'Electronics',
        price: 89.99,
        countInStock: 25,
      },
      {
        name: 'Apex mechanical Keyboard V2',
        image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        description: 'Compact 75% mechanical keyboard featuring hot-swappable linear yellow switches, double-shot PBT keycaps, and pre-lubed stabilizers for an exquisite typing experience.',
        category: 'Electronics',
        price: 129.99,
        countInStock: 15,
      },
      {
        name: 'AeroSound Pro ANC Headphones',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        description: 'Premium over-ear wireless headphones with active noise cancellation, high-resolution audio support, and up to 45 hours of continuous battery life.',
        category: 'Audio',
        price: 199.99,
        countInStock: 10,
      },
      {
        name: 'OmniWatch Active Smartwatch',
        image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        description: 'Sleek smart wearable equipped with AMOLED screen, multi-sport activity tracking, 24/7 heart rate monitor, sleep analysis, and GPS capability.',
        category: 'Wearables',
        price: 149.99,
        countInStock: 18,
      },
      {
        name: 'UltraWide Curved 34-inch Monitor',
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        description: 'Immersive curved monitor with 3440 x 1440 WQHD resolution, 144Hz refresh rate, HDR10 capabilities, and dual HDMI and DisplayPort inputs.',
        category: 'Electronics',
        price: 499.99,
        countInStock: 8,
      },
      {
        name: 'Minimalist Walnut Desk Organizer',
        image: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        description: 'Handcrafted premium American walnut organizer with dedicated channels for phone docking, pen storage, and tray sections for small office accessories.',
        category: 'Office',
        price: 45.00,
        countInStock: 40,
      },
    ];

    await Product.insertMany(products);

    console.log('Seed data imported successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error with seeding data: ${error.message}`);
    process.exit(1);
  }
};

seedData();
