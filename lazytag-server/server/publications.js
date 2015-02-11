events.remove();
players.remove();

Meteor.publish('events', function () {
    return events.find();
});

Meteor.publish('players', function () {
    return players.find();
});
