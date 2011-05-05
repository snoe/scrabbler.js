function getPlaced(board) {
    var placed = {};

    board.forEach(function(row, y) {
        var tiles = row.split('');
        tiles.forEach(function(tile, x){
            if (tile == '.') {
                return;
            }
            placed[x+','+y] = {tile:tile.toLowerCase()};
            if (tile == tile.toUpperCase()){
                placed[x+','+y]['isold'] = true;
            }
        });
    });
    return placed;
}

exports.getPlaced = getPlaced;
