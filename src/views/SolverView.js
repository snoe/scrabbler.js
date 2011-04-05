scrabbler.SolverView = Backbone.View.extend({
    initialize: function() {
        this.handleEvents();
  
    },

    setBoard: function(board) {
        this.board = board;
        self = this;
        this.$('#found').delegate('div', 'click', function(e) {
            $(this).addClass('selected');
            var $found = $('#found');
            $found.scrollTo(this, {offset:-100});
            $($found.data('selected')).removeClass('selected');
            $found.data('selected', this);
            board.set({placed : $(this).data('placed')});
        });
        this.$('#found').delegate('div', 'dblclick', function(e) {
            var placed = _.clone($(this).data('placed'));
            _.each(placed, function(tileData, xy) {
                var td = _.clone(tileData);
                if (!td.isold) {
                    var rack = $('#rack').val();
                    $('#rack').val(rack.replace(td.tile, ''));
                    td.isold = true;
                }
                placed[xy] = td;
            });
            board.set({placed : placed});

            if ($('#saved').val() == $('#savename').val()){
                $('#save').triggerHandler('click');
            }
        });
        this.$('#found').attr("contentEditable", "true")
                        .keydown(this.onFoundKeyDown);

        this.$('#rack').keypress(function(e) {
            if (e.keyCode == 13){
                self.onSolve();
            }
        });

    },

    events: {
        'click #solve': 'onSolve',
    },

    onFoundKeyDown: function(e) {
        var selected = $('#found').data('selected');
        if (e.keyCode == 40) {
            if (selected.nextSibling) {
                $(selected.nextSibling).trigger('click');
            }
        }
        if (e.keyCode == 38) {
            if (selected.previousSibling) {
                $(selected.previousSibling).trigger('click');
            }
        }
        return false;
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
