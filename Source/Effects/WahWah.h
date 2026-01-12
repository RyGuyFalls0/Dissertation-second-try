#pragma once
#include "AudioEffects.h"
#include <JuceHeader.h>
using namespace juce;

class WahWah : public AudioEffects
{
public:
    WahWah(float frequency, float resonance, float mix);
    ~WahWah() noexcept override = default;

    void prepare(double sampleRate, int samplesPerBlock) override;
    void process(float* leftChannel, float* rightChannel, int numSamples) override;
    void updateFilterCoefficients();
    String getName() const override;

private:
    float centerFrequency; 
    float q;               
    float wetDryMix; 
    double currentSampleRate = 44100.0;

    float x1_L = 0.0f, x2_L = 0.0f, y1_L = 0.0f, y2_L = 0.0f;
    float x1_R = 0.0f, x2_R = 0.0f, y1_R = 0.0f, y2_R = 0.0f;

    float b0, b1, b2, a1, a2;
};
