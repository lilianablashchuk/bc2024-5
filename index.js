const express = require('express');
const { program } = require('commander');
const path = require('path');

program
    .requiredOption('-h, --host <char>', 'server address')
    .requiredOption('-p, --port <int>', 'server port')
    .requiredOption('-c, --cache <char>', 'path to directory where cache files are stored')
    .parse(process.argv);

const { host, port, cache } = program.opts();

const app = express();

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}`);
});
