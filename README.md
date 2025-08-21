# Recipe App

A full-stack web application for browsing, searching, and viewing recipes.

---

vercel-https://recipe-git-main-kiran-kumar-gangisettys-projects.vercel.app/

---

## Project Structure

```
backend/
  app.js                # Express server and API endpoints
  insert.js             # Script to insert recipes into SQLite database
  Recipe.db             # SQLite database file
  US_recipes_cleaned.json # Cleaned recipe data
  schema.sql            # SQL schema for database
frontend/
  package.json          # Frontend dependencies
  src/
    components/
      RecipeTable/      # Recipe table and details UI
    App.js              # Main React component
```

---

## Backend

### 1. Database Setup

- **SQL Schema:**  
  Create a file named `schema.sql` with the following content:

    ````sql
    -- filepath: backend/schema.sql
    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      cuisine TEXT,
      rating REAL,
      prep_time INTEGER,
      cook_time INTEGER,
      total_time INTEGER,
      description TEXT,
      nutrients TEXT,
      serves INTEGER
    );
    ````

- **Setup Instructions:**
  1. Install dependencies:
      ```sh
      cd backend
      npm install
      ```
  2. Create the database and table:
      ```sh
      sqlite3 Recipe.db < schema.sql
      ```
  3. Insert data:
      ```sh
      node insert.js
      ```

### 2. API Endpoints

- **GET /api/recipes**  
  Returns paginated list of recipes.  
  Query params: `page`, `limit`

- **GET /api/recipes/search**  
  Search recipes by title, cuisine, rating.  
  Query params: `title`, `cuisine`, `rating`

### 3. API Testing

- **Example Request:**
    ```sh
    curl "http://localhost:3001/api/recipes?page=1&limit=15"
    curl "http://localhost:3001/api/recipes/search?cuisine=South"
    ```

- **Sample Response:**
    ```json
    {
      "data": [
        {
          "id": 1,
          "title": "South Indian Dosa",
          "cuisine": "South",
          "rating": 4.5,
          "prep_time": 15,
          "cook_time": 10,
          "total_time": 25,
          "description": "A crispy rice pancake.",
          "nutrients": "{\"calories\":120,\"proteinContent\":3}",
          "serves": 2
        }
      ],
      "total": 1
    }
    ```

---

## Frontend (UI)

### Features

- Fetches recipes from RESTful API and renders in a table:
  - **Title** (truncated if too long)
  - **Cuisine**
  - **Rating** (star icons)
  - **Total Time**
  - **Serves**
- Clicking a row opens a right-side drawer with:
  - Title and Cuisine in header
  - Description
  - Total Time (expand for Cook/Prep Time)
  - Nutrition section (table with calories, carbohydrateContent, cholesterolContent, fiberContent, proteinContent, saturatedFatContent, sodiumContent, sugarContent, fatContent)
- Field-level filters (calls `/search` API)
- Pagination and customizable results per page (15–50)
- Fallback screens for no results/data

### Running the Frontend

```sh
cd frontend
npm install
npm start
```

---

## License
MIT