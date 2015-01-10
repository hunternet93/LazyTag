#!/usr/bin/env python3

import asyncio
import websockets
import socket
import sys    
from shared import *

config = fromjson(open(sys.argv[1]).read())

events = []
me = Player({'id': config['id'], 'name': config['name'], 'tagger': config['tagger']})
players = {me.id: me}
game = Game()
loop = asyncio.get_event_loop()

def debug(websocket):
    if websocket.open:
        command = sys.stdin.readline()
        if command and len(command.split()) > 0:
            command = command.split()
            if command[0] == 'status':
                print('game:', game.__dict__)
                print('me', me.__dict__)
                print('players', [p.__dict__ for p in players.values()])
            elif command[0] == 'power':
                me.power = int(command[1])
                events.append({'player': {'id': me.id, 'power': me.power}})
            elif command[0] == 'hit':
                events.append({'hit': {'shooter': players[command[1]].id, 'target': me.id}})
        
@asyncio.coroutine
def send_events(websocket):
    while websocket.open:
        while len(events) > 0:
            yield from websocket.send(tojson(events.pop(0)))
            
        yield from asyncio.sleep(0.1)

@asyncio.coroutine
def main(websocket):
    while websocket.open:
        message = yield from websocket.recv()
        message = fromjson(message)
#        print('msg from server:', message)
        
        if message.get('game'): game.update(message['game'])
        
        if message.get('player'):
            id = message['player']['id']
            if players.get(id):
                players[id].update(message['player'])
            else:
                players[id] = Player(message['player'])
                
        if message.get('hit'):
            if message['hit']['shooter'] == me.id:
                print('i hit', message['hit']['target'])

@asyncio.coroutine
def connect():
    while True:
        websocket = yield from websockets.connect(config['server'])
        if websocket.open:
            yield from websocket.send(
                tojson({
                    'type': 'player',
                    'player': me
                })
            )

            loop.add_reader(sys.stdin, debug, websocket)
            loop.create_task(send_events(websocket))
            yield from main(websocket)

        else:
            asyncio.sleep(1)

loop.run_until_complete(connect())
