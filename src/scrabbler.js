
var scrabbler = (function() {
    var ctx = null;
    return {
        squares: [
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
        ],
        init: function() {
            var self = this;
            this.placed = {};
            solver.init(scrabbler.dict, this.squares);           
           
            $('#rack').val('');

            $('#solve').bind('solver/solved', function(e, solution) {
                var words = solution.words;

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
                    var wordDiv = $('<div>' + item.score + '-' + item.found + '</div>').data('placed', item.placed);
                    $('#found').append(wordDiv);
                });

            });

            $('#solve').click(function(e) { 
                $('#found').empty();
                _.each(self.placed, function(tileData, xy) {
                    if (!tileData.isold) {
                        delete self.placed[xy];
                    }
                });
                solver.solve($('#rack').val(), self.placed);
            });

            var dir = 'h';
            this.selectTile(0, 0, dir);
            $('#board').click(function(e) {
                var ex = e.offsetX;
                var ey = e.offsetY;
                var x = Math.floor(ex / 30);
                var y = Math.floor(ey / 30);

                self.selectTile(x, y, dir, self.placed);
            });

            $("#board")
                .attr("contentEditable", "true")
                .mousedown(function(){ $(this).focus(); return false; }) 
                .keydown(function(e){ 
                    var newX = self.selectedX;
                    var newY = self.selectedY; 
                    if (e.keyCode == 37) {
                        newX = newX - 1; 
                        dir = 'h';
                    } else if (e.keyCode == 38) {
                        newY = newY - 1;
                        dir = 'v';
                    } else if (e.keyCode == 39) {
                        newX = newX + 1;
                        dir = 'h';
                    } else if (e.keyCode == 40) {
                        newY = newY + 1;
                        dir = 'v';
                    } else if (e.keyCode == 8) {
                        if (dir == 'h') {
                            newX = newX - 1;
                        } else {
                            newY = newY - 1;
                        }
                        delete self.placed[newX + ',' + newY];
                    } else if (e.keyCode == 32) {
                        if (dir == 'h') {
                            newX = newX + 1;
                        } else {
                            newY = newY + 1;
                        }
                        delete self.placed[self.selectedX + ',' + self.selectedY];
                    } else if (e.keyCode >= 65 && e.keyCode <= 90) {
                        if (dir == 'h') {
                            newX = newX + 1;
                        } else {
                            newY = newY + 1;
                        }
                        var key = String.fromCharCode(e.keyCode).toLowerCase();
                        self.placed[self.selectedX + ',' + self.selectedY] = {tile:key, isold:true};
                    }
                    self.selectTile(newX, newY, dir, self.placed);
                    return (e.keyCode == 9);
                });

            var b = $('#board')[0];

            $('#found').delegate('div', 'click', function(e) {
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
        drawTiles: function(placed, clear) {
            clear && this.clearBoard();
            var keys = _.keys(placed);
            keys = _.sortBy(keys, function(xy) {
                var pos = xy.split(',');
                var x = parseInt(pos[0]);
                var y = parseInt(pos[1]);
                return x * y;    
            });
            _.each(keys, function(xy) {
                var tileData = placed[xy];
                var pos = xy.split(',');
                var x = parseInt(pos[0]);
                var y = parseInt(pos[1]);
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
                ctx.shadowBlur = 4;
                ctx.shadowColor = 'rgb(0, 0, 0)';
                if (tileData.isold) {
                    ctx.fillStyle = 'rgb(180,135,107)';
                    ctx.fillRect(x*30+1, y*30+1, 30-2, 30-2);
                } else {
                    ctx.fillStyle = 'rgb(224,180,145)';
                    ctx.fillRect(x*30+1, y*30+1, 30-2, 30-2);
                }
                ctx.shadowOffsetX = 20;
                ctx.shadowOffsetY = 0;
                ctx.shadowBlur = 0;
                ctx.shadowColor = '';
                
                ctx.fillStyle = "Black";  
                ctx.font = "8px Helvetica, Verdana";  
                ctx.fillText(solver.scoreForTile(tileData), x * 30 + 25, y * 30 + 26); 
                ctx.font = "20px Helvetica, Verdana";  
                ctx.fillText(tileData.tile.toUpperCase(), x * 30 + 15, y * 30 + 22);  
            },this);
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
        

        clearBoard: function() {
            var x = y = 0;

            ctx.fillStyle = 'white';
            ctx.fillRect(0,0,450,450);
            ctx.fillStyle = 'transparent';
            ctx.fillRect(0,0,450,450);
            this.squares.forEach(function(row) { 

                row.split('').forEach(function(square) {
                    ctx.strokeStyle = 'white'; 
                    ctx.fillStyle = this.colorForSquare(square);
                    ctx.fillRect(x*30, y*30, 30, 30);
                    ctx.strokeRect(x*30, y*30, 30, 30);
                    x++;
                }, this);

                x = 0;
                y++;
            }, this);
            var star =String.fromCharCode(9733); 
            ctx.fillStyle = 'red'; 
            ctx.font = "20px Helvetica Verdana";  
            ctx.fillText(star, 7*30 + 15, 7*30 + 15);
        }
    };
})();


$(document).ready( function() {
    scrabbler.init();
});

