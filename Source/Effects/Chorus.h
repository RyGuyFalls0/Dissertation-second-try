#pragma once
#include "AudioEffects.h"
#include <JuceHeader.h>
using namespace juce;

class Chorus : public AudioEffects
{
public:
    Chorus(float rate, float depth, float mix, float phase);
    ~Chorus() noexcept override = default;

    void prepare(double sampleRate, int samplesPerBlock) override;
    void process(float* leftChannel, float* rightChannel, int numSamples) override;
    String getName() const override;

private:
    dsp::DelayLine<float, dsp::DelayLineInterpolationTypes::Linear> delayLineLeft;
    dsp::DelayLine<float, dsp::DelayLineInterpolationTypes::Linear> delayLineRight;

    float rate;
    float depth;
    float mix;
    float phase;
    double currentSampleRate;
};
