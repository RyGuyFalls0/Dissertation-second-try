class PitchDetector
{
public:
    void prepare(double sampleRate, int maxBlockSize)
    {
        sr = sampleRate;
    }

    void process(const float* input, int numSamples)
    {
        for (int i = 0; i < numSamples; ++i)
            pushSample(input[i]);
    }

    bool getPitch(float& detectedHz)
    {
        if (!ready)
            return false;

        detectedHz = lastPitch;
        ready = false;
        return true;
    }

private:
    // good practise (for tha diss)
    void pushSample(float s)
    {
        ringBuffer[writeIndex++] = s;
        writeIndex %= bufferSize;

        if (++samplesCollected >= hopSize)
        {
            samplesCollected = 0;
            analyse();
        }
    }

    void analyse()
    {
        // Autocorrelation or YIN goes here
        lastPitch = estimatePitch();
        ready = true;
    }

    float estimatePitch(); // implemented separately

private:
    double sr = 44100.0;
    static constexpr int bufferSize = 4096;
    static constexpr int hopSize = 512;

    float ringBuffer[bufferSize]{};
    int writeIndex = 0;
    int samplesCollected = 0;

    float lastPitch = 0.0f;
    std::atomic<bool> ready{ false };
};  can you expand on what the things in this class do