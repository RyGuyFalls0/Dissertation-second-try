#pragma once
#include "Delay.h"
#include <JuceHeader.h>
using namespace juce;


Delay::Delay(float delayTimeSeconds, float feedback, float mix)
    : delayTime(delayTimeSeconds), feedbackAmount(feedback), wetDryMix(mix)
    // maybe change these to have jlimit around them -- 1.1
{
	// inititialise maximum delay time to 2 seconds at 48kHz
    delayLineLeft.setMaximumDelayInSamples(96000);
    delayLineRight.setMaximumDelayInSamples(96000);
}

//prepare the delay effect with the given sample rate and block size
void Delay::prepare(double sampleRate, int samplesPerBlock)
{
    currentSampleRate = sampleRate;
	uint32 num_channels = 1;
    delayLineLeft.prepare({ sampleRate, (uint32)samplesPerBlock, num_channels });
    delayLineRight.prepare({ sampleRate, (uint32)samplesPerBlock, num_channels });

	// convert delay time from seconds to samples -- cast to integer for simplicity and then cast to float to avoid warnings
    int delaySamples = (int)(delayTime * sampleRate);
    delayLineLeft.setDelay((float)delaySamples);
    delayLineRight.setDelay((float)delaySamples);
}

//process the audio samples through the delay effect
void Delay::process(float* leftChannel, float* rightChannel, int numSamples)
{
    for (int i = 0; i < numSamples; ++i)
    {
        float delayedSampleL = delayLineLeft.popSample(0);
        float inputL = leftChannel[i];
        delayLineLeft.pushSample(0, inputL + delayedSampleL * feedbackAmount);
        leftChannel[i] = inputL * (1.0f - wetDryMix) + delayedSampleL * wetDryMix;

        if (rightChannel)
        {
            float delayedSampleR = delayLineRight.popSample(0);
            float inputR = rightChannel[i];
            delayLineRight.pushSample(0, inputR + delayedSampleR * feedbackAmount);
            rightChannel[i] = inputR * (1.0f - wetDryMix) + delayedSampleR * wetDryMix;
        }
    }
}

String Delay::getName() const { return "Delay"; }