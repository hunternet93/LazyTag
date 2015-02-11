Template.player.helpers({
    showteamsel: function () {
        if (game.teams.get() > 0) {return true};
    },
    teamnums: function (myteam) {
        var teamnum = [];
        for (var i=1; i<=game.teams.get(); i++) {
            teamnum.push({
                team: i,
                selected: (myteam == i) ? 'selected' : null
            });
        }
        return teamnum;
    }
});
    
Template.player.events({
    'submit': function (event) {return false;},
    'click .imgbutton': function (event) {
        if ($(event.target).hasClass('rotated')) {
            // There's probably a better way to do this...
            $(event.target).closest('div.playerlists').find('.imgbutton').addClass('rotated');
            $(event.target).removeClass('rotated');
            
            $(event.target).closest('div.playerlists').find('.player-settings').addClass('collapsed');
            $(event.target).closest('tr').next().find('div.player-settings').removeClass('collapsed');
        }
        else {
            $(event.target).addClass('rotated');
            $(event.target).closest('tr').next().find('div.player-settings').addClass('collapsed');
        }
    },
    'change .team-select': function (event) {
        Meteor.call('playerChangeTeam', this.tagger_id, parseInt($(event.target).val()));
    },
    'blur .name-input': function (event) {
        Meteor.call('playerChangeName', this.tagger_id, $(event.target).val());
    },
    'keypress .name-input': function (event) {
        if (event.key == 'Enter') {
            $(event.target).blur();
            return false;
        }
    },
    'click .delete-button': function (event) {
        Meteor.call('playerDelete', this.tagger_id);
    }
});
