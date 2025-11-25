// AudioEffect.h
#pragma once
#include <JuceHeader.h>

class AudioEffects
{
public:
    virtual ~AudioEffects() noexcept = default;
    virtual void prepare(double sampleRate, int samplesPerBlock) = 0;
    virtual void process(float* leftChannel, float* rightChannel, int numSamples) = 0;
    virtual juce::String getName() const = 0;
};
