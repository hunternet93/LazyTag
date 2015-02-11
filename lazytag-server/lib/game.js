game = {
    state: new ReactiveVar(null),
    teams: new ReactiveVar(0)
};

Meteor.methods({
    newGame: function () {
        players.update({}. {$set: {power: 100, score: 0}}, {multi: true});
        events.remove({});
        events.insert({type: 'state', state: 'pregame', time: new Date()});
        game.state.set('pregame');
    },
    startGame: function () {
        events.insert({type: 'state', state: 'started', time: new Date()});
        game.state.set('started');
    },
    stopGame: function () {
        events.insert({type: 'state', state: 'stopped', time: new Date()});
        game.state.set('stopped');
    },
    
    changeTeams: function (teams) {
        if (teams < 0 || teams == 1 || teams > 4) {
            throw "Invalid number of teams!";
        }
        
        events.insert({type: 'teams', teams: teams, time: new Date()});
        game.teams.set(teams);
        if (teams == 0) {
            players.update({}, {$set: {team: 0}}, {multi: true});
        }
        
        else {
            var team = 1;
            players.find().forEach(function (player, index) {
                players.update(player._id, {$set: {team: team}});
                if (team >= teams) {team = 1;}
                else {team += 1;}
            });
        }
    },
    
    newPlayer: function (tagger_id) {
        if (players.find({tagger_id: tagger_id}).count() > 0) {return;}
        if (game.teams.get() == 0) {var team = 0;}
        else {
            var team = null;
            var least_count = Infinity;
            for (var t = 1; t<=game.teams.get(); t++) {
                count = players.find({team: t}).count();
                if (count < least_count) {
                    team = t;
                    least_count = count;
                }
            }
        }
            
        players.insert({
            tagger_id: tagger_id,
            name: tagger_id,
            power: 100,
            team: team,
            score: 0
        });
    },
    playerChangeTeam: function (tagger_id, team) {
        players.update({tagger_id: tagger_id}, {$set: {team: team}});
    },
    playerChangeName: function (tagger_id, name) {
        players.update({tagger_id: tagger_id}, {$set: {name: name}});
    },
    playerDelete: function (tagger_id) {
        players.remove({tagger_id: tagger_id});
    },
    
    wasHit: function (shooter_id, target_id) {
        events.insert({'type': 'hit', 'shooter_id': shooter_id, 'target_id': target_id, time: new Date()});
        players.update({tagger_id: target_id}, {$inc: {power: -10}}); // TODO change this to look up the shooter's tagger type, adjust damage accordingly
    },
    wasTagged: function (shooter_id, target_id) {
        events.insert({'type': 'tagged', 'shooter_id': shooter_id, 'target_id': target_id, time: new Date()});
        players.update({tagger_id: shooter_id}, {$inc: {score: 1}});
        players.update({tagger_id: target_id}, {$set: {power: 0}}); // TODO change this to look up the shooter's tagger type, adjust damage accordingly
    }
});
