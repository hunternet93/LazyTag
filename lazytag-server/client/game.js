Meteor.startup(function () {
    Tracker.autorun(function () {
        var evt = events.findOne({type: 'state'}, {sort: {'time': -1}});
        if (evt != undefined) {game.state.set(evt.state);}
    });
    
    Tracker.autorun(function () {
        var evt = events.findOne({type: 'teams'}, {sort: {'time': -1}});
        if (evt != undefined) {game.teams.set(evt.teams);}
    });
});

Template.game.helpers({
    state: function () {
        switch (game.state.get()) {
            case 'pregame':
                return 'Pregame';
            case 'started':
                return 'Playing';
            case 'stopped':
                return 'Game Over';
        }
    },
    disabled: function () {
        if (game.state.get() == 'pregame') {
            return;
        }
        return 'disabled';
    },
    teamsis: function (teams) {
        if (game.teams.get() == teams) {
            return 'selected';
        }
    },
    startstop: function () {
        switch (game.state.get()) {
            case 'pregame':
                return 'Start Game';
            case 'started':
                return 'End Game';
            case 'stopped':
                return 'New Game';
        }
    }
});

Template.game.events({
    'submit': function (event) {return false;},
    'change #teams': function (event) {
        Meteor.call('changeTeams', $(event.target).val());
    },
    'click #startstop': function (event) {
        switch (game.state.get()) {
            case 'pregame':
                Meteor.call('startGame');
                break;
            case 'started':
                Meteor.call('stopGame');
                break;
            case 'stopped': 
                Meteor.call('newGame');
                break;
            }
        return false;
    }
});
