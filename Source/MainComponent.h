#pragma once

#include <JuceHeader.h>
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
    enum TransportState
    {
        Stopped,
        Recording
    };
    TransportState transportState;

    WebBrowserComponent webView;
    Resource getResource(const juce::String& url);

    Resource handleStartMicrophone();
    Resource handleStopMicrophone();
    Resource handleGetLevel();
    Resource handleFileUpload(const String& url);
    Resource handleGetUploadStatus();

    // Effects
 /*   Resource handleReverb();
    Resource handleDistortion();
    Resource handleChorus();
    Resource handleDelay();*/

    // extensible list or queue to track which effect should be applied first



    File uploadedFile; 
    std::unique_ptr<FileChooser> fileChooser;
    std::atomic<float> currentLevel{ 0.0f };



    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(MainComponent)
};
