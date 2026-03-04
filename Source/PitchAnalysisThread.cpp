#include "PitchAnalysisThread.h"

PitchAnalysisThread::PitchAnalysisThread(PitchDetector& pd)
        : Thread("PitchAnalysis"), detector(pd)
    {
    }

void PitchAnalysisThread::run()
    {
        while (!threadShouldExit())
        {
            detector.runAnalysis();
        }
    }