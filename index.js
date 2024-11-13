require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const app = express();
let id = 1;
let dataObj = {};

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function(req, res) {
  const { url: originalUrl } = req.body;
  let shortUrl;

  try {
    const hostname = new URL(originalUrl).hostname;

    // DNS lookup to verify the host
    dns.lookup(hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      }

      // Check if the URL is already in dataObj
      for (let key in dataObj) {
        if (dataObj[key] === originalUrl) {
          shortUrl = key;
          break;
        }
      }

      // If URL is new, add it to dataObj
      if (!shortUrl) {
        shortUrl = id;
        dataObj[id] = originalUrl;
        id++;
      }

      res.json({
        original_url: originalUrl,
        short_url: shortUrl
      });
    });
  } catch (e) {
    res.json({ error: 'invalid url' });
  }
});

app.get('/api/shorturl/:short_url', function(req, res) {
  const { short_url } = req.params;

  // Check if the short_url exists in dataObj
  const originalUrl = dataObj[short_url];
  if (originalUrl) {
    // Redirect to the original URL
    res.redirect(originalUrl);
  } else {
    // If not found, send an error response
    res.json({ error: 'No short URL found for the given input' });
  }
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
