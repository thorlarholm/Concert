#!/usr/bin/env python

import os
import subprocess
from chunk import *
import wave

from waveform import *

environ = {'PATH': str(os.getenv('PATH'))}

## Audio Class
# @class audio
#
class audio:
    ## Constructor
    #
    # @param self Class Object
    # @param inputFileName The name of a WAV file
    #
    def __init__(self, inputFileName):
        # Make sure file exists
        if not os.path.isfile(inputFileName):
            raise IOError
        
        ##  @public fileName  
        self.fileName = inputFileName

## WAV class
# @class wav
#
# @extends audio
class wav(audio):
    ## Gets the length, in seconds, of a wave file
    #
    # @param self Class object
    # @param inputFileName The name of the wave file to get the length of
    #
    # @return Number of seconds
    def getLength(self, inputFileName):
        waveFile = wave.open(inputFileName, 'r')
        length = waveFile.getnframes() / waveFile.getframerate()
        waveFile.close()

        return length

    ## Decodes a WAV file
    #
    # @param self
    # @param outputFileName
    #
    def decode(self, outputFileName):
        pass

    ## Encodes a file as WAV
    #
    # @param self
    # @param outputFileName
    #
    def encode(self, outputFileName):
        pass

    ## Crops a WAV file to the given seconds
    #
    # @param outputFileName The name of the WAV file to write the cropped data to
    # @param begin The time, in seconds, to begin
    # @param end The time, in seconds, to end
    #
    #  Extra details
    def crop(self, outputFileName, begin, end):
        import wave
        import sys
    
        # Amount of data to read at a time
        chunk = 1024
    
        # Open a wave filehandle
        src = wave.open(self.fileName, 'rb')
    
        # Wav file info
        channels = src.getnchannels()
        format = src.getsampwidth()
        rate = src.getframerate()

        # Store the data in here
        all = []

        # Jump through the beginning
        src.setpos(rate * begin)

        # read data
        for i in range(rate / chunk * begin, rate / chunk * end):
            data = src.readframes(chunk)
            all.append(data)

        # Close the source wav file
        src.close()

        # Join all of the data together
        data = ''.join(all)
    
        # Open the destination wav file
        wf = wave.open(outputFileName, 'wb')
    
        # Set all of the format data
        wf.setnchannels(channels)
        wf.setsampwidth(format)
        wf.setframerate(rate)
    
        # Write the data
        wf.writeframes(data)

        # Close the buffer
        wf.close()

    ## Generates the waveform image from a WAV file
    #
    # @param self Wav object
    # @param inputFileName The name of the WAV file
    # @param imageName The name of the file to write to
    # @param imageWidth Width of image in pixels
    # @param imageHeight Height of image in pixels
    # @param fft_size
    # @param f_max
    # @param f_min
    #
    def generateWaveform(self, inputFileName, imageName, imageWidth, imageHeight, fft_size, f_max, f_min):
        create_png(inputFileName, imageName, imageWidth, imageHeight, fft_size, f_max, f_min);


## MP3
# @class mp3
# 
# @extends audio
class mp3(audio):
    ## Decode an MP3 file
    #
    # @param self
    # @param inputFileName
    # @param outputFileName
    #
    # @return A subprocess object
    def decode(self, inputFileName, outputFileName):
        command = "lame --decode --mp3input '%s' '%s' 2>&1 | awk -vRS='\\r' -F'[ /]+' '(NR>2){print $2/$3;fflush();}'" % (inputFileName, outputFileName)

        sub = subprocess.Popen(command, shell=True, env=environ, stderr=subprocess.PIPE, stdout=subprocess.PIPE, stdin=subprocess.PIPE)
        return sub

    ## Encode audio into MP3
    #
    # @param self
    # @param inputFileName
    # @param outputFileName
    # @param quality
    #
    # @return A subprocess object
    def encode(self, inputFileName, outputFileName, quality=192):
        command = "lame -m auto --preset cbr %i '%s' '%s' 2>&1 | awk -vRS='\\r' '(NR>3){gsub(/[()%%|]/,\" \");if($1 != \"\") print $2/100;fflush();}'" % (quality, inputFileName, outputFileName)

        sub = subprocess.Popen(command, shell=True, env=environ, stderr=subprocess.PIPE, stdout=subprocess.PIPE, stdin=subprocess.PIPE)
        return sub

## Ogg
# @class ogg
#
# @extends audio
class ogg(audio):
    ## Decode an OGG file
    #
    # @param self
    # @param inputFileName
    # @param outputFileName
    #
    # @return A subprocess object
    def decode(self, inputFileName, outputFileName):
        command = "oggdec '%s' -o '%s' 2>&1 | awk -vRS='\\r' '(NR>1){gsub(/%%/,\" \");print $2/100;fflush();}'" % (inputFileName, outputFileName)

        sub = subprocess.Popen(command, shell=True, env=environ, stderr=subprocess.PIPE, stdout=subprocess.PIPE, stdin=subprocess.PIPE)

        return sub, command

    ## Encode audio into OGG
    #
    # @param self
    # @param inputFileName
    # @param outputFileName
    # @param quality
    #
    # @return A subprocess object
    def encode(self, inputFileName, outputFileName, quality=192):
        command = "oggenc -b %i '%s' -o '%s' 2>&1 | awk -vRS='\\r' '(NR>1){gsub(/%%/,\" \");print $2/100;fflush();}'" % (quality, inputFileName, outputFileName)

        sub = subprocess.Popen(command, shell=True, env=environ, stderr=subprocess.PIPE, stdout=subprocess.PIPE, stdin=subprocess.PIPE)

        return sub