#pragma once

#include <JuceHeader.h>
#include "Effects/AudioEffects.h"
#include "./Effects/Factory/EffectsFactory.h"

using namespace juce;
using Resource = WebBrowserComponent::Resource;

//==============================================================================
/*
    This component lives inside our window, and this is where you should put all
    your controls and content.
*/
class MainComponent  : public AudioAppComponent
{
public:
    //==============================================================================
    MainComponent();
    ~MainComponent() override;

    //==============================================================================
    void prepareToPlay (int samplesPerBlockExpected, double sampleRate) override;
    void getNextAudioBlock (const AudioSourceChannelInfo& bufferToFill) override;
    void releaseResources() override;

    //==============================================================================
    void paint (Graphics& g) override;
    void resized() override;

private:
    //==============================================================================
    // Your private member variables go here...

    struct EffectInfo
    {
        String name;
        int position;
        DynamicObject::Ptr specifics;
    };

    struct Tuner
    {
        std::atomic<float> pitchHz{ 0.0f };
        std::atomic<float> confidence{ 0.0f }; // may remove later
    };

    enum TransportState
    {
        Stopped,
        Recording
    };
    TransportState transportState;


    WebBrowserComponent webView;
    Resource getResource(const String& url);


    Resource handleStartMicrophone();
    Resource handleStopMicrophone();
    Resource handleGetLevel();
  /*  Resource handleFileUpload(const String& url);*/
    //Resource handleGetUploadStatus();
    Resource getAudioDevices();
    Resource createEffectsChain(const String& url);

    Resource standardError(const String& message);
    Resource setAudioDevices(const String& url);
    var getJsonParameter(const String& url);


    std::shared_ptr<std::vector<std::unique_ptr<AudioEffects>>> effectChain{ std::make_shared<std::vector<std::unique_ptr<AudioEffects>>>() };
	double currentSampleRate = 44100;


    AudioDeviceManager deviceManager;


    std::atomic<float> currentLevel{ 0.0f };
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(MainComponent)
};
