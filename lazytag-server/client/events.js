Template.gameEvents.helpers({
    getEvents: function () {
        var output = [];
        events.find({}, {sort: {'time': 1}}).forEach(function (event, index) {
            var o = {time: event.time};
            switch (event.type) {
                case 'state':
                    switch(event.state) {
                        case 'pregame':
                            o.text = 'Waiting to start.';
                            break;
                        case 'started':
                            o.text = 'Game started.';
                            break;
                        case 'stopped':
                            o.text = 'Game stopped.';
                            break;
                    }
                    break;

                case 'teams':
                    o.text = 'Number of teams changed to ' + event.teams;
                    break;
                    
                case 'tagged':
                    var shooter = players.findOne({tagger_id: event.shooter_id}).name;
                    var target = players.findOne({tagger_id: event.target_id}).name;                    
                    o.text = target + ' was tagged by ' + shooter;
                    break;
            }
            if (o.text) {output.push(o);}
        });
        
        $('#events').scrollTop($('#events').prop('scrollHeight'));
        return output;
    }                
});
