const { program } = require('commander');
const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const multer = require('multer');
const { exit } = require('process');


program
  .option('-h, --host <char>', 'server address')
  .option('-p, --port <int>', 'server port')
  .option('-c, --cache <char>', 'cache directory');

  program.parse();
  const options = program.opts();
  
  if (!options.host || !options.port || !options.cache || !fs.existsSync(options.cache)) {
    if (!options.host) {
      console.error('Error: Missing host address');
    }
    if (!options.port) {
      console.error('Error: Missing port');
    }
    if (!options.cache) {
      console.error('Error: Missing cache directory');
    }
    if (options.cache && !fs.existsSync(options.cache)) {
      console.error(`Error: Cache directory does not exist: ${options.cache}`);
    }
    exit(1);
  }

const app = express();
app.use(bodyParser.text());
app.use(multer().none());

app.get('/notes/:name', (req, res) => {
  fs.readFile(path.join(options.cache, `${req.params.name}.txt`), 'utf8', (err, data) => {
    if (err) {
      res.status(404).send('Note not found');
    } else {
      res.status(200).send(data);
    }
  });
});

app.put('/notes/:name', (req, res) => {
  const notePath = path.join(options.cache, `${req.params.name}.txt`);
  if (!fs.existsSync(notePath)) return res.status(404).send('Note not found');
  fs.writeFile(notePath, req.body, 'utf8', err => {
    if (err) {
      res.status(500).send('Server Error');
    } else {
      res.status(200).send('Note updated');
    }
  });
});

app.delete('/notes/:name', (req, res) => {
  fs.unlink(path.join(options.cache, `${req.params.name}.txt`), err => {
    if (err) {
      res.status(404).send('Note not found');
    } else {
      res.status(200).send('Note deleted');
    }
  });
});

app.get('/notes', (req, res) => {
  const notes = fs.readdirSync(options.cache).map(note => {
    return { 
      name: path.basename(note, '.txt'), 
      text: fs.readFileSync(path.join(options.cache, note), 'utf8') 
    };
  });
  res.status(200).json(notes);
});

app.post('/write', (req, res) => {
  const notePath = path.join(options.cache, `${req.body.note_name}.txt`);
  if (fs.existsSync(notePath)) return res.status(400).send('Note already exists');
  fs.writeFile(notePath, req.body.note, 'utf8', err => {
    if (err) {
      res.status(500).send('Server Error');
    } else {
      res.status(201).send('Note created');
    }
  });
});

app.get('/UploadForm.html', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, 'UploadForm.html'));
});

app.listen(options.port, options.host, () => {
  console.log(`Server running at http://${options.host}:${options.port}`);
});
