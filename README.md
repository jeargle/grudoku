grudoku
=======

Group based puzzle game similar to calcudoku.

This game is an implementation of the puzzles described in *The Group Theory Puzzle Book* by David Nacin.  The calcudoku style puzzles require that each element appear only once per row and column.  On top of that, each enclosed cage should combine its elements to produce the clue provided in the top-right corner.  For example, if the operator is "addition", the element set is {1, 2, 3, 4}, and a 2-element cage has clue "3", the two elements will definitely be "1" and "2".  Sometimes there are single-cell cages, and they will just contain the element specified in the clue.


Controls
--------

* mouse left-click - select/deselect table cell
* 1-9 - enter number into selected cell
* backspace - clear selected cell
* arrow keys - move cell selection


How to Run
----------

grudoku runs in web browsers and needs to be hosted by a webserver.  To host it, start up a webserver that gives access to the index.html file within the grudoku top-level directory.  For example, if you have python (>=3) installed, navigate to the grudoku directory and run

```
> python -m http.server -b localhost 8000
```

This will start a server exposing that directory on port 8000.  You can then access the program by pointing your web browser to the URL `http://localhost:8000`.


Dependencies
------------

Dependencies are included.

* phaser
