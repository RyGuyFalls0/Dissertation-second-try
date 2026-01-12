#pragma once
#include "AudioEffects.h"
#include <JuceHeader.h>

using namespace juce;

class Delay : public AudioEffects
{
public:
    Delay(float delayTimeSeconds, float feedback, float mix);
	~Delay() noexcept override = default;

    void prepare(double sampleRate, int samplesPerBlock) override;
    void process(float* leftChannel, float* rightChannel, int numSamples) override;
    String getName() const override;

private:
	// interpolation type set to None for simplicity -- could be set to Linear for smoother delay time changes
    dsp::DelayLine<float, dsp::DelayLineInterpolationTypes::None> delayLineLeft;
    dsp::DelayLine<float, dsp::DelayLineInterpolationTypes::None> delayLineRight;
    float delayTime;
    float feedbackAmount;
	float wetDryMix; // 0.0 (dry) and 1.0 (wet) -- usually between 0.2-0.5
    double currentSampleRate = 44100.0;
};