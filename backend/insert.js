import fs from 'fs';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'Recipe.db');
const jsonPath = path.join(__dirname, 'US_recipes_cleaned.json');

const cleanNumber = (value) => {
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
};

const insertRecipes = async () => {
  try {
    const db = await open({ filename: dbPath, driver: sqlite3.Database });

    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    let recipes = JSON.parse(rawData);

    // If JSON is an object with numeric keys, convert to array
    if (!Array.isArray(recipes)) {
      recipes = Object.values(recipes);
    }

    for (const recipe of recipes) {
      const {
        title,
        cuisine,
        rating,
        prep_time,
        cook_time,
        total_time,
        description,
        nutrients,
        serves
      } = recipe;

      await db.run(
        `INSERT INTO recipes (title, cuisine, rating, prep_time, cook_time, total_time, description, nutrients, serves)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          cuisine,
          cleanNumber(rating),
          cleanNumber(prep_time),
          cleanNumber(cook_time),
          cleanNumber(total_time),
          description,
          JSON.stringify(nutrients),
          serves
        ]
      );
    }

    console.log('✅ All recipes inserted successfully');
  } catch (error) {
    console.error('❌ Error inserting recipes:', error.message);
  }
};

insertRecipes();
