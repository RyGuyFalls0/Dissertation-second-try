#include "MainComponent.h"
using namespace juce;
using Resource = WebBrowserComponent::Resource;

// Anonymous namespace for helper functions
namespace
{
    static const char* getMimeForExtension(const juce::String& extension)
    {
        static const std::unordered_map<juce::String, const char*> mimeMap =
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
            {"woff2", "font/woff2"} };

        if (const auto it = mimeMap.find(extension.toLowerCase()); it != mimeMap.end())
            return it->second;

        jassertfalse;
        return "";
    }

    static auto streamToVector(const juce::File& file)
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

    static std::vector<std::byte> stringToVector(const juce::String& str)
    {
        std::vector<std::byte> result(str.length());
        std::memcpy(result.data(), str.toRawUTF8(), str.length());
        return result;
    }
};


//==============================================================================
MainComponent::MainComponent()
    : transportState(Stopped),
    webView(WebBrowserComponent::Options{}
        .withBackend(WebBrowserComponent::Options::Backend::webview2)
        .withWinWebView2Options(
            WebBrowserComponent::Options::WinWebView2{}
            .withUserDataFolder(File::getSpecialLocation(File::tempDirectory)))
        .withResourceProvider([this](const auto& url) { return getResource(url); })
        .withNativeIntegrationEnabled(true))
{
    setSize (800, 600);
	addAndMakeVisible(webView);
    webView.goToURL(webView.getResourceProviderRoot());
    setAudioChannels (2, 2);
}

MainComponent::~MainComponent()
{
    // This shuts down the audio device and clears the audio source.
    shutdownAudio();
}

//==============================================================================
void MainComponent::prepareToPlay (int samplesPerBlockExpected, double sampleRate)
{
    currentLevel.store(0.0f);
}

void MainComponent::getNextAudioBlock(const AudioSourceChannelInfo& bufferToFill)
{
    if (transportState != Recording)
    {
        bufferToFill.clearActiveBufferRegion();
        currentLevel.store(0.0f);
        return;
    }

    // Calculate level (do this once, outside the loop)
    auto level = bufferToFill.buffer->getRMSLevel(0, bufferToFill.startSample, bufferToFill.numSamples);
    currentLevel.store(level);
}

void MainComponent::releaseResources()
{
    // This will be called when the audio device stops, or when it is being
    // restarted due to a setting change.

    // For more details, see the help for AudioProcessor::releaseResources()
}

//==============================================================================
void MainComponent::paint(Graphics& g) { ; }

void MainComponent::resized()
{
    webView.setBounds(getLocalBounds());
}

auto MainComponent::getResource(const String& url) -> Resource
{
    if (url.startsWith("/api/"))
    {
        if (url == "/api/start")
            return handleStartMicrophone();
        else if (url == "/api/stop")
            return handleStopMicrophone();
        else if (url == "/api/level")
            return handleGetLevel();
        else if (url == "/api/upload")
			return handleFileUpload(url);
        else if (url == "/api/upload-status")
            return handleGetUploadStatus();
        else if (url == "/api/play-file")
            return handlePlayFile();
        else if (url == "/api/pause-file")
            return handlePauseFile();
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
        return Resource{ streamToVector(resource), getMimeForExtension(extension) };
    }

    return Resource{ {}, "text/plain" };
}

Resource MainComponent::handleStartMicrophone()
{
    transportState = Recording;

    auto response = R"({"status": "success", "message": "Microphone started"})";
    return Resource{ stringToVector(response), "application/json" };
}

Resource MainComponent::handleStopMicrophone()
{
    transportState = Stopped;

    auto response = R"({"status": "success", "message": "Microphone stopped"})";
    return Resource{ stringToVector(response), "application/json" };
}

Resource MainComponent::handleGetLevel()
{
    String state = transportState == Recording ? "recording" : "stopped";
    float level = currentLevel.load();

    String response = "{\"status\":\"success\",\"state\":\"" + state +
        "\",\"level\":" + String(level, 6) + "}";

    return Resource{ stringToVector(response), "application/json" };
}

Resource MainComponent::handleFileUpload(const String& url)
{
    fileChooser = std::make_unique<FileChooser>("Select an audio file to upload",
        File::getSpecialLocation(File::userDocumentsDirectory),
        "*.wav;*.mp3;*.aiff;*.flac");

    auto flags = FileBrowserComponent::openMode | FileBrowserComponent::canSelectFiles;

    fileChooser->launchAsync(flags, [this](const FileChooser& chooser)
        {
            auto file = chooser.getResult();
            if (file != File{})
            {
                uploadedFile = file;
                DBG("File uploaded: " + uploadedFile.getFullPathName());
            }
            else
            {
                DBG("File selection cancelled");
            }
        });
    auto response = R"({"status": "success", "message": "File chooser opened"})";
    return Resource{ stringToVector(response), "application/json" };
}

Resource MainComponent::handleGetUploadStatus()
{
    juce::DynamicObject::Ptr jsonObject = new juce::DynamicObject();
    jsonObject->setProperty("status", "success");

    if (uploadedFile != File{})
    {
        jsonObject->setProperty("uploaded", true);
        jsonObject->setProperty("filename", uploadedFile.getFileName());
        jsonObject->setProperty("path", uploadedFile.getFullPathName());
    }
    else
    {
        jsonObject->setProperty("uploaded", false);
    }

    String response = JSON::toString(var(jsonObject.get()));
    return Resource{ stringToVector(response), "application/json" };
}

// look into vectorised transformations
// look into other juce applications to understand gaps in the market and directions to take the project