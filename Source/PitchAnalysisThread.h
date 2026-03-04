/*
  ==============================================================================

    PitchAnalysisThread.h
    Created: 4 Mar 2026 11:30:02am
    Author:  ryans

  ==============================================================================
*/

#pragma once
#include <JuceHeader.h>
#include "PitchDetector.h"
using namespace juce;

class PitchAnalysisThread : public juce::Thread
{
public:
    PitchAnalysisThread(PitchDetector& pd);

    void run() override;

private:
    PitchDetector& detector;
};
