scrabbler.Board = Backbone.Model.extend({
    moveLeft: function() {
        this.set({'dir': 'h'});
        this.moveBack();
    },

    moveRight: function() {
        this.set({'dir': 'h'});
        this.moveForward();
    },  

    moveUp: function() {
        this.set({'dir': 'v'});
        this.moveBack();
    },

    moveDown: function() {
        this.set({'dir': 'v'});
        this.moveForward();
    },

    moveForward: function() {
        if (this.get('dir') == 'h') {
            this.move(1, 0);
        } else {
            this.move(0, 1);
        }
    },

    moveBack: function() {
        if (this.get('dir') == 'h') {
            this.move(-1, 0);
        } else {
            this.move(0, -1);
        }
    },

    deleteSelected: function() {
        var placed = _.clone(this.get('placed'));
        delete placed[this.getPlaceKey()];
        this.set({'placed': placed});
    },

    deletePrevious: function() {
        this.moveBack();
        this.deleteSelected();
    },

    deleteCurrent: function() {
        this.deleteSelected();
        this.moveForward();
    },

    placeLetter: function(letter) {
        var placed = _.clone(this.get('placed'));
        placed[this.getPlaceKey()] = {tile:letter, isold:true};
        this.set({'placed': placed});

        this.moveForward();
    },

    move: function(dx, dy) {
        var xy = _.clone(this.get('selected'));
        xy[0] += dx;
        xy[1] += dy;
        this.selectTile(xy);
    },

    selectTile: function(xy) {
        var x = xy[0];
        var y = xy[1];
        x = (x >= 0) ? ((x <= 14) ? x : 14) : 0 ;
        y = (y >= 0) ? ((y <= 14) ? y : 14) : 0 ;
        this.set({'selected': [x,y]});
    },

    getPlaceKey: function() {
        var xy = this.get('selected');
        return xy[0] + ',' + xy[1];
    },
});

scrabbler.Boards = Backbone.Collection.extend({
    model: scrabbler.Board
});

