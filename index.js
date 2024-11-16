const { program } = require('commander');
const { exit } = require('process');
const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const multer = require('multer');

program
  .option('-h, --host <char>', 'server address')
  .option('-p, --port <int>', 'server port')
  .option('-c, --cache <char>', 'path to directory, where cache files will be stored');

program.parse();
const options = program.opts();

if (!options.host) {
  console.error('Enter host');
  exit(1);
}
if (!options.port) {
  console.error('Enter port');
  exit(1);
}
if (!options.cache) {
  console.error('Enter path to cache directory');
  exit(1);
}

if (!fs.existsSync(options.cache)) {
  console.error(`Cache directory does not exist: ${options.cache}`);
  exit(1);
}

const app = express();
app.use(bodyParser.text());
app.use(multer().none());

app.get('/notes/:name', (req, res) => {
  const notePath = path.join(options.cache, `${req.params.name}.txt`);
  fs.readFile(notePath, 'utf8', (err, data) => {
    if (err) {
      res.status(404).send('Note not found');
    } else {
      res.status(200).send(data);
    }
  });
});

app.put('/notes/:name', (req, res) => {
  const notePath = path.join(options.cache, `${req.params.name}.txt`);
  if(!fs.existsSync(notePath)) return res.status(404).send('Note not found');
  fs.writeFile(notePath, req.body, 'utf8', (err) => {
      if (err) {
          return res.status(500).json({ message: 'Server Error', error: err });
      }
      res.status(201).send('The note was created successfully!');
  });
});


app.listen(options.port, options.host, (err) => {
  if (err) {
    console.error(`Failed to start server: ${err.message}`);
    exit(1);
  }
  console.log(`Server running at http://${options.host}:${options.port}`);
});
