#pragma once
#include "AudioEffects.h"
#include <JuceHeader.h>

using namespace juce;

class ReverbEffect : public AudioEffects
{
public:
    ReverbEffect(float roomSize = 0.5f, float damping = 0.5f, float mix = 0.3f);

    void prepare(double sampleRate, int samplesPerBlock) override;
    void process(float* leftChannel, float* rightChannel, int numSamples) override;
    String getName() const override;
};

//private:
//    roomSize;
//    damping;
//    wetLevel ;
//    dryLevel = 1.0f - mix;
//    width = 1.0f;
//    reverb.setParameters(params);
//};

// reverb is actually really hard to do, there is a juce::reverb class that does most of the heavy lifting