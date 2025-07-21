const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const users = []; // This is a dummy database. Replace it with a real database like MongoDB or MySQL.

app.use(bodyParser.json());

// Sign up route
app.post('/signup', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store user data
    users.push({
        firstName,
        lastName,
        email,
        password: hashedPassword
    });

    res.status(201).send('User created');
});

// Login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email);
    if (!user) return res.status(400).send('User not found');

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).send('Invalid password');

    const token = jwt.sign({ email: user.email }, 'your_jwt_secret');
    res.status(200).send({ token });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
