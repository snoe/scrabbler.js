scrabbler.SaveView = Backbone.View.extend({
    events: {
        'click #save': 'create',
        'click #clear': 'clearBoard',
        'change #saved': 'load',
    },

    initialize: function() {
        this.board = this.options.board;
        _.bindAll(this, 'addOne', 'addAll', 'remove', 'render');
        this.collection.bind('add', this.addOne);
        this.collection.bind('remove', this.remove);
        this.collection.bind('refresh', this.addAll);
        this.collection.bind('all', this.render);
        this.collection.fetch();
    },

    render: function() {
    },

    addOne: function(save) {
        var newOption = $('<option>' + save.get('name') + '</option>');
        newOption.data('placed', save.get('placed'));
        this.$('#saved').append(newOption);
    },

    addAll: function() {
        this.collection.each(this.addOne);
    },

    remove: function() {
    },

    create: function() {
       var result = this.collection.create({name: this.$('#savename').val(), placed:this.board.get('placed')}); 
       console.log('result ' + result);
    },

    setBoard: function(board) {
        this.board = board;
    },

    clearBoard: function() {
        this.board.set({'placed':{}});
    },
    
    load: function() {
        var placed = $('#saved option:selected').data('placed')
        if (placed) {
            this.board.set({'placed': placed});
        }
    }
});
