scrabbler.BoardView = Backbone.View.extend({
    initialize: function() {
        this.ctx = this.el.getContext('2d');
        this.ctx.textBaseline = 'middle';
        this.ctx.textAlign = 'center';

        this.render();
        this.handleEvents();

        _.bindAll(this, 'render');
        this.model.bind('change', this.render);
        $(this.el).attr("contentEditable", "true")
                  .mousedown(function(){ $(this).focus(); return false; }) 
    },

    events: {
       'click': 'onSelectTile',
       'keydown': 'onKey'
    },

    render: function() {
        this.clear();
        this.drawTiles();
        this.drawSelection();
    },

    onSelectTile: function(e) {
        var ex = e.offsetX;
        var ey = e.offsetY;
        var x = Math.floor(ex / 30);
        var y = Math.floor(ey / 30);

        this.model.selectTile([x, y]);
    },

    onKey: function(e){ 
        if (e.keyCode == 37 /*LEFT*/) {
            this.model.moveLeft();
        } else if (e.keyCode == 38 /*UP*/) {
            this.model.moveUp();
        } else if (e.keyCode == 39 /*RIGHT*/) {
            this.model.moveRight();
        } else if (e.keyCode == 40 /*DOWN*/) {
            this.model.moveDown();
        } else if (e.keyCode == 8 /*BACKSPACE*/) {
            this.model.deletePrevious();
        } else if (e.keyCode == 32 /*SPACE*/) {
            this.model.deleteCurrent();
        } else if (e.keyCode >= 65 && e.keyCode <= 90 /*letters*/) {
            var letter = String.fromCharCode(e.keyCode).toLowerCase();
            this.model.placeLetter(letter);
        } else {
            return true;
        }
        return false;
    },

    drawSelection: function() {
        var xy = this.model.get('selected');
        var x = xy[0];
        var y = xy[1];

        if (this.ctx) {
            this.ctx.strokeStyle = "rgba(210,71,11,1)";
            this.ctx.fillStyle = "rgba(210,71,11,0.3)";
            this.ctx.fillRect(x*30,y*30,30,30);
            this.ctx.strokeRect(x*30,y*30,30,30);

            this.ctx.font = "8px Helvetica Verdana";  
            var arrow = (this.model.get('dir') == 'h') ? String.fromCharCode(8594) : String.fromCharCode(8595); 
            this.ctx.fillStyle = "rgba(0,0,0,1)";
            this.ctx.fillText(arrow, x * 30 + 24, y * 30 + 8);  
        }
    },

    drawTiles: function() {
        var placed = this.model.get('placed');
        var keys = _.keys(placed);

        // Because I wanted the 3D shadow style that overlaps, 
        // I needed to sort so that tiles are drawn
        // Left to Right - Top to Bottom
        keys = _.sortBy(keys, function(xy) {
            var pos = xy.split(',');
            var x = parseInt(pos[0]);
            var y = parseInt(pos[1]);
            return (x+1) * (y+1);    
        });

        _.each(keys, function(xy) {
            this.drawTile(placed[xy], xy);
        }, this);
    },

    drawTile: function (tileData, xy) {
        var pos = xy.split(',');
        var x = parseInt(pos[0]);
        var y = parseInt(pos[1]);
        
        // tile shadow
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        this.ctx.shadowBlur = 4;
        this.ctx.shadowColor = 'rgb(0, 0, 0)';
        if (tileData.isold) {
            this.ctx.fillStyle = 'rgb(180,135,107)';
            this.ctx.fillRect(x*30+1, y*30+1, 30-2, 30-2);
        } else {
            this.ctx.fillStyle = 'rgb(224,180,145)';
            this.ctx.fillRect(x*30+1, y*30+1, 30-2, 30-2);
        }

        // reset shadow
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        this.ctx.shadowBlur = 0;
        this.ctx.shadowColor = '';

        this.ctx.fillStyle = "Black";  
        this.ctx.font = "8px Helvetica, Verdana";  
        this.ctx.fillText(scrabbler.solver.scoreForTile(tileData), x * 30 + 25, y * 30 + 26); 
        this.ctx.font = "20px Helvetica, Verdana";  
        this.ctx.fillText(tileData.tile.toUpperCase(), x * 30 + 15, y * 30 + 18);  
    },

    clear: function() {
        var x = y = 0;

        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0,0,450,450);
        this.ctx.fillStyle = 'transparent';
        this.ctx.fillRect(0,0,450,450);
        this.model.get('squares').forEach(function(row) { 

            row.split('').forEach(function(square) {
                this.ctx.strokeStyle = 'white'; 
                this.ctx.fillStyle = this.colorForSquare(square);
                this.ctx.fillRect(x*30, y*30, 30, 30);
                this.ctx.strokeRect(x*30, y*30, 30, 30);
                x++;
            }, this);

            x = 0;
            y++;
        }, this);

        // draw star
        var star = String.fromCharCode(9733); 
        this.ctx.fillStyle = 'red'; 
        this.ctx.font = "20px Helvetica Verdana";  
        this.ctx.fillText(star, 7*30 + 15, 7*30 + 15);
    },

    colorForSquare: function(square) {
        switch(square) {
            case 'T':
                return 'rgb(219,51,87)';
            case 't':
                return 'rgb(47,180,215)';
            case 'D':
                return 'rgb(223,185,200)';
            case 'd':
                return 'rgb(188,222,235)';
            default:
                return 'rgb(238,230,228)';
        }   
    },

});
