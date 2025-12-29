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

    static std::vector<std::byte> stringToVector(const String &str)
    {
        std::vector<std::byte> result(str.length());
        std::memcpy(result.data(), str.toRawUTF8(), str.length());
        return result;
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

    // Prepare all effects in the chain
    for (auto &effect : *effectChain)
    {
        effect->prepare(sampleRate, samplesPerBlockExpected);
    }
}

void MainComponent::getNextAudioBlock(const AudioSourceChannelInfo &bufferToFill)
{
    if (!effectChain->empty())
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

    auto level = bufferToFill.buffer->getRMSLevel(0, bufferToFill.startSample, bufferToFill.numSamples);
    currentLevel.store(level);
    //DBG("Buffer RMS before processing: " << bufferToFill.buffer->getRMSLevel(0, bufferToFill.startSample, bufferToFill.numSamples));
}

void MainComponent::releaseResources()
{
    effectChain->clear();
}

//==============================================================================
void MainComponent::paint(Graphics &g) { ; }

void MainComponent::resized()
{
    webView.setBounds(getLocalBounds());
}

WebBrowserComponent::Resource MainComponent::getAudioDevices() {
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

    if (setup.inputDeviceName.isNotEmpty() && setup.outputDeviceName.isNotEmpty()) {
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
    }
    else {
        devicesResult->setProperty("status", "error");
        devicesResult->setProperty("message", "No audio devices configured");
    }

    String jsonResponse = JSON::toString(var(devicesResult.get()));

    return WebBrowserComponent::Resource{
        stringToVector(jsonResponse),
        "application/json"
    };
}

auto MainComponent::getResource(const String &url) -> Resource
{
    if (url.startsWith("/api/"))
    {
        // Handle API requests
        // handleEffects(url);
        // Adding delay effect, adding distortion, adding reverb, and adding
        if (url.startsWith("/api/effects"))
        {
            DBG("Effects endpoint called from frontend");

            // TODO: Parse request body + update audio chain here
            URL parsedUrl(url);
            DBG("URL: " + url);

            // probably not safe as accessing array without checking size
            auto paramValues = parsedUrl.getParameterValues(); // returns an array of all the values, so we just want the first one (metadata)

            String metadataJson = paramValues[0];
            DBG("Metadata JSON: " + metadataJson);

            if (metadataJson == "{}")
            {
                effectChain->clear();
                String errorResponse = R"({"status": "success", "message": "Missing metadata parameter"})";
                return WebBrowserComponent::Resource{
                    stringToVector(errorResponse),
                    "application/json"};
            }
            auto json = JSON::parse(metadataJson);
            if (!json.isObject())
            {
                String errorResponse = R"({"error":"Invalid JSON"})";
                return Resource{stringToVector(errorResponse), "application/json"};
            }

            auto jsonObject = json.getDynamicObject();

            std::vector<std::pair<int, EffectInfo>> sortedEffects;

            for (auto &prop : jsonObject->getProperties())
            {
                auto effectId = prop.name.toString();
                auto effectData = prop.value.getDynamicObject();

                if (effectData != nullptr)
                {
                    EffectInfo info;
                    info.name = effectData->getProperty("name").toString();
                    info.position = (int)effectData->getProperty("position");
                    info.specifics = effectData->getProperty("specifics").getDynamicObject();

                    sortedEffects.push_back({info.position, info});
                }
            }

            std::sort(sortedEffects.begin(), sortedEffects.end(),
                      [](const auto &a, const auto &b)
                      { return a.first < b.first; });

            // Add effects to the chain in order
			// new chain is created to avoid threading issues
            auto newChain = std::make_shared<std::vector<std::unique_ptr<AudioEffects>>>();
			newChain->reserve(5); // assuming a max of 5 effects for now
            for (const auto &[pos, effectInfo] : sortedEffects)
            {
                std::unique_ptr<AudioEffects> effect;
                effect = EffectsFactory::createEffect(effectInfo.name, effectInfo.specifics);
                if (effect)
                {
                    effect->prepare(currentSampleRate, 512);
                    newChain->push_back(std::move(effect));
                    DBG("New effect");
                }
            }
            // chain does not store any previous data when effect is added or removed
            std::atomic_store(&effectChain, newChain);

            auto response = R"({"status": "success"})";
            return Resource{stringToVector(response), "application/json"};
        }
        else if (url.startsWith("/api/audioList")) {
            return getAudioDevices();
        }
    }

    static const auto resourceFileRoot = File::getCurrentWorkingDirectory()
        .getChildFile("UI")
        .getChildFile("dist");
    DBG("Resource root: " + resourceFileRoot.getFullPathName());

    const auto resourceToRetrieve = url == "/" ? "index.html"
                                               : url.fromFirstOccurrenceOf("/", false, false);
    const auto resource = resourceFileRoot.getChildFile(resourceToRetrieve);

    if (resource.existsAsFile())
    {
        const auto extension = resourceToRetrieve.fromLastOccurrenceOf(".", false, false);
        return Resource{streamToVector(resource), getMimeForExtension(extension)};
    }

    return Resource{{}, "text/plain"};
}

Resource MainComponent::handleStartMicrophone()
{
    transportState = Recording;

    auto response = R"({"status": "success", "message": "Microphone started"})";
    return Resource{stringToVector(response), "application/json"};
}

Resource MainComponent::handleStopMicrophone()
{
    transportState = Stopped;

    auto response = R"({"status": "success", "message": "Microphone stopped"})";
    return Resource{stringToVector(response), "application/json"};
}

Resource MainComponent::handleGetLevel()
{
    String state = transportState == Recording ? "recording" : "stopped";
    float level = currentLevel.load();

    String response = "{\"status\":\"success\",\"state\":\"" + state +
                      "\",\"level\":" + String(level, 6) + "}";

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