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

        scrabbler.board = new scrabbler.Board({
            squares: squares,
            placed: {},
            dir: 'h',
            selected: [0,0]
        });

        scrabbler.solver = new scrabbler.Solver({
            board: squares,
            dictionary: scrabbler.dict
        });

        var boardElement = this.$('#board')[0];
        var boardView = new scrabbler.BoardView({el: boardElement, model: scrabbler.board});


        var solutions = new scrabbler.Boards();
        var solveElement = this.$('#rightColumn')[0];
        var solveView = new scrabbler.SolverView({el: solveElement, collection: solutions});

        solveView.bind('onSolve', this.onSolve);
    },
    onSolve: function() {
        console.log('yo');
    }
});

/*
var scrabbler = (function() {
    var ctx = null;
    return {
        onSolveClick: function(e) {
            _.each(this.placed, function(tileData, xy) {
                if (!tileData.isold) {
                    delete self.placed[xy];
                }
            });
            var solution = solver.solve($('#rack').val(), this.placed);
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
                var wordDiv = $('<div>' + item.score + ' - ' + (''+item.found).toUpperCase() + '</div>').data('placed', item.placed);
                $('#found').append(wordDiv);
            });

        },

        onFoundKeyDown: function(e) {
            var selected = $('#found').data('selected');
            if (e.keyCode == 40) {
                if (selected.nextSibling) {
                    $(selected.nextSibling).trigger('click');
                }
                return false;
            }
            if (e.keyCode == 38) {
                if (selected.previousSibling) {
                    $(selected.previousSibling).trigger('click');
                }
                return false;
            }
        },

        init: function() {
            self = this;
            this.dir = 'h';
            this.placed = {};
            solver.init(scrabbler.dict, this.squares);           
            this.selectTile(0, 0, self.dir);
           
            $('#rack').val('');
            $('#solve').click(_.bind(this.onSolveClick,this));

            var b = $('#board')[0];

            $('#found').attr("contentEditable", "true")
                        .keydown(this.onFoundKeyDown);


            $('#found').delegate('div', 'click', function(e) {
                $(this).addClass('selected');
                var $found = $('#found');
                $found.scrollTo(this, {offset:-100});
                $($found.data('selected')).removeClass('selected');
                $found.data('selected', this);
                self.placed = $(this).data('placed');
                self.drawTiles(self.placed, true);
            });
            $('#found').delegate('div', 'dblclick', function(e) {
                self.placed = $(this).data('placed');
                _.each(self.placed, function(tileData, xy) {
                    if (!tileData.isold) {
                        var rack = $('#rack').val();
                        $('#rack').val(rack.replace(tileData.tile, ''));
                        tileData.isold = true;
                    }
                });
                self.drawTiles(self.placed, true);

                if ($('#saved').val() == $('#savename').val()){
                    $('#save').triggerHandler('click');
                }
            });
            $('#rack').keypress(function(e) {
                if (e.keyCode == 13){
                    $('#solve').triggerHandler('click');
                }
            });

            this.initSave();
            ctx = b.getContext('2d');
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            this.drawTiles(this.placed, true);
        },
        
        initSave: function() {
            var self = this;
            this.updateSaved();
            $('#save').click(function(e) {
                var savename = $('#savename').val();
                if (!!savename) {
                    window.localStorage.setItem(savename + '/rack', $('#rack').val());
                    window.localStorage.setItem(savename, JSON.stringify(self.placed));
                    self.updateSaved(savename);
                }
            });
            
            $('#saved').change(function(e) {
                var savename = $(this).val();
                if (!!savename) {
                    $('#savename').val(savename);
                    $('#found').empty();
                    $('#rack').val(window.localStorage.getItem(savename + '/rack'));
                    self.placed = JSON.parse(window.localStorage.getItem(savename)) || {};
                    self.drawTiles(self.placed, true);
                } else {
                    $('#clear').triggerHandler('click');
                }
            });
            
            $('#delete').click(function(e) {
                var savename = $('#saved').val();
                window.localStorage.removeItem(savename + '/rack');
                window.localStorage.removeItem(savename);
                self.updateSaved();
            });
            $('#clear').click(function(e) {
                $('#saved').val('');
                $('#savename').val('');
                $('#found').empty();
                $('#rack').val('');
                self.placed = {};
                self.clearBoard();
            });
            
        },

        updateSaved: function(selected) {
            $('#saved').empty();
            $('#saved').append('<option value=""></option>');
            var slen = window.localStorage.length;
            var saves = [];
            for (var x = 0; x < slen; x++){
                var savename = window.localStorage.key(x);
                saves.push(savename);
            }
            saves.sort()
                 .filter(function(savename) {return savename.indexOf('/') == -1 })
                 .forEach(function(savename) {
                    $('#saved').append('<option value="' + savename + '">' + savename + '</option>');
                  });
            $('#saved').val(selected);
        },

        selectTile: function(x, y, dir, placed) {
            this.selectedX = x = (x >= 0) ? ((x <= 14) ? x : 14) : 0 ;
            this.selectedY = y = (y >= 0) ? ((y <= 14) ? y : 14) : 0 ;
            if (placed) {
                this.drawTiles(placed, true);
            }

            if (ctx) {
                ctx.strokeStyle = "rgba(210,71,11,1)";
                ctx.fillStyle = "rgba(210,71,11,0.3)";
                ctx.fillRect(x*30,y*30,30,30);
                ctx.strokeRect(x*30,y*30,30,30);

                ctx.font = "8px Helvetica Verdana";  
                var arrow = (dir == 'h') ? String.fromCharCode(8594) : String.fromCharCode(8595); 
                ctx.fillStyle = "rgba(0,0,0,1)";
                ctx.fillText(arrow, x * 30 + 24, y * 30 + 8);  
            }
        },

        

    };
})();

*/
