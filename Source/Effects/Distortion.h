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
	
    void setMixAmount(float mix) { mixAmount = jlimit(0.0f,1.0f,mix); }
	void setGainAmount(float gain) { gainAmount = jlimit(1.0f, 100.0f, gain); }


private:
    float hardClip(float sample);

    float gainAmount;
    float mixAmount;
};