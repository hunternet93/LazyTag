try:
    import ujson as json
except ImportError:
    import json

def tojson(*args):
    return json.dumps(*args, default = lambda o: o.__dict__)
    
def fromjson(str):
    return json.loads(str)

class Tagger:
    name = 'Tagger'
    id = 0
    damage = 1
    delay = 0.01
        
class SuperTagger(Tagger):
    name = 'Super Tagger!'
    id = 1
    damage = 100
    delay = 0.5
        
taggers = {Tagger.id: Tagger, SuperTagger.id: SuperTagger}

class Player:
    def __init__(self, clientinfo):
        self.id = clientinfo['id']
        self.name = clientinfo['name']
        self.tagger = clientinfo['tagger']
        
        self.connected = False
        self.playing = False
        self.power = 0
        self.team = 0

    def update(self, event):
        self.__dict__.update(event)

class Game:
    def __init__(self):
        self.state = 'idle'
        self.mode = None
        self.teams = 0
        
    def update(self, event):
        self.__dict__.update(event)

