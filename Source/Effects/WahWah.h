#pragma once
#include "AudioEffects.h"
#include <JuceHeader.h>
using namespace juce;

class WahWah : public AudioEffects
{
public:
    WahWah(float rate, float depth, float mix, float phase);
    ~WahWah() noexcept override = default;

    void prepare(double sampleRate, int samplesPerBlock) override;
    void process(float* leftChannel, float* rightChannel, int numSamples) override;
    String getName() const override;

    void setRate(float rateHz) { rate = jlimit(0.05f, 5.0f, rateHz);; }
    void setDepth(float depthAmount) { depth = jlimit(0.0f, 1.0f, depthAmount); }
    void setMix(float mixAmount) { mix = jlimit(0.0f, 1.0f, mixAmount); }

private:
    dsp::DelayLine<float, dsp::DelayLineInterpolationTypes::Linear> delayLineLeft;
    dsp::DelayLine<float, dsp::DelayLineInterpolationTypes::Linear> delayLineRight;

    float rate;
    float depth;
    float mix;
    float phase;
    double currentSampleRate;
};
