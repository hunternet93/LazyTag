#!/usr/bin/env python3

import asyncio
import ddp_asyncio
import socket
import sys
import pygame.mixer
import json
import random
#import leds
from datetime import datetime, timedelta, timezone

pygame.mixer.init()
sounds = {
    'laser': pygame.mixer.Sound('sfx/laser1.wav'),
    'hit': pygame.mixer.Sound('sfx/hit1.wav'),
    'was_hit': pygame.mixer.Sound('sfx/was_hit1.wav'),
    'was_tagged': pygame.mixer.Sound('sfx/was_tagged.wav'),
    'untagged': pygame.mixer.Sound('sfx/untagged1.wav')
}

config = json.load(open(sys.argv[1]))
loop = asyncio.get_event_loop()

class game:
    meteor = None
    state = None
    teams = None
    events = None
    players = None
    me = {}
    teamnames = [
        'Free For All',
        'Blue',
        'Red',
        'Green',
        'Yellow'
    ]

last_command = ''
def debug(websocket):
    global last_command
    command = sys.stdin.readline()
    if command == '.\n':
        command = last_command
    else:
        last_command = str(command)
        
    if command and len(command.split()) > 0:
        command = command.split()
        if command[0] == 'status':
            print('game:', game.state)
            print('me', game.me)
            print('players', game.players.data)

@asyncio.coroutine
def new_event(events, eventid, event):
    print(repr(event['time']))
    if event['type'] == 'state':
        game.state = event['state']
        # SFX game start/end
    
    if event['type'] == 'teams':
        game.teams = event['teams']
        
    if event['type'] == 'hit' and event['shooter_id'] == game.me.get('tagger_id'):
        if event['time'] > (datetime.now(timezone.utc) - timedelta(seconds=1)):
            sounds['hit'].play()
            
    if event['type'] == 'tagged' and event['shooter_id'] == game.me.get('tagger_id'):
        if event['time'] > (datetime.now(timezone.utc) - timedelta(seconds=1)):
            pass # SFX tagged
        
@asyncio.coroutine
def players_ready(players):
    for player in game.players.data.values():
        if player['tagger_id'] == config['tagger_id']:
            game.me = dict(player)
            
    if not game.me:
        raise Exception("I'm not in the playerlist!")
        
@asyncio.coroutine
def players_changed(players, playerid, player):
    p = players.data[playerid]
    if game.me and p['tagger_id'] == game.me['tagger_id']:
        if not p['team'] == game.me['team']:
            #SFX team X
            print("You are now on " + game.teamnames[p['team']])
            
        game.me = dict(p)

@asyncio.coroutine
def main():
    while True:
        # TODO check LIRC, poll GPIO, etc.
        yield from asyncio.sleep(1) # Make this shorter once this function does something.
                
@asyncio.coroutine
def connect():
    game.meteor = ddp_asyncio.DDPClient(config['server'])
    yield from game.meteor.connect()
    yield from game.meteor.call('newPlayer', [config['tagger_id']])
    game.events = yield from game.meteor.subscribe('events', added_cb = new_event)
    game.players = yield from game.meteor.subscribe(
        'players',
        ready_cb = players_ready,
        changed_cb = players_changed
    )
    
    while True:
        if game.meteor.connected:
            loop.add_reader(sys.stdin, debug, game.meteor)
            yield from main()

        else:
            yield from asyncio.sleep(1)

loop.run_until_complete(connect())
