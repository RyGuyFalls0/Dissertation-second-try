#include "PitchDetector.h"


void PitchDetector::prepare(double sampleRate, int maxBlockSize)
{
    sr = sampleRate;
}

void PitchDetector::process(const float* input, int numSamples)
{
    for (int i = 0; i < numSamples; ++i)
        pushSample(input[i]);
}

bool PitchDetector::getPitch(float& detectedHz)
{
    if (!ready)
        return false;

    detectedHz = lastPitch;
    ready.store(false);
    return true;
}

void PitchDetector::pushSample(float s)
{
    ringBuffer[writeIndex++] = s;
    writeIndex %= bufferSize;

    if (++samplesCollected >= hopSize)
    {
        samplesCollected = 0;
        analyse();
    }
}

void PitchDetector::analyse()
{
    // Autocorrelation or YIN goes here
    lastPitch = estimatePitch();
    ready = true;
}

float PitchDetector::estimatePitch() { // implemented separately
};