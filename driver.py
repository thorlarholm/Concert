#! /usr/bin/env python

from audioFormats import *

# Create generic audio object 
obj = audio("web/media/Oddity.wav")

# Create WAV object
wavObj = wav(obj)
length = wavObj.getLength()
wavObj.generateWaveform('Oddity_'+str(5 * length)+'.png', 5 * length, 585)
wavObj.crop("out.wav", 126, 232)

# Create MP3 object
mp3Obj = mp3(obj)
mp3Obj.mp3Encode("out.mp3", 192)

# Create ogg object
oggObj = ogg(obj)
oggObj.oggEncode("out.ogg")
