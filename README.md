# Crossword Generator

A small web application that generates a crossword-style puzzle from a CSV list of clue/answer pairs.

This was an early JavaScript/Node.js project built to experiment with DOM manipulation, CSV parsing, Express routes, and simple puzzle-generation logic.

## Features

- Generates a 10x10 crossword-style grid from a clue list
- Reads clue/answer data from a CSV file via an Express API endpoint
- Randomly selects answers that fit a predefined crossword layout
- Supports across/down clue sections
- Allows the user to switch input direction between across and down
- Automatically checks completed answers and highlights correct entries
- Includes a reveal-answers option

## Tech stack

- JavaScript
- Node.js
- Express
- HTML
- CSS
- CSV parsing with `csv-parser`

## How it works

The backend exposes an `/api/clues` endpoint, which reads clue and answer pairs from a CSV file and returns them to the browser as JSON.

The frontend then:

1. Creates an empty grid.
2. Uses a predefined crossword layout.
3. Selects answers of the required length from the clue data.
4. Places matching words into the grid where they fit.
5. Renders the crossword, clues, input fields and clue numbering in the browser.

## Running locally

Clone the repository:

```bash
git clone https://github.com/DanKillen/CrosswordGenerator.git
cd CrosswordGenerator
```

Install dependencies:

```bash
npm install
```

Start the application:

```bash
node server.js
```

Then open:

```text
http://localhost:3000
```

## Notes

This is an older learning project rather than production code. It demonstrates early experience with full-stack JavaScript, basic API design, client-side rendering, file-based data loading and interactive browser behaviour.

Areas I would improve in a production version include:

- replacing the fixed layout with a more flexible crossword-generation algorithm
- adding validation and error handling around CSV loading
- moving puzzle state into a clearer data model
- adding automated tests
- improving accessibility and keyboard navigation
- removing generated/dependency files from version control where appropriate
