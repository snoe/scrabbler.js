TestCase("SingleLetterTest", {
    setUp : function() {
        solver.debug = false;
        this.placed = {7:{7:{tile:'a',isold:true}}};
        this.dict = 'at\nate\nba\ncar\nsha\ngram\nprams'
    },
    testFindEmpty : function() {
        var empties = solver.findEmpty([7,7], this.placed);
        assertEquals(empties.sort(), [[6,7], [8,7],[7,6],[7,8]].sort());
    },
    testFindEmpties : function() {
        var empties = solver.findEmpties(this.placed);
        assertEquals(empties.sort(), [[6,7], [8,7],[7,6],[7,8]].sort());
    },
    testFindWords : function() {
        var words = solver.findWords(7, 7, 'v', this.dict, this.placed);
        assertEquals([], words);
    },
    testSolveNoWords : function() {
        var words = solver.solve('z', this.dict, this.placed);
        assertEquals({}, words);
    },
    testSolveWordAfterExisiting : function() {
        var words = solver.solve('t', this.dict, this.placed);
        var expected = {};
        
        var scratch = solver.place(7,8,'t',this.placed);
        solver.addValidWords([solver.down('at',7)], scratch, expected);
        
        var scratch = solver.place(8,7,'t',this.placed);
        solver.addValidWords([solver.across('at',7)], scratch, expected);
        
        assertEquals(expected, words);
    },
    testSolveWordBeforeExisting : function() {
        var words = solver.solve('b', this.dict, this.placed);
        var expected = {};
        
        var scratch = solver.place(7,6,'b',this.placed);
        solver.addValidWords([solver.down('ba',6)], scratch, expected);
        
        var scratch = solver.place(6,7,'b',this.placed);
        solver.addValidWords([solver.across('ba',6)], scratch, expected);
        assertEquals(expected, words);
    },
    testSolveWordStraddleExisting : function() {
        var words = solver.solve('cr', this.dict, this.placed);
        var expected = {};
        
        var scratch = solver.place(7,6,'c',this.placed);
        scratch = solver.place(7,8,'r',scratch);
        solver.addValidWords([solver.down('car',6)], scratch, expected);
        
        var scratch = solver.place(6,7,'c',this.placed);
        scratch = solver.place(8,7,'r',scratch);
        solver.addValidWords([solver.across('car',6)], scratch, expected);
        assertEquals(expected, words);
    },
    testSolveWordExtendNewWithFound : function() {
        var words = solver.solve('te', this.dict, this.placed);
        var expected = {};
        
        var scratch = solver.place(7,8,'t',this.placed);
        solver.addValidWords([solver.down('at',7)], scratch, expected);
        scratch = solver.place(7,9,'e',scratch);
        solver.addValidWords([solver.down('ate',7)], scratch, expected);

        var scratch = solver.place(8,7,'t',this.placed);
        solver.addValidWords([solver.across('at',7)], scratch, expected);
        scratch = solver.place(9,7,'e',scratch);
        solver.addValidWords([solver.across('ate',7)], scratch, expected);
        assertEquals(expected, words);
    },
    testSolveWordExtendNew: function() {
        var words = solver.solve('sh', this.dict, this.placed);
        var expected = {};
        
        var scratch = solver.place(5,7,'s',this.placed);
        scratch = solver.place(6,7,'h',scratch);
        solver.addValidWords([solver.across('sha',5)], scratch, expected);
        
        var scratch = solver.place(7,5,'s',this.placed);
        scratch = solver.place(7,6,'h',scratch);
        solver.addValidWords([solver.down('sha',5)], scratch, expected);

        assertEquals(expected, words);
    },
    testSolveWordExtendNewAndStraddle: function() {
        var words = solver.solve('grm', this.dict, this.placed);
        var expected = {};
        
        var scratch = solver.place(5,7,'g',this.placed);
        scratch = solver.place(6,7,'r',scratch);
        scratch = solver.place(8,7,'m',scratch);
        solver.addValidWords([solver.across('gram',5)], scratch, expected);

        var scratch = solver.place(7,5,'g',this.placed);
        scratch = solver.place(7,6,'r',scratch);
        scratch = solver.place(7,8,'m',scratch);
        solver.addValidWords([solver.down('gram',5)], scratch, expected);

        assertEquals(expected, words);
    },
    testSolveWordExtendNewAndStraddleLong: function() {
        var words = solver.solve('prms', this.dict, this.placed);
        var expected = {};
        
        var scratch = solver.place(5,7,'p',this.placed);
        scratch = solver.place(6,7,'r',scratch);
        scratch = solver.place(8,7,'m',scratch);
        scratch = solver.place(9,7,'s',scratch);
        solver.addValidWords([solver.across('prams',5)], scratch, expected);

        var scratch = solver.place(7,5,'p',this.placed);
        scratch = solver.place(7,6,'r',scratch);
        scratch = solver.place(7,8,'m',scratch);
        scratch = solver.place(7,9,'s',scratch);
        solver.addValidWords([solver.down('prams',5)], scratch, expected);

        assertEquals(expected, words);
    }
});

function getPlaced(board) {
    var placed = {};

    board.forEach(function(row, y) {
        var tiles = row.split('');
        tiles.forEach(function(tile, x){
            if (tile == '.') {
                return;
            }
            if (!placed[x]) {
                placed[x] = {};
            }
            placed[x][y] = {tile:tile.toLowerCase()};
            if (tile == tile.toUpperCase()){
                placed[x][y]['isold'] = true;
            }
        });
    });
    return placed;
}

TestCase("TwoLetterTest", {
    setUp : function() {
        this.placed = getPlaced(['.....',
                                '.....',
                                '..A..',
                                '..G..',
                                '.....',
                                '.....']);
        this.dict = 'an\nno\ngo\ngap\nold';
    },
    testSolveWordParallel: function() {
        var words = solver.solve('no', this.dict, this.placed);
        var expected = {};

        var scratch =getPlaced(['.....',
                                '.....',
                                '..An.',
                                '..G..',
                                '.....',
                                '.....']);
        solver.addValidWords([solver.across('an',2)], scratch, expected);
        
        var scratch =getPlaced(['.....',
                                '.....',
                                '..A..',
                                '..Go.',
                                '.....',
                                '.....']);
        solver.addValidWords([solver.across('go',3)], scratch, expected);
        
        var scratch =getPlaced(['.....',
                                '.....',
                                '..An.',
                                '..Go.',
                                '.....',
                                '.....']);
        solver.addValidWords([solver.down('no',3),solver.across('an',2),solver.across('go',3)], scratch, expected);

        console.log(JSON.stringify(expected,null,2));
        console.log(JSON.stringify(words,null,2));
        assertEquals(expected, words);
    }
});
