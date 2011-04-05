scrabbler.SaveGame = Backbone.Model.extend({
});
scrabbler.SaveGames = Backbone.Collection.extend({
    localStorage: new Store('saves'),
    model: scrabbler.SaveGame
});
