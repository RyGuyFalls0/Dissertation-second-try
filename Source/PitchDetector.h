#pragma once
#include <JuceHeader.h>
using namespace juce;


class PitchDetector
{
public:
    void prepare(double sampleRate, int maxBlockSize);
    void process(const float* input, int numSamples);
    bool getPitch(float& detectedHz);

private:
    // good practise (for tha diss)
    void pushSample(float s);
    void analyse();
    float estimatePitch();

private:
    double sr = 44100.0;
    static const int bufferSize = 4096;
    static const int hopSize = 512;

    float ringBuffer[bufferSize]{};
    int writeIndex = 0;
    int samplesCollected = 0;

    float lastPitch = 0.0f;
    std::atomic<bool> ready{ false };
};