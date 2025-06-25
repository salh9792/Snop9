const express = require("express");
const dotenv = require("dotenv");
const fs = require('fs');
dotenv.config();

const app = express();
app.use(express.json());

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Read users from users.json
const usersFilePath = './users.json';
let users = [];

try {
  const usersData = fs.readFileSync(usersFilePath, 'utf8');
  users = JSON.parse(usersData);
} catch (err) {
  console.error('Error reading users.json:', err);
}

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    res.status(200).json({ message: 'Login successful', user: { username: user.username } });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Register endpoint
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const existingUser = users.find(u => u.username === username);
  if (existingUser) {
    return res.status(409).json({ message: 'Username already exists' });
  }

  const newUser = { username, password };
  users.push(newUser);

  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
    res.status(201).json({ message: 'User registered successfully', user: { username: newUser.username } });
  } catch (err) {
    console.error('Error writing to users.json:', err);
    res.status(500).json({ message: 'Error registering user' });
  }
});

app.get("/:name", (req, res) => {
  const { name } = req.params;
  res.status(200).send(`Name: ${name}`);
});

app.get("/", (req, res) => {
  res.send(`App is working fine`);
});

app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
});


