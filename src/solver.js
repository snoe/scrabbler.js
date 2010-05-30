/*
 algo:
    1. find set of empty squares surrounding existing letters
    2. place each letter on rack, on each empty square
    3. Build a vertical word
        a. check for valid words, horizontally and vertically
        b. while vert word is words start 
            - add tile to end
        b.  start
        c. if horizontal word is not valid stop
        c. if vertical word is valid, add to list (no need to keep horizontal words? pts?)
        d. stop when run out of tiles
    4. Build horizontal word
    5. return list of board placements -> new words built by placement
*/

var solver = (function() {

    return {
        init: function(dictionary, board) {
            this.bonus = 35;
            this.memoStart = {};
            this.memoPartial = {};

            this.dictstr = dictionary;
            this.dictList = dictionary.split('\n');;
            this.dict = {};
            this.dictList.forEach(function(word) {
                this.dict[word] = true;
            }, this);

            this.board = board;
            this.bonusTiles = {};
            this.board.forEach(function(row, x) { 
                this.xmax = x; 
                row.split('').forEach(function(square, y) {
                    this.ymax = y; 
                    if (square != '.'){
                        this.bonusTiles[x+","+y] = square;
                    }
                }, this);
            }, this);
        },

        makeWorker: function() {
            var id = _.uniqueId('worker');    
            var worker = new Worker('worker.js');
            worker.onmessage = this.messageReceived;
            worker.postMessage({id: id, dictionary:this.dictstr, board: this.board});
            worker.postMessage(_.values(arguments));
            this.workers[id] = worker;
        },

        messageReceived: function(e) {
            if (e.data.msg == 'alreadyDone') {
                _.each(solver.workers, function(wrk) {
                    wrk.postMessage(e.data);
                });
            } else {
                $('#solve').trigger('solver/solved', e.data);
            }
        
        },

        solve: function(rack, placed) {
            this.workers = {};
            this.count = 0;
            var tiles = rack.split('');
            var empties = this.findEmpties(placed);
            this.searchedMap = {};
            this.scores = {};
            this.words = {};

            tiles.forEach(function(tile, tidx) {
                var newtiles = $.merge([], tiles);
                newtiles.splice(tidx, 1);
                empties.forEach(function(pos) {
                    var x = pos[0];
                    var y = pos[1];
                    if (tile == '?') {
                        _.range(26).forEach(function(offset){
                            var blank = String.fromCharCode(97 + offset);
                            this.makeWorker(x, y, blank, true, newtiles, 'v', [], 0, placed);
                            this.makeWorker(x, y, blank, true, newtiles, 'h', [], 0, placed);
                            //this.subsearch(x, y, blank, true, newtiles, 'v', [], 0, placed);
                            //this.subsearch(x, y, blank, true, newtiles, 'h', [], 0, placed);
                        },this);
                    } else {
                        this.makeWorker(x, y, tile, false, newtiles, 'v', [], 0, placed);
                        this.makeWorker(x, y, tile, false, newtiles, 'h', [], 0, placed);
                        //this.subsearch(x, y, tile, false, newtiles, 'v', [], 0, placed);
                        //this.subsearch(x, y, tile, false, newtiles, 'h', [], 0, placed);
                    }
                }, this);
            }, this);
            console.log('words', this.words);
            console.log('scores', this.scores);
            console.log(this.count);
            return {words: this.words, scores: this.scores}; 
        },
        findEmpties: function(placed) {
            var self = this;

            var empties = [];
            $.each(placed, function(xy, tile){
                    $.merge(empties, self.findEmpty(xy, placed)); 
            });
            if (!empties.length){
                empties = [[7,7]];
            }
            return empties;
        },
        findEmpty: function(xy, placed) {
            var pos = xy.split(',');
            var x = parseInt(pos[0]);
            var y = parseInt(pos[1]);

            var possibles = [
                [x+1,y], 
                [x-1,y], 
                [x,y+1], 
                [x,y-1]
            ].filter(function(coord){
                var isOnplaced = coord[0] >=0 && 
                                coord[0] <= 14 && 
                                coord[1] >= 0 && 
                                coord[1] <= 14;

                var isEmpty = !(placed[coord[0]+','+coord[1]]);
                return isOnplaced && isEmpty;
            });
            return possibles;
        },
    };
})();
