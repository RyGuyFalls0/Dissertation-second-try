#include "Reverb.h"


audiofx::Reverb::Reverb(float roomSize, float damping, float mix)
    : roomSize(jlimit(0.0f, 1.0f, roomSize)),
    damping(jlimit(0.0f, 1.0f, damping)),
    wetDryMix(jlimit(0.0f, 1.0f, mix))


{
    updateParameters();
}

void audiofx::Reverb::prepare(double sampleRate, int samplesPerBlock)
{
    currentSampleRate = sampleRate;
    reverbProcessor.reset();
    updateParameters();
}

void audiofx::Reverb::process(float* leftChannel, float* rightChannel, int numSamples)
{
    if (leftChannel == nullptr || rightChannel == nullptr)
        return;

    // JUCE Reverb processes stereo in-place
    reverbProcessor.processStereo(leftChannel, rightChannel, numSamples);
}

String audiofx::Reverb::getName() const
{
    return "Reverb";
}

void audiofx::Reverb::updateParameters()
{
    params.roomSize = roomSize;
    params.damping = damping;
    params.wetLevel = wetDryMix;
    params.dryLevel = 1.0f - wetDryMix;
    params.width = 1.0f;
    params.freezeMode = 0.0f;

    reverbProcessor.setParameters(params);
}