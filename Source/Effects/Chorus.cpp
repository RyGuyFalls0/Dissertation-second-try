#pragma once
#include "Chorus.h"
#include <JuceHeader.h>
using namespace juce;


Chorus::Chorus(float rate, float depth, float mix, float phase)
    : rate(rate), depth(depth), mix(mix), phase(phase), currentSampleRate(44100.0)
{
}

void Chorus::prepare(double sampleRate, int samplesPerBlock)
{
    currentSampleRate = sampleRate;
    phase = 0.0f;

    // Set maximum delay time (20ms for chorus)
    int maxDelaySamples = static_cast<int>(0.02 * sampleRate);
    delayLineLeft.setMaximumDelayInSamples(maxDelaySamples);
    delayLineRight.setMaximumDelayInSamples(maxDelaySamples);

    delayLineLeft.prepare({ sampleRate, static_cast<juce::uint32>(samplesPerBlock), 1 });
    delayLineRight.prepare({ sampleRate, static_cast<juce::uint32>(samplesPerBlock), 1 });

    delayLineLeft.reset();
    delayLineRight.reset();
}

void Chorus::process(float* leftChannel, float* rightChannel, int numSamples)
{
    for (int i = 0; i < numSamples; ++i)
    {
        // Calculate LFO (Low Frequency Oscillator) value
        float lfo = std::sin(2.0f * juce::MathConstants<float>::pi * phase);

        // Calculate delay time in samples (5-15ms range)
        float baseDelay = 0.010f * currentSampleRate; // 10ms base delay
        float modulation = depth * 0.005f * currentSampleRate; // ±5ms modulation
        float delayTimeSamples = baseDelay + modulation * lfo;

        // Store dry signal
        float dryL = leftChannel[i];
        float dryR = rightChannel[i];


        // Set delay time first
        delayLineLeft.pushSample(0, dryL);
        delayLineRight.pushSample(0, dryR);

        // Then set delay and read
        delayLineLeft.setDelay(delayTimeSamples);
        delayLineRight.setDelay(delayTimeSamples);

        float wetL = delayLineLeft.popSample(0);
        float wetR = delayLineRight.popSample(0);

        // Mix - this ensures you always hear the dry signal
        leftChannel[i] = dryL * (1.0f - mix) + wetL * mix;
        rightChannel[i] = dryR * (1.0f - mix) + wetR * mix;

        phase += rate / currentSampleRate;
        if (phase >= 1.0f)
            phase -= 1.0f;
    }
}