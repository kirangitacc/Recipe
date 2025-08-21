import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Drawer, Typography, IconButton, Collapse, TextField, Select, MenuItem, CircularProgress
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const RecipeTable = () => {
  const [recipes, setRecipes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ title: '', cuisine: '', rating: '' });

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page, limit });
        const res = await fetch(`http://localhost:3001/api/recipes?${params}`);
        const data = await res.json();
        setRecipes(data.data);
        setTotal(data.total);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, [page, limit]);

  const searchRecipes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.title) params.append('title', filters.title);
      if (filters.cuisine) params.append('cuisine', filters.cuisine);
      if (filters.rating) params.append('rating', `>=${filters.rating}`);

      const res = await fetch(`http://localhost:3001/api/recipes/search?${params}`);
      const data = await res.json();
      console.log('Search results:', data);
      setRecipes(data.data);
      setTotal(data.data.length);
    } catch (error) {
      console.error('Error searching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (recipe) => {
    setSelected(recipe);
    setExpanded(false);
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Fixed Header Section */}
      <div style={{ padding: 20, background: '#fff', zIndex: 1 }}>
        <Typography variant="h4" gutterBottom>Recipe List</Typography>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField label="Title" value={filters.title} onChange={(e) => handleFilterChange('title', e.target.value)} />
          <TextField label="Cuisine" value={filters.cuisine} onChange={(e) => handleFilterChange('cuisine', e.target.value)} />
          <TextField label="Rating" type="number" value={filters.rating} onChange={(e) => handleFilterChange('rating', e.target.value)} />
          <button onClick={searchRecipes}>Search</button>
          <Select value={limit} onChange={(e) => setLimit(e.target.value)}>
            {[15, 20, 30, 50].map(n => <MenuItem key={n} value={n}>{n} per page</MenuItem>)}
          </Select>
          <div style={{ marginLeft: 'auto' }}>
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
            <span style={{ margin: '0 10px' }}>Page {page}</span>
            <button disabled={page * limit >= total} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </div>
      </div>

      {/* Scrollable Table Section */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {loading ? (
          <CircularProgress style={{ display: 'block', margin: '50px auto' }} />
        ) : recipes.length === 0 ? (
          <Typography>No results found</Typography>
        ) : (
          <TableContainer component={Paper} style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {['Title', 'Cuisine', 'Rating', 'Total Time', 'Serves'].map((col) => (
                    <TableCell
                      key={col}
                      style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 2 }}
                    >
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {recipes.map((r) => (
                  <TableRow key={r.id} onClick={() => handleRowClick(r)} style={{ cursor: 'pointer' }}>
                    <TableCell>
                      {r.title
                        ? (r.title.length > 30 ? r.title.slice(0, 30) + '...' : r.title)
                        : 'No Title'}
                    </TableCell>
                    <TableCell>{r.cuisine}</TableCell>
                    <TableCell>{[...Array(Math.round(r.rating || 0))].map((_, i) => <StarIcon key={i} fontSize="small" />)}</TableCell>
                    <TableCell>{r.total_time} min</TableCell>
                    <TableCell>{r.serves}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>

      {/* Drawer View */}
    <Drawer anchor="right" open={!!selected} onClose={() => setSelected(null)}>
      {selected && (
      <div style={{ width: 400, padding: 20 }}>
        <Typography variant="h6">{selected.title}</Typography>
        <Typography variant="subtitle1">{selected.cuisine}</Typography>
        <Typography>Description: {selected.description}</Typography>

      <div style={{ marginTop: 10 }}>
        <Typography>Total Time: {selected.total_time} min</Typography>
        <IconButton onClick={() => setExpanded(!expanded)}>
          <ExpandMoreIcon />
        </IconButton>
        <Collapse in={expanded}>
          <Typography>Prep Time: {selected.prep_time} min</Typography>
          <Typography>Cook Time: {selected.cook_time} min</Typography>
        </Collapse>
      </div>

       <div style={{ marginTop: 20 }}>
  <Typography variant="subtitle2">Nutrition</Typography>
  {(() => {
    try {
      const parsed = typeof selected.nutrients === 'string'
        ? JSON.parse(selected.nutrients)
        : selected.nutrients;

      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
        return (
          <Table size="small">
            <TableBody>
              {Object.entries(parsed).map(([key, val]) => (
                <TableRow key={key}>
                  <TableCell>{key}</TableCell>
                  <TableCell>{val}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      } else {
        return <Typography color="textSecondary">Nutrition data not available.</Typography>;
      }
    } catch (err) {
      console.error('Failed to parse nutrients:', err);
      return <Typography color="textSecondary">Nutrition data is malformed.</Typography>;
    }
  })()}
</div>

      </div>
        )}
    </Drawer>

    </div>
  );
};

export default RecipeTable;
