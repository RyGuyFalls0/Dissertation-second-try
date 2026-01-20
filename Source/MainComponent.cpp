#include "MainComponent.h"
using namespace juce;
using Resource = WebBrowserComponent::Resource;

// Anonymous namespace for helper functions
namespace
{
    static const char *getMimeForExtension(const String &extension)
    {
        static const std::unordered_map<String, const char *> mimeMap =
            {
                {"htm", "text/html"},
                {"html", "text/html"},
                {"txt", "text/plain"},
                {"jpg", "image/jpeg"},
                {"jpeg", "image/jpeg"},
                {"svg", "image/svg+xml"},
                {"ico", "image/vnd.microsoft.icon"},
                {"json", "application/json"},
                {"png", "image/png"},
                {"css", "text/css"},
                {"map", "application/json"},
                {"js", "text/javascript"},
                {"woff2", "font/woff2"}};

        if (const auto it = mimeMap.find(extension.toLowerCase()); it != mimeMap.end())
            return it->second;

        jassertfalse;
        return "";
    }

    static auto streamToVector(const File &file)
    {
        auto stream = file.createInputStream();
        if (!stream)
            return std::vector<std::byte>{};

        std::vector<std::byte> result((size_t)stream->getTotalLength());
        stream->setPosition(0);
        [[maybe_unused]] const auto bytesRead = stream->read(result.data(), result.size());
        jassert(bytesRead == (ssize_t)result.size());
        return result;
    }

    static std::vector<std::byte> stringToVector(const String &str) {
    auto utf8 = str.toRawUTF8();
    auto numBytes = str.getNumBytesAsUTF8();
    return std::vector<std::byte>(reinterpret_cast<const std::byte*>(utf8), 
                                   reinterpret_cast<const std::byte*>(utf8) + numBytes);
    }
};

//==============================================================================
MainComponent::MainComponent()
    : transportState(Stopped),
      AudioAppComponent(deviceManager),
      webView(WebBrowserComponent::Options{}
                  .withBackend(WebBrowserComponent::Options::Backend::webview2)
                  .withWinWebView2Options(
                      WebBrowserComponent::Options::WinWebView2{}
                          .withUserDataFolder(File::getSpecialLocation(File::tempDirectory)))
                  .withResourceProvider([this](const auto &url)
                                        { return getResource(url); })
                  .withNativeIntegrationEnabled(true))
{
    setSize(800, 600);
    addAndMakeVisible(webView);
    webView.goToURL(webView.getResourceProviderRoot());

    deviceManager.initialise(2, 2, nullptr, true);
    setAudioChannels(2, 2);
}

MainComponent::~MainComponent()
{
    // This shuts down the audio device and clears the audio source.
    shutdownAudio();
}

//==============================================================================
void MainComponent::prepareToPlay(int samplesPerBlockExpected, double sampleRate)
{
    currentLevel.store(0.0f);

    pitchDetector.prepare(sampleRate, samplesPerBlockExpected);
    if (effectChain != nullptr)
    {
        for (auto& effect : *effectChain)
        {
            effect->prepare(sampleRate, samplesPerBlockExpected);
        }
    }
}

void MainComponent::getNextAudioBlock(const AudioSourceChannelInfo &bufferToFill)
{
    auto* buffer = bufferToFill.buffer;
    const float gain = 20.0f; // your base gain

    for (int channel = 0; channel < buffer->getNumChannels(); ++channel)
    {
        float* channelData = buffer->getWritePointer(channel, bufferToFill.startSample);

        for (int sample = 0; sample < bufferToFill.numSamples; ++sample)
        {
            if (std::abs(channelData[sample]) < 0.0001 || micOn) {
                channelData[sample] = 0;
            }
            channelData[sample] *= gain;
        }
    }
    if (tunerEnabled.load())
    {
        const float* input = bufferToFill.buffer->getReadPointer(0, bufferToFill.startSample);
        pitchDetector.process(input, bufferToFill.numSamples);

        float detectedHz = 0.0f;
        float confidence = 0.0f;
        if (pitchDetector.getPitch(detectedHz, confidence))
        {
            tuner.pitchHz.store(detectedHz);
            tuner.confidence.store(confidence);
        }
    }
    else if (!effectChain->empty())
    {
        auto *leftChannel = bufferToFill.buffer->getWritePointer(0, bufferToFill.startSample);
        auto *rightChannel = bufferToFill.buffer->getNumChannels() > 1
                                 ? bufferToFill.buffer->getWritePointer(1, bufferToFill.startSample)
                                 : nullptr;

        for (auto &effect : *effectChain)
        {
            effect->process(leftChannel, rightChannel, bufferToFill.numSamples);
        }
    }

    const float* processedAudio = bufferToFill.buffer->getReadPointer(0, bufferToFill.startSample);
    const int inputSize = bufferToFill.numSamples;

    int step = inputSize / DS_SIZE; // buffer should usually be about 512 samples long
	step = jmax(1, step);
    
    for (int i = 0; i < DS_SIZE; ++i)
    {
        int index = i * step;
        if (index >= inputSize)
            downsampledBlock[i] = 1e-3f;
        else
            if (processedAudio[index] < 1e-3) { downsampledBlock[i] = 1e-3f; }
            else { downsampledBlock[i] = processedAudio[index]; };
    }

    newBlockReady.store(true, std::memory_order_release);


    auto level = bufferToFill.buffer->getRMSLevel(0, bufferToFill.startSample, bufferToFill.numSamples);
    currentLevel.store(level);
    //DBG("Buffer RMS before processing: " << bufferToFill.buffer->getRMSLevel(0, bufferToFill.startSample, bufferToFill.numSamples));
}

void MainComponent::releaseResources() { ; }

//==============================================================================
void MainComponent::paint(Graphics &g) { ; }

void MainComponent::resized()
{
    webView.setBounds(getLocalBounds());
}

Resource MainComponent::standardError(const String& message) {
    return Resource{
        stringToVector(message),
        "application / json"
    };
}

Resource MainComponent::getAudioDevices() {
    auto setup = deviceManager.getAudioDeviceSetup();
    auto* deviceType = deviceManager.getCurrentDeviceTypeObject();

    if (deviceType == nullptr) {
        auto errorResponse = R"({"status": "error", "message": "No device type available"})";
        return WebBrowserComponent::Resource{
            stringToVector(errorResponse),
            "application/json"
        };
    }

    DynamicObject::Ptr devicesResult = new DynamicObject();

    // Check if devices are configured
    if (setup.inputDeviceName.isEmpty() || setup.outputDeviceName.isEmpty()) {
        String error = deviceManager.initialise(
            2, 
            2,
            nullptr,
            true  // selectDefaultDeviceOnFailure
        );

        if (error.isNotEmpty()) {
            devicesResult->setProperty("status", "error");
            devicesResult->setProperty("message", "No audio devices configured. Failed to reinitialize: " + error);

            String jsonResponse = JSON::toString(var(devicesResult.get()));
            return WebBrowserComponent::Resource{
                stringToVector(jsonResponse),
                "application/json"
            };
        }

        // Get the setup again after reinitialization
        setup = deviceManager.getAudioDeviceSetup();
    }

    // Now populate the device lists
    devicesResult->setProperty("status", "success");
    devicesResult->setProperty("currentInput", setup.inputDeviceName);
    devicesResult->setProperty("currentOutput", setup.outputDeviceName);

    Array<var> inputDevices;
    Array<var> outputDevices;

    for (auto& name : deviceType->getDeviceNames(true))
        inputDevices.add(name);

    for (auto& name : deviceType->getDeviceNames(false))
        outputDevices.add(name);

    devicesResult->setProperty("inputDevices", inputDevices);
    devicesResult->setProperty("outputDevices", outputDevices);

    String jsonResponse = JSON::toString(var(devicesResult.get()), false);
    DBG("Generated JSON: " + jsonResponse);

    return WebBrowserComponent::Resource{
        stringToVector(jsonResponse),
        "application/json"
    };
}

var MainComponent::getJsonParameter(const String& url)
{
    URL parsedUrl(url);
    auto paramValues = parsedUrl.getParameterValues();
    String metadataJson = paramValues[0];

    if (metadataJson.isEmpty())
        return var(); // Return empty var, not a Resource

    auto result = JSON::parse(metadataJson);

    if (!result.isObject() && !result.isArray())
        return var(); // Return empty var if parsing failed

    return result;
}

Resource MainComponent::setAudioDevices(const String& url) {
    auto json = getJsonParameter(url);

    if (!json.isObject() || json.getDynamicObject()->getProperties().size() == 0)
    {
        String response = R"({"status": "error", "message": "Missing or empty config parameter"})";
        return standardError(response);
    }

    auto jsonObject = json.getDynamicObject();
    String outputDevice = jsonObject->getProperty("outputDevice").toString();
    String inputDevice = jsonObject->getProperty("inputDevice").toString();

    DBG("Setting output device: " + outputDevice);
    DBG("Setting input device: " + inputDevice);

    auto newSetup = deviceManager.getAudioDeviceSetup();

    if (outputDevice.isNotEmpty())
        newSetup.outputDeviceName = outputDevice;

    if (inputDevice.isNotEmpty())
        newSetup.inputDeviceName = inputDevice;

    String error = deviceManager.setAudioDeviceSetup(newSetup, true);

    if (error.isEmpty())
    {
        String response = R"({"status": "success", "message": "Audio devices updated successfully"})";
        return standardError(response);
    }
    else
    {
        String response = R"({"status": "error", "message": ")" + error + R"("})";
        return standardError(response);
    }
}

Resource MainComponent::createEffectsChain(const String& url) {
    auto json = getJsonParameter(url);
    if (!json.isObject() || json.getDynamicObject()->getProperties().size() == 0)
    {
        effectChain->clear();
        String response = R"({"status": "success", "message": "Missing or empty metadata parameter"})";
        return standardError(response);
    }

    auto jsonObject = json.getDynamicObject();

    std::vector<std::pair<int, EffectInfo>> sortedEffects;

    for (auto& prop : jsonObject->getProperties())
    {
        auto effectId = prop.name.toString();
        auto effectData = prop.value.getDynamicObject();

        if (effectData != nullptr)
        {
            EffectInfo info;
            info.name = effectData->getProperty("name").toString();
            info.position = (int)effectData->getProperty("position");
            info.specifics = effectData->getProperty("specifics").getDynamicObject();

            sortedEffects.push_back({ info.position, info });
        }
    }

    std::sort(sortedEffects.begin(), sortedEffects.end(),
        [](const auto& a, const auto& b)
        { return a.first < b.first; });

    auto newChain = std::make_shared<std::vector<std::unique_ptr<AudioEffects>>>();
    newChain->reserve(5); // max of 5 effects for now
    for (const auto& [pos, effectInfo] : sortedEffects)
    {
        std::unique_ptr<AudioEffects> effect;
        effect = EffectsFactory::createEffect(effectInfo.name, effectInfo.specifics);
        if (effect)
        {
            effect->prepare(currentSampleRate, 512);
            newChain->push_back(std::move(effect));
        }
    }
    // chain does not store any previous data when effect is added or removed
    std::atomic_store(&effectChain, newChain);

    auto response = R"({"status": "success"})";
    return Resource{ stringToVector(response), "application/json" };
}

Resource MainComponent::handleStartTuner()
{
    tunerEnabled.store(true);
    pitchDetector.reset();
    auto response = R"({"status": "success", "message": "Tuner started"})";
    return Resource{stringToVector(response), "application/json"};
}

Resource MainComponent::handleStopTuner()
{
    tunerEnabled.store(false);
    pitchDetector.reset();
    auto response = R"({"status": "success", "message": "Tuner halted"})";
    return Resource{ stringToVector(response), "application/json" };
}

TuningResult MainComponent::analysePitch(float hz)
{
    static const String notes[] =
    { "C","C#","D","D#","E","F","F#","G","G#","A","A#","B" };

	float midi = 69.0f + 12.0f * std::log2(hz / 440.0f); // standard frequency -> MIDI note conversion
    int nearest = juce::roundToInt(midi);

    float cents = (midi - nearest) * 100.0f;
    int noteIndex = nearest % 12;
    int octave = nearest / 12 - 1;
    return { notes[noteIndex], octave, cents };
}

Resource MainComponent::getTuning()
{
    if (tuner.confidence.load() < 0.8f)
    {
        auto response = R"("message": "Low confidence in pitch detection")";
        DBG(response);
        return standardError(response);
	}
	auto result = analysePitch(tuner.pitchHz.load());
    String response = {
        "{\"status\": \"success\", \"note\": \"" + result.note +
        "\", \"octave\": " + String(result.octave) +
        ", \"cents\": " + String(result.cents, 1) + "}"
    };
    

    return Resource{ stringToVector(response), "application/json" };
}

Resource MainComponent::getAudioPeaks() {
    float min = currentMin.exchange(+1.0f, std::memory_order_acq_rel);
    float max = currentMax.exchange(-1.0f, std::memory_order_acq_rel);

    if (min > max)
    {
        min = 0.0f;
        max = 0.0f;
    }

    min = juce::jlimit(-1.0f, 1.0f, min);
    max = juce::jlimit(-1.0f, 1.0f, max);

    String response = {
        "{\"status\": \"success\", \"min\": " + String(min, 6) +
        ", \"max\": " + String(max, 6) + "}"
	};
    return Resource{ stringToVector(response), "application/json" };
}

Resource MainComponent::getAudioData()
{
    if (!newBlockReady.load())
    {
        return standardError(R"({"status": "error", "message": "No new audio data available"})");
    }
    newBlockReady.store(false);

    juce::var audioArray;
    for (const auto& sample : downsampledBlock)
    {
        audioArray.append(sample);
    }

    juce::var jsonObject = new juce::DynamicObject();
    jsonObject.getDynamicObject()->setProperty("status", "success");
    jsonObject.getDynamicObject()->setProperty("samples", audioArray);

    String response = JSON::toString(jsonObject);

    return Resource{ stringToVector(response), "application/json" };
}


Resource MainComponent::handleSetMasterGain(const String& url) {
    return Resource{};
}

auto MainComponent::getResource(const String &url) -> Resource
{
    if (url.startsWith("/api/"))
    {
        // Handle API requests
        // handleEffects(url);
        // Adding delay effect, adding distortion, adding reverb, and adding
        if (url.startsWith("/api/effects"))
            return createEffectsChain(url);

        else if (url.startsWith("/api/getAudioList"))
            return getAudioDevices();
        else if (url.startsWith("/api/setAudioIO"))
            return setAudioDevices(url);

        else if (url.startsWith("/api/startTuner"))
            return handleStartTuner();
        else if (url.startsWith("/api/stopTuner"))
            return handleStopTuner();
        else if (url.startsWith("/api/getTuning"))
            return getTuning();
        else if (url.startsWith("/api/getAudioData"))
            return getAudioData();
        else if (url.startsWith("/api/startMicrophone"))
            return handleStartMicrophone();
        else if (url.startsWith("/api/stopMicrophone"))
            return handleStopMicrophone();
        else if (url.startsWith("/api/setMasterGain"));
		    return handleSetMasterGain(url);
      
    }
    static const auto resourceFileRoot = File::getCurrentWorkingDirectory()
        .getChildFile("UI")
        .getChildFile("dist");

    const auto resourceToRetrieve = url == "/" ? "index.html"
        : url.fromFirstOccurrenceOf("/", false, false);
    const auto resource = resourceFileRoot.getChildFile(resourceToRetrieve);

    if (resource.existsAsFile())
    {
        const auto extension = resourceToRetrieve.fromLastOccurrenceOf(".", false, false);
        return Resource{ streamToVector(resource), getMimeForExtension(extension) };
    }

    return Resource{ {}, "text/plain" };
}

Resource MainComponent::handleStartMicrophone()
{
	micOn = true;
    auto response = R"({"status": "success", "message": "Microphone started"})";
    return Resource{stringToVector(response), "application/json"};
}

Resource MainComponent::handleStopMicrophone()
{
	micOn = false;
    auto response = R"({"status": "success", "message": "Microphone stopped"})";
    return Resource{stringToVector(response), "application/json"};
}

//Resource MainComponent::handleFileUpload(const String &url)
//{
//    fileChooser = std::make_unique<FileChooser>("Select an audio file to upload",
//                                                File::getSpecialLocation(File::userDocumentsDirectory),
//                                                "*.wav;*.mp3;*.aiff;*.flac");
//
//    auto flags = FileBrowserComponent::openMode | FileBrowserComponent::canSelectFiles;
//
//    fileChooser->launchAsync(flags, [this](const FileChooser &chooser)
//                             {
//            auto file = chooser.getResult();
//            if (file != File{})
//            {
//                uploadedFile = file;
//                DBG("File uploaded: " + uploadedFile.getFullPathName());
//            }
//            else
//            {
//                DBG("File selection cancelled");
//            } });
//    auto response = R"({"status": "success", "message": "File chooser opened"})";
//    return Resource{stringToVector(response), "application/json"};
//}

//Resource MainComponent::handleGetUploadStatus()
//{
//    DynamicObject::Ptr jsonObject = new DynamicObject();
//    jsonObject->setProperty("status", "success");
//
//    if (uploadedFile != File{})
//    {
//        jsonObject->setProperty("uploaded", true);
//        jsonObject->setProperty("filename", uploadedFile.getFileName());
//        jsonObject->setProperty("path", uploadedFile.getFullPathName());
//    }
//    else
//    {
//        jsonObject->setProperty("uploaded", false);
//    }
//
//    String response = JSON::toString(var(jsonObject.get()));
//    return Resource{stringToVector(response), "application/json"};
//}

// look into vectorised transformations
// look into other juce applications to understand gaps in the market and directions to take the project