var assert = require('assert');
var utils = require('./utils');

require('../src/vendor/underscore-min')
Backbone = require('../src/vendor/backbone-min')
var NewSolver = require('../src/models/NewSolver').Solver

placed = utils.getPlaced(['.....',
                          '.....',
                          '..A..',
                          '..G..',
                          '.....',
                          '.....']);

var solver = new NewSolver({dictionary: ['go', 'ag', 'cat','bag']})
var meta = solver.buildMeta(placed);

// test words
assert.equal(meta['1,2'].right.word, 'a');
assert.equal(meta['3,2'].left.word, 'a');
assert.equal(meta['1,2'].up.word, '');
assert.equal(meta['3,2'].down.word, '');
assert.equal(meta['2,1'].down.word, 'ag');
assert.equal(meta['2,4'].up.word, 'ag');

// Test to hit
assert.equal(meta['0,2'].right.hit, 2);
assert.equal(meta['0,2'].down.hit, undefined);
assert.equal(meta['2,0'].right.hit, undefined);
assert.equal(meta['2,0'].down.hit, 2);
assert.equal(meta['2,1'].down.hit, 1);

// Test to hit side
assert.equal(meta['2,3'].down.hit, 0);
assert.equal(meta['1,1'].down.hit, 2);

placed = utils.getPlaced(['.....',
                          '.....',
                          '.....',
                          '..G..',
                          '.....',
                          '.....']);
// XXX Many more checks here
var solutions = solver.solve('a', placed)
assert.equal(solver.numcalls, 4);
var solutions = solver.solve('ao', placed)
assert.equal(Object.keys(solutions.words).length, 4);


placed = utils.getPlaced(['.....',
                          '.....',
                          '.....',
                          '..X..',
                          '.....',
                          '.....']);
var solver = new NewSolver({dictionary: ['xi', 'ax', 'ai']})
var solutions = solver.solve('xia', placed)
assert.equal(Object.keys(solutions.words).length, 10);

