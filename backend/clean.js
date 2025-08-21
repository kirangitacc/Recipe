import fs from 'fs';
import path from 'path';

const raw = fs.readFileSync(path.join('./US_recipes.json'), 'utf-8');

// Replace all unquoted NaN with null
const cleaned = raw.replace(/\bNaN\b/g, 'null');

fs.writeFileSync('./US_recipes_cleaned.json', cleaned);
console.log('✅ Cleaned JSON saved as US_recipes_cleaned.json');
