var chosenBoard = (new URLSearchParams(window.location.search)).get("board");

$(document).ready( function() {
    new App({el: this});
});


App = Backbone.View.extend({

    initialize: function() {

        var squares = [
            '...T..t.t..T...',
            '..d..D...D..d..',
            '.d..d.....d..d.',
            'T..t...D...t..T',
            '..d...d.d...d..',
            '.D...t...t...D.',
            't...d.....d...t',
            '...D...X...D...',
            't...d.....d...t',
            '.D...t...t...D.',
            '..d...d.d...d..',
            'T..t...D...t..T',
            '.d..d.....d..d.',
            '..d..D...D..d..',
            '...T..t.t..T...'
        ];

        var squares2 = [
            'T..d...T...d..T',
            '.D...t...t...D.',
            '..D...d.d...D..',
            '...D...d...D..d',
            '....D.....D....',
            '.t...t...t...t.',
            '..d...d.d...d..',
            'T..d...D...d..T',
            '..d...d.d...d..',
            '.t...t...t...t.',
            '....D.....D....',
            'd..D...d...D..d',
            '..D...d.d...D..',
            '.D...t...t...D.',
            'T..d...T...d..T',
        ];
        var chosenSquares = squares;
        if (chosenBoard == "2") {
          chosenSquares = squares2;
        }

        var scoreKeeper = new ScoreKeeper({squares: chosenSquares});

        var board = new Board({
            scoreKeeper: scoreKeeper,
            placed: {},
            dir: 'h',
            selected: [0,0]
        });

        var solver = new Solver({
            scoreKeeper: scoreKeeper,
            dictionary: scrabbleDict
        });

        var boardElement = this.$('#board')[0];
        var boardView = new BoardView({el: boardElement, model: board});


        var solutions = new Boards();
        var solveElement = this.$('#rightcolumn')[0];
        var solveView = new SolverView({el: solveElement, model: solver, collection: solutions, board: board});

        var saves = new SaveGames();

        var saveElement = this.$('#saver')[0];
        var saveView = new SaveView({el: saveElement, collection: saves, board: board});

    },
    onSolve: function() {
    }
});

