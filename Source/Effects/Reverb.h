#pragma once
#include "AudioEffects.h"
#include <JuceHeader.h>
using namespace juce;

namespace audiofx
{
class Reverb : public AudioEffects
    {
    public:
        Reverb(float roomSize, float damping, float mix);
        ~Reverb() noexcept override = default;

        void prepare(double sampleRate, int samplesPerBlock) override;
        void process(float* leftChannel, float* rightChannel, int numSamples) override;
        String getName() const override;

        void setRoomSize(float size) { roomSize = jlimit(0.0f, 1.0f, size); updateParameters(); }
        void setDamping(float damp) { damping = jlimit(0.0f, 1.0f, damp); updateParameters(); }
        void setWetDryMix(float wetDry) { wetDryMix = jlimit(0.0f, 1.0f, wetDry); updateParameters(); }

    private:
        juce::Reverb reverbProcessor;
        juce::Reverb::Parameters params;

        float roomSize;      // 0.0-1.0, typical: 0.3 (small) to 0.8 (large hall)
        float damping;       // 0.0-1.0, typical: 0.3 (bright) to 0.7 (dark)
        float wetDryMix;     // 0.0 (dry) to 1.0 (wet), typical: 0.2-0.4

        double currentSampleRate = 44100.0;

        void updateParameters();
    };
} 