SolverView = Backbone.View.extend({
    events: {
        'click #solve': 'onSolve',
        'click #found div': 'placeTempTile',
        'dblclick #found div': 'placeTile',
        'keypress #rack': 'onRackKeyPress',
        'keydown #found': 'onFoundKeyDown',
    },

    initialize: function() {
        this.board = this.options.board;
        this.$found = this.$('#found');
    },

    onRackKeyPress: function(e) {
        (e.keyCode == 13) && this.onSolve();
    },

    removeTileFromRack: function(tile) {
        var rack = this.$('#rack').val();
        this.$('#rack').val(rack.replace(tile, ''));
    },

    placeTile: function(e) {
        var placed = _.clone($(e.target).data('placed'));
        _.each(placed, function(tileData, xy) {
            var td = _.clone(tileData);
            if (!td.isold) {
                this.removeTileFromRack(td.tile);
            }
            td.isold = true;
            placed[xy] = td;
        }, this);
        this.board.set({placed : placed});
        this.$('#rack').focus();
    },

    selectTileDiv: function(tileDiv) {
        $(tileDiv).addClass('selected');
        this.$found.scrollTo(tileDiv, {offset:-100});
        if (this.$found.data('selected')) {
            $(this.$found.data('selected')).removeClass('selected');
        }
        this.$found.data('selected', tileDiv);
    },

    placeTempTile: function(e) {
        this.selectTileDiv(e.target);
        this.board.set({placed : $(e.target).data('placed')});
    },

    onFoundKeyDown: function(e) {
        var selected = this.$found.data('selected');
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
        if (e.keyCode == 32) {
            $(selected).trigger('dblclick')
        }
        return false;
    },

    cmpScore: function(item) {
        // text compare of score + word
        var score = '' + item.score;
        while (score.length < 3) {
            score = '0' + score;
        }
        return (score + item.found); 
    },

    renderItem: function(item) {
        var foundWords = (''+item.found.join(', ')).toUpperCase();
        var wordDiv = $('<div>' + item.score + ' - ' + foundWords + '</div>');
        wordDiv.data('placed', item.placed);

        this.$found.append(wordDiv);
    },
   
    onSolve: function() {
        var rack = this.$('#rack').val();
        this.board.resetPlaced();
        var placed = this.board.get('placed');
        var solution = this.model.solve(rack, placed);

        var words = solution.words;
        this.$found.empty();

        var possibles = [];
        _.each(words, function(found, i) {
            var score = solution.scores[i];
            var placed = JSON.parse(i);
            possibles.push({score: score, placed: placed, found: found});
        });

        _.sortBy(possibles, this.cmpScore).
            reverse().
            forEach(this.renderItem, this);

    }
});
