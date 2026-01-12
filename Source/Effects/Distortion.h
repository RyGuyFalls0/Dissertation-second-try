#pragma once
#include "AudioEffects.h"
#include <JuceHeader.h>
using namespace juce;

class Distortion : public AudioEffects
{
public:
    Distortion(float gain, float mix);
    ~Distortion() noexcept override = default;

    void prepare(double sampleRate, int samplesPerBlock) override;
    void process(float* leftChannel, float* rightChannel, int numSamples) override;
    String getName() const override;
	

private:
    float hardClip(float sample);

    float gainAmount;
    float mixAmount;
};