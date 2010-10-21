scrabbler.ScoreKeeper = Backbone.Model.extend({
    initialize: function() {
        this.buildBonusTiles(this.get('squares'));
    },

    buildBonusTiles: function(squares) {
        this.bonusTiles = {};
        this.get('squares').forEach(function(row, x) { 
            this.xmax = x; 
            row.split('').forEach(function(square, y) {
                this.ymax = y; 
                if (square != '.'){
                    this.bonusTiles[x+","+y] = square;
                }
            }, this);
        }, this);

    },

    scoreForTile: function(tileData, x, y) {
        var two = 'd,l,n,u';
        var three = 'g,h,y';
        var four = 'b,c,f,m,p,w';
        var five = 'k,v';
        var eight = 'x';
        var ten = 'j,q,z';
        
        var check = function (i) {
            return tileData.tile == i;
        }

        var score = 1;
        _.any(two, check) && (score = 2);
        _.any(three, check) && (score = 3);
        _.any(four, check) && (score = 4);
        _.any(five, check) && (score = 5);
        _.any(eight, check) && (score = 8);
        _.any(ten, check) && (score = 10);
        
        if (x !== undefined && !tileData.isold) {
            var bonus = this.bonusTiles[x+','+y];
            score *= bonus == 't' ? 3 : (bonus == 'd' ? 2 : 1);
        }

        return tileData.isblank ? 0 : score;
    },

    wordMultiplier: function(tileData, x, y) {
        if (tileData.isold) {
            return 1;
        }
        var bonus = this.bonusTiles[x+','+y];
        return bonus == 'T' ? 3 : (bonus == 'D' ? 2 : 1);
    },
});
