const pg = require('pg');

const bcrypt = require('bcrypt');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors')

const port=3000;

const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});


console.log("Connecting...:")

// Configureren van CORS om alleen toegang toe te staan van de frontend (localhost:8080)
const corsOptions = {
  origin: 'http://localhost:8080', // Toegestane frontend
  methods: ['GET', 'POST'], // Specificeer toegestane HTTP-methoden
  allowedHeaders: ['Content-Type'], // Specificeer toegestane headers
};

app.use(cors());
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

// Voorbeeld van een register of update methode
bcrypt.hash(password, 10, (err, hashedPassword) => {
  if (err) throw err;
  // Opslaan in de database
  const query = 'INSERT INTO users (user_name, password) VALUES ($1, $2)';
  const values = [username, hashedPassword];
  pool.query(query, values, (error, results) => {
      if (error) {
          throw error;
      }
      response.status(201).send('User registered');
  });
});


app.get('/authenticate/:username/:password', async (request, response) => {
  const username = request.params.username;
  const password = request.params.password;

  const query = 'SELECT * FROM users WHERE user_name=$1';
  const values = [username];

  pool.query(query, values, (error, results) => {
      if (error) {
          throw error;
      }

      if (results.rows.length > 0) {
          const user = results.rows[0];
          // Vergelijk het ingevoerde wachtwoord met de gehashte versie in de database
          bcrypt.compare(password, user.password, (err, isMatch) => {
              if (err) throw err;
              if (isMatch) {
                  response.status(200).json(user);
              } else {
                  response.status(401).send('Invalid credentials');
              }
          });
      } else {
          response.status(401).send('Invalid credentials');
      }
  });
});



app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})

