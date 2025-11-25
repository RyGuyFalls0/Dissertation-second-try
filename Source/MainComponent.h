#pragma once

#include <JuceHeader.h>
#include "Effects/AudioEffects.h"
#include "Effects/Delay.h"
//#include "Effects/Reverb.h"
//#include "Effects/Distortion.h"

using namespace juce;
using Resource = WebBrowserComponent::Resource;
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
        juce::String name;
        int position;
        juce::var specifics;
    };

    enum TransportState
    {
        Stopped,
        Recording
    };
    TransportState transportState;

    WebBrowserComponent webView;
    Resource getResource(const String& url);

	Resource handleEffects(const String& url);

    Resource handleStartMicrophone();
    Resource handleStopMicrophone();
    Resource handleGetLevel();
    Resource handleFileUpload(const String& url);
    Resource handleGetUploadStatus();

	std::vector<std::unique_ptr<AudioEffects>> effectChain;
	double currentSampleRate = 44100;

    // extensible list or queue to track which effect should be applied first



    File uploadedFile; 
    std::unique_ptr<FileChooser> fileChooser;
    std::atomic<float> currentLevel{ 0.0f };



    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(MainComponent)
};
