#pragma once
#include <JuceHeader.h>
using namespace juce;


class PitchDetector
{
public:
    void prepare(double sampleRate, int maxBlockSize);
    void process(const float* input, int numSamples);
    void reset();
    bool getPitch(float& detectedHz, float& confidence);

private:
    // good practise (for tha diss)
    void pushSample(float s);
    float calculateDifference(int tau);
    void estimatePitch();

private:
    float sr = 44100.0;
    static const int bufferSize = 4096;
    static const int hopSize = 1024;

    float ringBuffer[bufferSize]{};
    int writeIndex = 0;
    int samplesCollected = 0;
	float yinBuffer[bufferSize / 2]{};
	float maxTau = bufferSize / 2;
    const float threshold = 0.15f; // Starting with 0.15 (likely between 0.10 and 0.15)

    float lastPitch = 0.0f;
    float lastConfidence = 0.0f;
    std::atomic<bool> ready{ false };
};