#!/usr/bin/env python3

import asyncio
import websockets
import socket
from shared import *

def log(*message):
    # I'll eventually have options to do something else here?
    print(*message)
        
class Main:
    def __init__(self):
        self.game = Game()

        self.players = {}
        self.events = []

    def new_event(self, event):
        send_event = True
        
        if event.get('player'):
            e = event.get('player')
            player = self.players[e['id']]
            player.update(e)
                                        
        if send_event:
            self.events.append(event)

    def new_player(self, player):
        self.players[player.id] = player
        self.events.append({'player': player})
        log('new player:', player.name, player.id)
    
main = Main()
loop = asyncio.get_event_loop()

@asyncio.coroutine
def send_events(websocket):
    event_index = len(main.events)
    while websocket.open:
        if len(main.events) > event_index:
            events = main.events[event_index-1:]
            event_index = len(main.events)
            for event in events: yield from websocket.send(tojson(event))
            
        yield from asyncio.sleep(0.1)

@asyncio.coroutine
def handle_client(websocket, path):
    clientinfo = yield from websocket.recv()
    clientinfo = fromjson(clientinfo)
    print(clientinfo)

    player = False

    if clientinfo.get('type') == 'player':
        if clientinfo['player']['id'] in main.players:
            player = main.players[clientinfo['player']['id']]
            print(player.name, 'reconnected')
            main.new_event({'player': {'id': player.id, 'connected': True}})

        else:
            player = Player(clientinfo['player'])
            player.connected = True
            main.new_player(player)
            
    elif clientinfo.get('type') == 'web':
        log('new web client connected: ', websocket.getpeername())
    
    yield from websocket.send(tojson({'game': main.game}))
    for p in main.players.values(): yield from websocket.send(tojson({'player': p}))

    loop.create_task(send_events(websocket))
    while websocket.open:
        message = yield from websocket.recv()
        if not message: break
        else: main.new_event(fromjson(message))

    print(player.name, 'disconnected')        
    main.new_event({'player': {'id': player.id, 'connected': False}})
    
start_server = websockets.serve(handle_client, '0.0.0.0', 8765)

loop.run_until_complete(start_server)
loop.run_forever()
