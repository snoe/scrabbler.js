debug = false;
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
scrabbler.Solver = Backbone.Model.extend({
    initialize: function() {
        var dictionary = this.get('dictionary');
        var board = this.get('board');
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
                var isblank = false;
                if (tile == '?') {
                    tile = '(.)'; 
                    isblank = true;
                }
                this.subsearch(x, y, tile, isblank, newtiles, 'v', [], 0, this.dictstr, placed);
                this.subsearch(x, y, tile, isblank, newtiles, 'h', [], 0, this.dictstr, placed);
            }, this);
        }, this);
        debug && console.log('words', this.words);
        debug && console.log('scores', this.scores);
        console.log(this.count);
        return {words: this.words, scores: this.scores}; 
    },

    // Places each tile at start and end of word  
    search: function(addToStart, x, y, tiles, start, length, dir, subwords, subscores, dictionary, placed) {
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

            var isblank = false;
            if (tile == '?') {
                tile = '(.)';
                isblank = true;
            }
            
            if (addToStart && startx >= 0 && starty >=0) {
                this.subsearch(startx, starty, tile, isblank, tmptiles, dir, subwords, subscores, dictionary, placed);
            } else if (endx <= 14 && endy <= 14) {
                this.subsearch(endx, endy, tile, isblank, tmptiles, dir, subwords, subscores, dictionary, placed);
            }
            
        },this);

    },

    subsearch:function(x, y, tile, isblank, tiles, dir, subwords, subscores, dictionary, placed) {
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
        debug && console.log('found', mainword, subword, tile, tiles);
        if (subword) {
            if (this.dict[subword]) {
                subwords = $.merge([subword], subwords);
                subscores = subscores + subscore; 
            } else if (subword.indexOf('(') != -1) {
                var re = new RegExp('^' + subword + '$', 'mg');
                var group = '([';
                // substrings have to be checked against the whole dict
                while(match = re.exec(this.dictstr)) {
                    group += match[1];
                }
                group += '])';
               
                if (group != '([])') {
                    subword = subword.replace(/\(.*\)/,group);
                    subwords = $.merge([subword], subwords);
                    subscores = subscores + subscore; 
                    debug && console.log('sub', subword);
                } else {
                    debug && console.log('nosub', group);
                    return;
                }
            } else {
                return;
            }
        }
        
        var atBoardStart = (dir == 'h') ? x == 0 : y == 0;
        var atBoardEnd = (dir == 'h') ? x == this.xmax : y == this.ymax;
        var partialDict = this.getPartialWords(mainword, dictionary);
        var startDict = this.getWordStarts(mainword, dictionary);
        if (startDict.length) {
            if (this.dict[mainword] ) {
                var foundWords = $.merge([mainword], subwords); 
                var foundScore = mainscore + subscores; 
                var key = JSON.stringify(scratch);
                this.words[key] = foundWords;
                this.scores[key] = foundScore;
            } else if (mainword.indexOf('(') != -1) {
                var before = mainword;
                var substr = subwords.join(' ');
                debug && console.log('substr', substr);
                if (substr.indexOf('(') != -1) {
                    var subgroup = /\(.*\)/.exec(substr)[0]; 
                    debug && console.log('before', mainword);
                    mainword = mainword.replace(/\(.*\)/,subgroup);
                    debug && console.log('after', mainword);
                }
                var re = new RegExp('^' + mainword + '$', 'mg');
                var group = '([';
                var replacer = '';
                while(match = re.exec(startDict)) {
                    group += match[1];
                    replacer = match[1];
                }
                group += '])';
                debug && console.log('group', group); 
                if (group != '([])') {
                    var foundWords = $.merge([mainword], subwords); 
                    var foundScore = mainscore + subscores; 
                    var key = JSON.stringify(scratch);
                    key = key.replace(/\(.*\)/g,replacer);
                    foundWords = foundWords.map(function(word) {return word.replace(/\(.*\)/g,replacer+'&#803;') });
                    this.words[key] = foundWords;
                    this.scores[key] = foundScore;
                    debug && console.log(key);
                }
            }
            // if this is the beginning of a word, add stuff to the back
            if (!atBoardEnd){
                this.search(false, x, y, tiles, found.start, found.length, dir, subwords, subscores, partialDict, scratch);
            }
        }
       
        if (!atBoardStart) {
            // always search for a word start
            if (startDict.length || partialDict.length) { 
                this.search(true, x, y, tiles, found.start, found.length, dir, subwords, subscores, partialDict, scratch);
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

    getWordStarts: function(partialWord, dictionary) {
        if ( !this.memoStart[partialWord] ) {
            var re = new RegExp('^' + partialWord + '.*', 'mg');
            var newdict = this.filterWords(re, dictionary);
            this.memoStart[partialWord] = newdict;
        }
        return this.memoStart[partialWord];
    },
    getPartialWords: function(partialWord, dictionary) {
        debug && console.log('partial', partialWord, dictionary.length);
        if ( !this.memoPartial[partialWord] ) {
            var re = new RegExp('.*'+partialWord+'.*', 'mg');
            var newdict = this.filterWords(re, dictionary);
            this.memoPartial[partialWord] = newdict;
        }
        return this.memoPartial[partialWord];
    },

    filterWords: function(re, dictionary) {
        var newdict = (dictionary.match(re) || []).join('\n');
        debug && console.log('filter', re, newdict.length);
        return newdict;
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
      
        var hlen = hword.replace(/[\(\)]/g, '').length; 
        if (dir == 'h' || hlen > 1) {
            found.h = hword; 
            found.hscore = hmulti * hscore + bonus
        }
        if (dir == 'h'){
            found.start = hstart;
            found.length = hlen;
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
        
        var vlen = vword.replace(/[\(\)]/g, '').length; 
        if (dir == 'v' || vlen > 1) {
            found.v = vword;
            found.vscore = vmulti * vscore + bonus;
        } 

        if (dir == 'v'){
            found.start = vstart;
            found.length = vlen; 
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
});
