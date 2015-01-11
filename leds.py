import asyncio
import time
from RPIO import PWM
PWM.setup()
PWM.init_channel(0)

class LED:
    def __init__(self, pin):
        self.pin = pin
        self.value = 0
        self.fading = False
        self.flashing = False
        asyncio.get_event_loop().create_task(self.tick)

    @asyncio.coroutine
    def tick(self):
        while True:
            if self.fading:
                if self.value < self.fading[0]:
                    try: self.value = self.fading[0] / (self.fading[1] / (time.time() - self.fading[2]))
                    except ZeroDivisionError: self.value = self.fading[0]
                    if self.value >= self.fading[0]:
                        self.value = self.fading[0]
                        self.fading = False
                        
                elif self.value > self.fading[0]:
                    try: self.value = self.fading[0] / (self.fading[1] / (self.fading[1] - (time.time() - self.fading[2])))
                    except ZeroDivisionError: self.value = self.fading[0]
                    if self.value <= self.fading[0]:
                        self.value = self.fading[0]
                        self.fading = False

                self._set()
            
            yield from asyncio.sleep(0.1)

    def _set(self):
        PWM.add_channel_pulse(0, self.pin, 0, int(1999 * self.value))

    def set(self, value):
        self.value = value
        self._set()
                
    def fade(self, value, length):
        self.fading = (value, length, time.time())
