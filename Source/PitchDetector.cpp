#include "PitchDetector.h"

void PitchDetector::prepare(double sampleRate, int maxBlockSize)
{
    sr = sampleRate;
}

void PitchDetector::process(const float* input, int numSamples)
{
    for (int i = 0; i < numSamples; ++i)
        pushSample(input[i]);
}

void PitchDetector::reset()
{
    writeIndex = 0;
    samplesCollected = 0;
    lastPitch = 0.0f;
    lastConfidence = 0.0f;
    ready.store(false);

    std::fill(std::begin(ringBuffer), std::end(ringBuffer), 0.0f);
}

bool PitchDetector::getPitch(float& detectedHz, float& confidence)
{
    if (!ready)
        return false;

    detectedHz = lastPitch;
    confidence = lastConfidence;
    ready.store(false);
    return true;
}

void PitchDetector::pushSample(float s)
{
    ringBuffer[writeIndex++] = s;
    writeIndex %= bufferSize;

    if (++samplesCollected >= hopSize)
    {
        samplesCollected = 0;
        estimatePitch();
		ready.store(true);
    }
}

float PitchDetector::calculateDifference(int tau)
{
    float sum = 0.0f;
    for (int i = 0; i < maxTau ; ++i)
    {
        float delta = ringBuffer[i] - ringBuffer[i + tau];
        sum += delta * delta;
    }
    return sum;
}

void PitchDetector::estimatePitch() 
{ 
    yinBuffer[0] = 1.0f;
    float runningSum = 0.0f;

	// Calculate the difference function and apply normalization (says ryguy)
    for (int tau = 1; tau < maxTau; ++tau)
    {
        yinBuffer[tau] = calculateDifference(tau);
        runningSum += yinBuffer[tau];
        yinBuffer[tau] *= tau / runningSum;
    }

    int tauEstimate = -1;
    for (int tau = 2; tau < maxTau; ++tau)
    {
        if (yinBuffer[tau] < threshold)
        {
            while (tau + 1 < maxTau && yinBuffer[tau + 1] < yinBuffer[tau])
                tau++;

            tauEstimate = tau;
            break;
        }
    }

    if (tauEstimate == -1) {
        lastConfidence = 0.0f;
        return;
    }

	auto rawHz = sr / tauEstimate; // frequency in Hz
    auto confidence = 1.0f - yinBuffer[tauEstimate];
    lastConfidence = jlimit(0.0f, 1.0f, confidence); //confidence 

    constexpr float alpha = 0.15f; // arbitrary value -- need justification

    if (lastPitch == 0.0f)
        lastPitch = rawHz; // initialise
    else
        lastPitch = alpha * rawHz + (1.0f - alpha) * lastPitch;
};