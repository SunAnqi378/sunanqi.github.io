# sunanqi.github.io

README.txt
Tower of Hanoi Game for Kids
English UK Version

========================================
1. PROJECT OVERVIEW
========================================

This is a child-friendly Tower of Hanoi game written in HTML, CSS, and JavaScript.

The game has been adapted for children in the UK. All visible text is in English, using friendly words such as "disc" and "pole".

The player can drag and drop discs between three poles. The aim is to move all the discs from the left pole to the right pole while following the Tower of Hanoi rules.

Project files:

index.html
style.css
script.js


========================================
2. HOW TO PLAY
========================================

Goal:
Move all the discs from Pole A to Pole C.

Rules:

1. You can only move one disc at a time.
2. You can only move the top disc from a pole.
3. A bigger disc cannot be placed on top of a smaller disc.
4. Try to finish the puzzle in the minimum number of moves.

Controls:

Start again
- Resets the current game.

Undo
- Goes back one move.

Hint
- Shows a suggested legal move.

Sound: On / Off
- Turns simple sound effects on or off.

Watch demo
- Automatically shows the correct solution step by step.

Difficulty
- Easy: 3 discs
- Medium: 4 discs
- Challenge: 5 discs

Mouse or touch controls:

1. Pick up the top disc with your mouse or finger.
2. Drag it near another pole.
3. Let go to drop it.
4. If the move is allowed, the disc will snap into place.
5. If the move is not allowed, a warning message appears.


========================================
3. FEATURES
========================================

- Drag and drop gameplay using pointer events.
- Works with mouse, touch, and stylus input.
- Three difficulty levels.
- Move counter.
- Minimum move counter.
- Undo system.
- Hint system.
- Automatic demo solver.
- Optional sound effects using the Web Audio API.
- Win message and celebration effect.
- Responsive layout for smaller screens.
- Bright, playful CSS design suitable for children.


========================================
4. ARRAY METHODS USED
========================================

The JavaScript file uses several array methods to manage the game state.

----------------------------------------
push()
----------------------------------------

Used to add items to an array.

Examples in the game:

- Adding discs to Pole A when a new game starts.
- Adding a moved disc to the target pole.
- Saving snapshots into the history array.
- Adding possible hint moves into the legalMoves array.
- Adding generated demo moves into the result array.

Example purpose:

game.pegs[toPeg].push(disk);

This places the moved disc onto the target pole.

----------------------------------------
pop()
----------------------------------------

Used to remove and return the last item from an array.

Examples in the game:

- Removing the top disc from a pole.
- Taking the most recent move from the history when Undo is clicked.

Example purpose:

const disk = game.pegs[fromPeg].pop();

This removes the top disc from the starting pole.

----------------------------------------
slice()
----------------------------------------

Used to copy arrays.

Examples in the game:

- Creating a safe copy of each pole for the Undo history.
- Restoring a saved snapshot without directly sharing the same array reference.

Example purpose:

A: game.pegs.A.slice()

This makes a copy of Pole A.

----------------------------------------
forEach()
----------------------------------------

Used to loop through arrays.

Examples in the game:

- Removing old disc elements before re-rendering the board.
- Drawing each pole and each disc.
- Checking possible moves for hints.
- Removing old confetti elements.

Example purpose:

PEG_NAMES.forEach((pegName) => {
  ...
});

This loops through Pole A, Pole B, and Pole C.

----------------------------------------
sort()
----------------------------------------

Used to order an array.

Example in the game:

- Sorting possible legal moves so the hint system suggests moving the smallest available disc first.

Example purpose:

legalMoves.sort((a, b) => a.disk - b.disk);

This sorts moves from smallest disc to largest disc.

----------------------------------------
Array indexing and length
----------------------------------------

The game also uses array indexes and the length property.

Examples:

peg[peg.length - 1]

This gets the top disc on a pole.

game.pegs.C.length

This checks how many discs are on Pole C.


========================================
5. MAIN GAME LOGIC
========================================

The game stores the current state in a game object.

Important properties include:

diskCount
- Number of discs in the current difficulty.

pegs
- Stores the discs on each pole.
- Example:
  A: [3, 2, 1]
  B: []
  C: []

moves
- Counts how many valid moves the player has made.

history
- Stores previous game states for the Undo button.

isWin
- Tracks whether the player has completed the puzzle.

isSolving
- Tracks whether the automatic demo is running.

soundEnabled
- Tracks whether sound is on or off.

dragging
- Stores information about the disc currently being dragged.


========================================
6. AUTOMATIC DEMO
========================================

The Watch demo button uses a recursive Tower of Hanoi solution.

The function generateHanoiMoves() creates a list of moves needed to solve the puzzle.

For 3 discs, the minimum number of moves is:

2^3 - 1 = 7

For 4 discs:

2^4 - 1 = 15

For 5 discs:

2^5 - 1 = 31


========================================
7. STYLE AND DESIGN
========================================

The CSS creates a colourful, playful interface.

Main style features:

- Rounded panels and buttons.
- Bright colours suitable for children.
- Large readable text.
- Animated hover and active button states.
- Dragging animation for discs.
- Shake animation for invalid moves.
- Winning glow effect on the board.
- Confetti celebration after winning.
- Responsive scaling for tablets and phones.

The CSS does not contain interface text, so it does not need translation.


========================================
8. KNOWN ISSUES
========================================

1. CSS broken line issue

If the CSS file has accidental broken words, some styles may not work.

Check that these words are complete:

font-size

Correct:

font-size: 21px;

Incorrect:

fo
nt-size: 21px;

rgba

Correct:

rgba(78, 50, 20, 0.28);

Incorrect:

r
gba(78, 50, 20, 0.28);

transition

Correct:

transition:

Incorrect:

transiti
on:

top

Correct:

top: -40px;

Incorrect:

to
p: -40px;


2. Sound may not start immediately

Some browsers block audio until the user clicks a button. The game uses the Sound button to safely start audio after user interaction.

3. Demo mode disables controls

While the automatic demo is running, buttons and the difficulty selector are disabled. This is intentional to prevent the game state from changing during the demo.

4. Very small screens

The board is scaled down on small screens. It should still work, but the game may feel easier to play on a tablet, laptop, or desktop screen.

5. Dragging outside the board

If a disc is dropped too far away from a pole, the move is rejected and the disc returns to its previous position.

6. Hint system gives a legal move, not always the perfect move

The hint system suggests a valid move, usually prioritising the smallest movable disc. It is helpful for children, but it is not a full step-by-step optimal solver during normal play. The Watch demo button shows the full correct solution.

7. Browser compatibility

The game uses modern browser features, including:

- Pointer Events
- CSS custom properties
- Web Audio API
- async / await

It should work in current versions of Chrome, Edge, Firefox, and Safari.


========================================
9. HOW TO RUN
========================================

Keep the files in the same folder:

index.html
style.css
script.js

Open index.html in a modern web browser.

If the page still shows old text or old styles, do a hard refresh:

Windows:
Ctrl + F5

Mac:
Command + Shift + R


========================================
10. VERSION NOTES
========================================

This version uses English UK text.

Examples:

- "Tower of Hanoi Game"
- "disc"
- "pole"
- "Start again"
- "Watch demo"
- "Brilliant!"

The HTML language is set to:

lang="en-GB"

The CSS and JavaScript file links include version numbers to help avoid browser cache problems:

style.css?v=3
script.js?v=3
