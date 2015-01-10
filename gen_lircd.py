from shared import *

players = 0xFF
commands = {
    'FIRE': [0,len(taggers)],
}

print('''# LazyTag lircd.conf
begin remote
  name LazyTag
  bits            16
  flags RC6|CONST_LENGTH
  eps            30
  aeps          100

  header       2667   889
  one           444   444
  zero          444   444
  pre_data_bits   13
  pre_data       0xEEE
  gap          108000
  toggle_bit      5

  begin codes''')



for player in range(0, players):
    for command in commands.keys():
        for value in range(commands[command][0], commands[command][1]):
            print('    {player}_{command}_{value} {code}'.format(
                player = player,
                command = command,
                value = value,
                code = hex((player << 8) | value)
            ))
    
print('''  end codes
end remote''')
