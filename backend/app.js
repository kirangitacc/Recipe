import express from 'express';
import cors from 'cors';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'recipe.db');

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3001, () => {
      console.log('Recipe server running at http://localhost:3001');
    });
  } catch (e) {
    console.error(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const tokenAuthentication = (request, response, next) => {
  const authHeader = request.headers['authorization'];
  const jwtToken = authHeader?.split(' ')[1];
  if (!jwtToken) return response.status(401).send('Invalid JWT Token');

  jwt.verify(jwtToken, 'RECIPE_SECRET', (error, payload) => {
    if (error) return response.status(401).send('Invalid JWT Token');
    next();
  });
};


app.get('/api/recipes', async (request, response) => {
  const page = parseInt(request.query.page) || 1;
  const limit = parseInt(request.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const totalQuery = `SELECT COUNT(*) AS count FROM recipes`;
    const totalResult = await db.get(totalQuery);
    const total = totalResult.count;

    const query = `
      SELECT * FROM recipes
      ORDER BY rating DESC
      LIMIT ? OFFSET ?
    `;
    const recipes = await db.all(query, [limit, offset]);

    response.json({ page, limit, total, data: recipes });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    response.status(500).send('Internal Server Error');
  }
});

app.get('/api/recipes/search', async (request, response) => {
  const { title, cuisine, rating, total_time, calories } = request.query;
  console.log('Search parameters:', { title, cuisine, rating, total_time, calories });

  let conditions = [];
  let values = [];

  // Title: partial match, case-insensitive
  if (title) {
    conditions.push(`LOWER(title) LIKE ?`);
    values.push(`%${title.toLowerCase()}%`);
  }

  // Cuisine: partial match, case-insensitive
  if (cuisine) {
    conditions.push(`LOWER(cuisine) LIKE ?`);
    values.push(`%${cuisine.toLowerCase()}%`);
  }

  // Rating: supports >=, <=, >, <, =
  if (rating) {
    const match = rating.match(/(>=|<=|=|>|<)(\d+(\.\d+)?)/);
    if (match) {
      conditions.push(`rating ${match[1]} ?`);
      values.push(parseFloat(match[2]));
    }
  }

  // Total Time: supports >=, <=, >, <, =
  if (total_time) {
    const match = total_time.match(/(>=|<=|=|>|<)(\d+)/);
    if (match) {
      conditions.push(`total_time ${match[1]} ?`);
      values.push(parseInt(match[2]));
    }
  }

  // Calories: extracted from JSON, supports >=, <=, >, <, =
  if (calories) {
    const match = calories.match(/(>=|<=|=|>|<)(\d+)/);
    if (match) {
      conditions.push(`CAST(json_extract(nutrients, '$.calories') AS INTEGER) ${match[1]} ?`);
      values.push(parseInt(match[2]));
    }
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const query = `SELECT * FROM recipes ${whereClause}`;

  try {
    const results = await db.all(query, values);
    console.log('Search results:', results);
    response.json({ data: results });
  } catch (error) {
    console.error('Search error:', error);
    response.status(500).send('Internal Server Error');
  }
});


export default app;
