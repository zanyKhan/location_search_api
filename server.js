const express = require('express');
const cors = require('cors');
const locations = require('./city.json')
const placeDetailsDB = require('./place_details.json')
const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/location/search', (req, res) => {
  let query = (req.query.q || '').trim();
  if (!query) return res.json([]);

  const limit = parseInt(req.query.limit) || 5;
  query = query.toLowerCase();

  const results = locations
    .filter(loc => {
      const fullText = (
        loc.description + " " +
        loc.structured_formatting.main_text + " " +
        loc.structured_formatting.secondary_text
      ).toLowerCase();

      if (query.includes(' ')) {
        const words = query.split(' ').filter(w => w.length > 1);
        return words.every(word => fullText.includes(word));
      }
      return fullText.includes(query);
    })
    .slice(0, limit);

  res.json(results);
});

app.get('/api/location/details', (req, res) => {
  const { place_id } = req.query;

  if (!place_id) {
    return res.status(400).json({ success: false, message: "place_id is required" });
  }

  const details = placeDetailsDB[place_id];

  if (!details) {
    return res.status(404).json({ success: false, message: "Location not supported yet" });
  }

  res.json({
    success: true,
    data: {
      place_id,
      ...details
    }
  });
});

app.listen(5000, ()=>{
    console.log("Server is running on port 5000");
})