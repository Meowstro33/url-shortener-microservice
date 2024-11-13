require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const app = express();

let id = 1; // Track ID for short URLs
const dataObj = {}; // Store URLs with short_url as key

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Endpoint for testing
app.get('/api/hello', (req, res) => {
  res.json({ greeting: 'hello API' });
});

// Validate URL function
const isValidUrl = (url) => {
  const urlPattern = /^(http|https):\/\/[^ "]+$/;
  return urlPattern.test(url);
};

// POST route to shorten a URL
app.post('/api/shorturl', (req, res) => {
  const { url: originalUrl } = req.body;

  // Check URL format
  if (!isValidUrl(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  // Extract hostname for DNS lookup
  const hostname = new URL(originalUrl).hostname;

  // DNS lookup to verify hostname
  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    // Check if the URL already exists
    let shortUrl = Object.keys(dataObj).find((key) => dataObj[key] === originalUrl);

    // If URL not found, add a new entry
    if (!shortUrl) {
      shortUrl = id;
      dataObj[shortUrl] = originalUrl;
      id++;
    }

    // Respond with JSON containing original and short URLs
    res.json({
      original_url: originalUrl,
      short_url: shortUrl
    });
  });
});

// GET route to redirect to original URL
app.get('/api/shorturl/:short_url', (req, res) => {
  const { short_url } = req.params;

  // Retrieve the original URL
  const originalUrl = dataObj[short_url];
  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
