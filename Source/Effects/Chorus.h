#pragma once
#include "AudioEffects.h"
#include <JuceHeader.h>
using namespace juce;

class Chorus : public AudioEffects
{
public:
    Chorus(float rate = 1.0f, float depth = 0.5f, float mix = 0.5f, float phase = 0.0f);
    ~Chorus() noexcept override = default;

    void prepare(double sampleRate, int samplesPerBlock) override;
    void process(float* leftChannel, float* rightChannel, int numSamples) override;
    String getName() const override { return "Chorus"; }

    void setRate(float rateHz) { rate = rateHz; }
    void setDepth(float depthAmount) { depth = depthAmount; }
    void setMix(float mixAmount) { mix = mixAmount; }

private:
    dsp::DelayLine<float, dsp::DelayLineInterpolationTypes::Linear> delayLineLeft;
    dsp::DelayLine<float, dsp::DelayLineInterpolationTypes::Linear> delayLineRight;

    float rate;
    float depth;
    float mix;
    float phase;
    double currentSampleRate;
};
