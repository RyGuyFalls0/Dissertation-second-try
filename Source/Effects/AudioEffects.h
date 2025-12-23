// AudioEffect.h
#pragma once
#include <JuceHeader.h>
using namespace juce;

class AudioEffects
{
public:
    virtual ~AudioEffects() noexcept = default;
    virtual void prepare(double sampleRate, int samplesPerBlock) = 0;
    virtual void process(float* leftChannel, float* rightChannel, int numSamples) = 0;
    virtual String getName() const = 0;
};
