const express = require('express');
const cors = require('cors');
const fs = require('fs');
const csvParser = require('csv-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const csvFilePath = './cluesReworkedFormatted.csv'; // Replace this with the path to your cleaned CSV file

app.use(cors());
app.use(express.static('public'));

function getRandomClues(clues, count) {
  const randomClues = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * clues.length);
    randomClues.push(clues[randomIndex]);
  }
  return randomClues;
}

app.get('/api/clues', (req, res) => {
    const clues = [];
    fs.createReadStream(csvFilePath)
      .pipe(csvParser({ headers: ['clue', 'answer'] }))
      .on('data', (row) => {
        clues.push(row);
      })
      .on('end', () => {
        res.json(clues);
      });
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
