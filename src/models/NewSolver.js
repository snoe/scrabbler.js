var NewSolver = Backbone.Model.extend({
    initialize: function() {
        var dictionary = this.get('dictionary');
        var dictlen = dictionary.length;
        this.dict = {};
        for (var i = 0; i < dictlen; i++) {
            this.dict[dictionary[i]] = true;
        }
    },

    getStringsFrom: function(x, y, dx, dy, rack, blanks, placed) {
        var tile;
        var word = '';
        var newx = x;
        var newy = y;
        var newplaces = {};
        var i = 0;
        var key = newx + ',' + newy;
        var racklen = rack.length;
        var allwords = [];

        while(i < racklen || placed[key]) {
            if (placed[key]) {
                tile = placed[key].tile;
            } else {
                tile = rack[0];
                rack = rack.slice(1);
                var isblank = blanks[i];
                newplaces[key] = {tile:tile, isblank:isblank}; 
                var sidea = dx ? this.meta[key].up : this.meta[key].left;
                var sideb = dx ? this.meta[key].down : this.meta[key].right;

                if (sidea.word && !sideb.word) {
                    var sideword = sidea.word + tile;
                    if (this.dict[sideword]) {
                        allwords.push(sideword);
                    } else {
                        return;
                    }
                } else if (!sidea.word && sideb.word) {
                    var sideword = tile + sideb.word;
                    if (this.dict[sideword]) {
                        allwords.push(sideword);
                    } else {
                        return;
                    }
                } else if (sidea.word && sideb.word) {
                    var sideword = sidea.word + tile + sideb.word;
                    if (this.dict[sideword]) {
                        allwords.push(sideword);
                    } else {
                        return;
                    }
                }
                i += 1;
            }
            newx += dx;
            newy += dy;

            if (newx >= 14 || newy >= 14) {
                return;
            }

            key = newx + ',' + newy;
            word += tile;
        }

        if (this.dict[word]) {
            var scratch = _.extend(newplaces, placed);
            allwords.push(word);
            return {found: allwords, placed: scratch};
        }     
    },

    solve: function(rack, placed) {
        this.numcalls = 0;
        this.perms = {};
        this.permute(rack, 0);
        this.meta = this.buildMeta(placed);

        console.log('Possible numcalls', Object.keys(this.perms).length * 14 * 14);

        var words = [];
        for (var perm in this.perms) {
            var rack = perm.split('');
            var racklen = rack.length;
            for (var y=0; y<14; y++) {
                for (var x=0; x<14; x++) {
                    if (this.meta[x+','+y].down.hit <= racklen) {
                        this.numcalls += 1;
                        var word = this.getStringsFrom(x, y, 0, 1, rack, {}, placed);
                        if (word) {
                            words.push(word);
                        }
                    }

                    if (this.meta[x+','+y].right.hit <= racklen) {
                        this.numcalls += 1;
                        var word = this.getStringsFrom(x, y, 1, 0, rack, {}, placed);
                        if (word) {
                            words.push(word);
                        }
                    }
                }
            }
        }

        console.log('Actual numcalls', this.numcalls);
        console.log('Actual found', words.length);

        return {words: words}; 
    },

    swapAndAdd: function(i, d, char, str, isblank) {
        var newstr = '' + str;
        newstr = newstr.substr(0,i) + str[d] + newstr.substr(i+1);
        newstr = newstr.substr(0,d) + char + newstr.substr(d+1);
        var perm = newstr.substr(0,d+1);
        this.perms[perm] = isblank;
        return newstr;
    },

    permute: function(str, d) {
        if (d !== str.length) {
            var lastSwap;
            for (var i = d; i < str.length; i++) {
                if (lastSwap === str[i]) {
                    continue
                }
                lastSwap = str[i];
                if (lastSwap == '?') {
                    for (var x = 0; x < 26; x++) {
                        var char = String.fromCharCode(97 + x);
                        var newstr = this.swapAndAdd(i, d, char, str, true);
                        this.permute(newstr, d + 1);
                    }
                } else {
                    var newstr = this.swapAndAdd(i, d, str[i], str, false);
                    this.permute(newstr, d + 1);
                }
            } 
        }
    },
    
    buildMeta: function(placed) {
        var meta = {};
        for (var y=0; y<14; y++) {
            for (var x=0; x<14; x++) {
                var key = x+','+y;
                meta[key] = {};
                meta[key].left = this.wordInDir(x,y,-1,0,placed);
                meta[key].right = this.wordInDir(x,y,1,0,placed);
                meta[key].up = this.wordInDir(x,y,0,-1,placed);
                meta[key].down = this.wordInDir(x,y,0,1,placed);
            }
        }        
        return meta;
    },

    wordInDir: function(x,y,dx,dy,placed) {
        var word = '';
        var newx = x + dx;
        var newy = y + dy;
        var next = placed[newx + ',' + newy];
        var tohit = placed[x+','+y] ? 0 : undefined;
        var count = 1;

        while(newx >= 0 && newy >= 0 && newx < 14 && newy < 14) {
            if (next) {
                word += next.tile;
                tohit = tohit || count;
            }
            
            var sidea = placed[(newx+dy) + ',' + (newy+dx)];
            var sideb = placed[(newx+dy*-1) + ',' + (newy+dx*-1)];
            if (sidea || sideb) {
                tohit = tohit || count+1;
            }

            newx += dx;
            newy += dy;
            next = placed[newx + ',' + newy];
            count += 1;
        } 
        if (dx < 0 || dy < 0) {
            split = word.split('');
            split.reverse()
            word = split.join('');
        }
        return {word: word, hit: tohit};

    },

});

if (typeof exports !== 'undefined') {
    exports.Solver = NewSolver;
}
