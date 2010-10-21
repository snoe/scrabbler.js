scrabbler.SolverView = Backbone.View.extend({
    initialize: function() {
        this.handleEvents();
  
    },

    setBoard: function(board) {
        this.board = board;
        this.$('#found').delegate('div', 'click', function(e) {
            $(this).addClass('selected');
            var $found = $('#found');
            $found.scrollTo(this, {offset:-100});
            $($found.data('selected')).removeClass('selected');
            $found.data('selected', this);
            board.set({placed : $(this).data('placed')});
        });

    },

    events: {
        'click #solve': 'onSolve',
    },
   
    onSolve: function() {
        var rack = this.$('#rack').val();
        this.board.resetPlaced();
        var placed = this.board.get('placed');
        var solution = this.model.solve(rack, placed);

        var words = solution.words;
        $('#found').empty();

        var possibles = [];
        _.each(words, function(found, placing) {
            var score = solution.scores[placing];
            var possible = JSON.parse(placing);
            possibles.push({score:score, placed:possible, found: found});
        });
        _.sortBy(possibles, function(item) { 
            var score = '' + item.score;
            while (score.length < 3) {
                score = '0' + score;
            }
            return score + item.found; 
        }).reverse().forEach(function(item) {
            var wordDiv = $('<div>' + item.score + ' - ' + (''+item.found.join(', ')).toUpperCase() + '</div>').data('placed', item.placed);
            $('#found').append(wordDiv);
        });
    }
});
