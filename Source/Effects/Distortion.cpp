#pragma once
#include "Distortion.h"
#include <JuceHeader.h>
using namespace juce;

Distortion::Distortion(float gain, float mix)
    : gainAmount(gain), mixAmount(mix)
{
}

void Distortion::prepare(double sampleRate, int samplesPerBlock)
{
}

void Distortion::process(float* leftChannel, float* rightChannel, int numSamples)
{
    for (int i = 0; i < numSamples; ++i)
    {
        float dryL = leftChannel[i];
        float dryR = rightChannel[i];

        float wetL = hardClip(leftChannel[i] * gainAmount);
        float wetR = hardClip(rightChannel[i] * gainAmount);

        leftChannel[i] = dryL * (1.0f - mixAmount) + wetL * mixAmount;
        rightChannel[i] = dryR * (1.0f - mixAmount) + wetR * mixAmount;
    }
}

float Distortion::hardClip(float sample)
{
    if (sample > 1.0f)
        return 1.0f;
    else if (sample < -1.0f)
        return -1.0f;
    return sample;
}

String Distortion::getName() const
{
    return "Distortion";
}