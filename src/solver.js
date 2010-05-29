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
        debug: false,
        solve: function(rack, placed) {
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
                            this.subsearch(x, y, blank, true, newtiles, 'v', [], 0, placed);
                            this.subsearch(x, y, blank, true, newtiles, 'h', [], 0, placed);
                        },this);
                    } else {
                        this.subsearch(x, y, tile, false, newtiles, 'v', [], 0, placed);
                        this.subsearch(x, y, tile, false, newtiles, 'h', [], 0, placed);
                    }
                }, this);
            }, this);
            console.log('words', this.words);
            console.log('scores', this.scores);
            console.log(this.count);
            return {words: this.words, scores: this.scores}; 
        },

        // Places each tile at start and end of word  
        search: function(addToStart, x, y, tiles, start, length, dir, subwords, subscores, placed) {
            tiles.forEach(function(tile, tidx) {

                var tmptiles = $.merge([], tiles);
                tmptiles.splice(tidx, 1);
                if (dir == 'h') {
                    var startx = start - 1;
                    var starty = y;
                    var endx = start + length;
                    var endy = y;
                } else if (dir == 'v') {
                    var startx = x;
                    var starty = start - 1;
                    var endx = x; 
                    var endy = start + length;
                }

                if (tile == '?') {
                    _.range(26).forEach(function(offset){
                        var blank = String.fromCharCode(97 + offset);
                        if (addToStart && startx >= 0 && starty >=0) {
                            this.subsearch(startx, starty, blank, true, tmptiles, dir, subwords, subscores, placed);
                        } else if (endx <= 14 && endy <= 14) {
                            this.subsearch(endx, endy, blank, true, tmptiles, dir, subwords, subscores, placed);
                        }
                    },this);
                } else {
                    if (addToStart && startx >= 0 && starty >=0) {
                        this.subsearch(startx, starty, tile, false, tmptiles, dir, subwords, subscores, placed);
                    } else if (endx <= 14 && endy <= 14) {
                        this.subsearch(endx, endy, tile, false, tmptiles, dir, subwords, subscores, placed);
                    }
                }
                
            },this);

        },

        subsearch:function(x, y, tile, isblank, tiles, dir, subwords, subscores, placed) {
            var scratch = this.place(x, y, tile, isblank, placed);
            if (this.alreadyDone(tiles, dir, scratch)) { return; }
            this.count++;
            var found = this.findWords(x, y, dir, scratch);

            var subword = null;            
            var mainword = null;
            if (dir == 'v') {
                subword = found.h;
                subscore = found.hscore;
                mainword = found.v;
                mainscore = found.vscore;
            } else if (dir == 'h') {
                subword = found.v;
                subscore = found.vscore;
                mainword = found.h;
                mainscore = found.hscore;
            } 

            if (subword) {
                if (this.dict[subword]) {
                    subwords = $.merge([subword], subwords);
                    subscores = subscores + subscore; 
                } else {
                    return;
                }
            }
            
            var atBoardStart = (dir == 'h') ? x == 0 : y == 0;
            var atBoardEnd = (dir == 'h') ? x == this.xmax : y == this.ymax;
            var isStart = this.isWordStart(mainword);
            if (isStart) {
                if (this.dict[mainword] ) {
                    var foundWords = $.merge([mainword], subwords); 
                    var foundScore = mainscore + subscores; 
                    var key = JSON.stringify(scratch);
                    this.words[key] = foundWords;
                    this.scores[key] = foundScore;
                }
                // if this is the beginning of a word, add stuff to the back
                if (!atBoardEnd){
                    this.search(false, x, y, tiles, found.start, found.length, dir, subwords, subscores, scratch);
                }
            }
           
            if (!atBoardStart) {
            // always search for a word start
                if (isStart || this.isPartialWord(mainword)) { 
                    this.search(true, x, y, tiles, found.start, found.length, dir, subwords, subscores, scratch);
                }
            }
        },
        
        alreadyDone: function(tiles, dir, placed) {
            var placedKey = this.stringer(placed);
            var memoKey = JSON.stringify(tiles) + dir + placedKey;
            if (this.searchedMap[memoKey]) {
                return true;
            } else {
                this.searchedMap[memoKey] = true;
                return false;
            }
        },

        stringer: function(obj){
            var ret = _.keys(obj).sort().map(function(key){ return (key + ':' + obj[key].tile); }).join(',');
            return ret; 
        },

        isWordStart: function(partialWord) {
            var memod = this.memoStart[partialWord];
            if (memod !== undefined) {
                return memod;
            } else {
                var idx = _.sortedIndex(this.dictList, partialWord);
                var re = new RegExp('^' + partialWord, 'm');
                var res = re.test(this.dictList[idx]);
                this.memoStart[partialWord] = res;
                return res;
            }
        },
        isPartialWord: function(partialWord) {
            var memod = this.memoPartial[partialWord];
            if (memod !== undefined) {
                return memod;
            } else {
                var re = new RegExp('^' + partialWord, 'm');
                var res = re.test(this.dictstr);
                this.memoPartial[partialWord] = res;
                return res;
            }
        },

        place: function(x, y, tile, isblank, placed) {
            var scratch = $.extend({}, placed);
            scratch[x+','+y] = {tile:tile, isblank:isblank};
            return scratch;
        },

        // find the word at position x, y in direction dir
        findWords: function(x, y, dir, placed) { 
            var found = {};
            
            // horizontal
            var i = x, hword;

            // Find first letter in word
            while (placed[(--i)+','+y]) { }
            var tileData = placed[(++i)+','+y];
            var hword = tileData.tile;
            var hstart = i;
            
            var hmulti = 1;
            var hscore = 0;
            var hNewCount = 0
            hmulti *= this.wordMultiplier(tileData, i, y);
            hscore += this.scoreForTile(tileData, i, y);
            hNewCount += !tileData.isold;

            while (placed[(++i)+','+y]) {
                tileData = placed[i+','+y];
                hword += tileData.tile;
            
                hmulti *= this.wordMultiplier(tileData, i, y);
                hscore += this.scoreForTile(tileData, i, y);
                hNewCount += !tileData.isold;
            }
            var bonus = (hNewCount == 7) ? this.bonus : 0; 
            
            if (dir == 'h' || hword.length > 1) {
                found.h = hword; 
                found.hscore = hmulti * hscore + bonus
            }
            if (dir == 'h'){
                found.start = hstart;
                found.length = hword.length;
            } 
            // vertical
            var j = y, vword;
            while (placed[x+','+(--j)]) { }
            var tileData = placed[x+','+(++j)];
            var vword = tileData.tile;
            var vstart = j;
            
            var vmulti = 1;
            var vscore = 0;
            var vNewCount = 0
            vmulti *= this.wordMultiplier(tileData, x, j);
            vscore += this.scoreForTile(tileData, x, j);
            vNewCount += !tileData.isold;

            while (placed[x+','+(++j)]) {
                tileData = placed[x+','+j];
                vword += tileData.tile;

                vmulti *= this.wordMultiplier(tileData, x, j);
                vscore += this.scoreForTile(tileData, x, j);
                vNewCount += !tileData.isold;

            }
            var bonus = (vNewCount == 7) ? this.bonus : 0; 
            
            if (dir == 'v' || vword.length > 1) {
                found.v = vword;
                found.vscore = vmulti * vscore + bonus;
            } 

            if (dir == 'v'){
                found.start = vstart;
                found.length = vword.length;
            }
            return found; 
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
    };
})();
