SaveGame = Backbone.Model.extend({
});
SaveGames = Backbone.Collection.extend({
    localStorage: new Store('saves'),
    model: SaveGame
});
