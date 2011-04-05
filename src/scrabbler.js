$(document).ready( function() {
    new scrabbler.App({el: this}); 
});


scrabbler.App = Backbone.View.extend({

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

        var scoreKeeper = new scrabbler.ScoreKeeper({squares: squares});

        var board = new scrabbler.Board({
            scoreKeeper: scoreKeeper,
            placed: {},
            dir: 'h',
            selected: [0,0]
        });

        var solver = new scrabbler.Solver({
            scoreKeeper: scoreKeeper,
            dictionary: scrabbler.dict
        });

        var boardElement = this.$('#board')[0];
        var boardView = new scrabbler.BoardView({el: boardElement, model: board});


        var solutions = new scrabbler.Boards();
        var solveElement = this.$('#rightColumn')[0];
        var solveView = new scrabbler.SolverView({el: solveElement, model: solver, collection: solutions});
        solveView.setBoard(board);

        var saves = new scrabbler.SaveGames();

        var saveElement = this.$('#saver')[0];
        var saveView = new scrabbler.SaveView({el: saveElement, collection: saves, board: board});

    },
    onSolve: function() {
    }
});

