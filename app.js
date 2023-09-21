const express = require('express');
const app = express();
const port = 5500; 
const bcrypt= require("bcrypt")
const jwt= require("jsonwebtoken")
const User= require("./models/user")
// Create a simple endpoint
app.get('/', (req, res) => {
  res.send('Welcome to Masai Library Backend!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://rohit:rohit@cluster0.kfl5wyg.mongodb.net/masai?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


app.post('/api/register', async (req, res) => {
    try {
      const { name, email, password } = req.body;
  
      // Check if the user with the given email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      // Hash the password before storing it
      const hashedPassword = await bcrypt.hash(password, 6);
  
      // Create a new user
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        isAdmin: false,
      });
  
      await newUser.save();
      res.status(201).json({ message: 'User registered ' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


  // login end point
  app.post('/api/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      // Compare the provided password with the hashed password in the database
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      // Create a JWT token
      const token = jwt.sign({ userId: user._id }, JWT_SECRET);
  
      res.status(200).json({ token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // List all available books
app.get('/api/books', async (req, res) => {
    try {
      const books = await Book.find();
      res.status(200).json(books);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Retrieve details of a specific book by ID
  app.get('/api/books/:id', async (req, res) => {
    try {
      const book = await Book.findById(req.params.id);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      res.status(200).json(book);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  
  // Filter books by category
app.get('/api/books', async (req, res) => {
    try {
      const { category, author } = req.query;
      const filters = {};
      if (category) {
        filters.category = category;
      }
      if (author) {
        filters.author = author;
      }
      const books = await Book.find(filters);
      res.status(200).json(books);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  
  // Add a new book (Protected Route)
app.post('/api/books', async (req, res) => {
    // Implement authentication to check if the user is an admin (JWT)
    
    try {
      const { title, author, category, price, quantity } = req.body;
  
      const newBook = new Book({
        title,
        author,
        category,
        price,
        quantity,
      });
  
      await newBook.save();
      res.status(201).json({ message: 'Book added successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Update a specific book by ID (Protected Route)
app.put('/api/books/:id', async (req, res) => {
    // Implement authentication to check if the user is an admin (JWT)
   
    try {
      const { title, author, category, price, quantity } = req.body;
  
      const updatedBook = await Book.findByIdAndUpdate(
        req.params.id,
        {
          title,
          author,
          category,
          price,
          quantity,
        },
        { new: true }
      );
  
      if (!updatedBook) {
        return res.status(404).json({ message: 'Book not found' });
      }
  
      res.status(204).end();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Delete a specific book by ID (Protected Route)


  app.delete('/api/books/:id', async (req, res) => {
    // Implement authentication to check if the user is an admin (JWT)

    try {
      const deletedBook = await Book.findByIdAndDelete(req.params.id);
  
      if (!deletedBook) {
        return res.status(404).json({ message: 'Book not found' });
      }
  
      res.status(202).json({ message: 'Book deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

// Place an order (Protected Route)
app.post('/api/order', async (req, res) => {
    // Implement authentication to check if the user is logged in (JWT)
    
    try {
      const { userId, books, totalAmount } = req.body;
  
      const newOrder = new Order({
        user: userId,
        books,
        totalAmount,
      });
  
      await newOrder.save();
      res.status(201).json({ message: 'Order placed successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  

  // View all orders with user and book details (Protected Route)
app.get('/api/orders', async (req, res) => {
    // Implement authentication to check if the user is an admin (JWT)
   
    try {
      const orders = await Order.find().populate('user').populate('books');
      res.status(200).json(orders);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  
  
  
  
  
  
