#include "WahWah.h"
using namespace juce;


WahWah::WahWah(float frequency, float resonance, float mix)
    : centerFrequency(jlimit(100.0f, 5000.0f, frequency)),
    q(jlimit(0.5f, 20.0f, resonance)),
    wetDryMix(jlimit(0.0f, 1.0f, mix))
{
    updateFilterCoefficients();
}

void WahWah::prepare(double sampleRate, int samplesPerBlock)
{
    currentSampleRate = sampleRate;

    // Reset filter state (avoids pops/clicks when processing starts)
    x1_L = x2_L = y1_L = y2_L = 0.0f;
    x1_R = x2_R = y1_R = y2_R = 0.0f;

    // Recalculate coefficients (in case sampleRate differs)
    updateFilterCoefficients();
}

void WahWah::process(float* leftChannel, float* rightChannel, int numSamples)
{
    if (leftChannel == nullptr || rightChannel == nullptr)
        return;

    for (int i = 0; i < numSamples; ++i)
    {
        // Process left channel
        float inputL = leftChannel[i];
        float outputL = b0 * inputL + b1 * x1_L + b2 * x2_L - a1 * y1_L - a2 * y2_L;

        // Update state variables
        x2_L = x1_L;
        x1_L = inputL;
        y2_L = y1_L;
        y1_L = outputL;

        // Apply wet/dry mix
        leftChannel[i] = inputL * (1.0f - wetDryMix) + outputL * wetDryMix;

        // Process right channel
        if (rightChannel)
        {
            float inputR = rightChannel[i];
            float outputR = b0 * inputR + b1 * x1_R + b2 * x2_R - a1 * y1_R - a2 * y2_R;

            // Update state variables
            x2_R = x1_R;
            x1_R = inputR;
            y2_R = y1_R;
            y1_R = outputR;

            // Apply wet/dry mix
            rightChannel[i] = inputR * (1.0f - wetDryMix) + outputR * wetDryMix;
        }
    }
}

void WahWah::updateFilterCoefficients()
{
    float omega = 2.0f * MathConstants<float>::pi * centerFrequency / currentSampleRate;
    float alpha = std::sin(omega) / (2.0f * q);

    // Band-pass constant skirt gain
    b0 = q * alpha;
    b1 = 0.0f;
    b2 = -alpha;
    float a0 = 1.0f + alpha;
    a1 = -2.0f * std::cos(omega);
    a2 = 1.0f - alpha;

    // normalise
    b0 /= a0; b1 /= a0; b2 /= a0;
    a1 /= a0; a2 /= a0;
}

String WahWah::getName() const
{
    return "WahWah";
}

