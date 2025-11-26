#pragma once
#include "AudioEffects.h"
#include <JuceHeader.h>

class Distortion : public AudioEffects
{
public:
    Distortion(float gain = 10.0f, float mix = 0.7f);
    ~Distortion() noexcept override = default;
    void prepare(double sampleRate, int samplesPerBlock) override;
    void process(float* leftChannel, float* rightChannel, int numSamples) override;
    juce::String getName() const override;

private:
    float hardClip(float sample);

    float gainAmount;
    float mixAmount;
};