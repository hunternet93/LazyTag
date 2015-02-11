Template.playerList.helpers({
    teams: function () {
        var output = [];
        var num_teams = game.teams.get();
        
        if (num_teams == 0) {
            output.push({
                team: 0,
                teamname: 'Players',
                teamclass: 'team-0',
                grid: 'pure-u-1'
            });
        }
        
        else {
            for (var t=1; t<=num_teams; t++) {
                output.push({
                    team: t,
                    teamname: 'Team ' + t,
                    teamclass: 'team-' + t,
                    grid: 'pure-u-lg-1-' + num_teams
                });
            }
        }
        return output;
    },
    players: function (team) {
        return players.find({team: team}, {sort: {'score': -1}});
    }
});
