/* ==================================== JUCER_BINARY_RESOURCE ====================================

   This is an auto-generated file: Any edits you make may be overwritten!

*/

#include <cstring>

namespace BinaryData
{

//================== index.html ==================
static const unsigned char temp_binary_data_0[] =
"<!doctype html>\n"
"<html lang=\"en\">\n"
"  <head>\n"
"    <meta charset=\"UTF-8\" />\n"
"    <link rel=\"icon\" type=\"image/svg+xml\" href=\"/vite.svg\" />\n"
"    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n"
"    <title>ui</title>\n"
"    <script type=\"module\" crossorigin src=\"/assets/index-BWeKYKQT.js\"></script>\n"
"    <link rel=\"stylesheet\" crossorigin href=\"/assets/index-BfdUJI_d.css\">\n"
"  </head>\n"
"  <body>\n"
"    <div id=\"root\"></div>\n"
"  </body>\n"
"</html>\n";

const char* index_html = (const char*) temp_binary_data_0;


const char* getNamedResource (const char* resourceNameUTF8, int& numBytes);
const char* getNamedResource (const char* resourceNameUTF8, int& numBytes)
{
    unsigned int hash = 0;

    if (resourceNameUTF8 != nullptr)
        while (*resourceNameUTF8 != 0)
            hash = 31 * hash + (unsigned int) *resourceNameUTF8++;

    switch (hash)
    {
        case 0x2c834af8:  numBytes = 449; return index_html;
        default: break;
    }

    numBytes = 0;
    return nullptr;
}

const char* namedResourceList[] =
{
    "index_html"
};

const char* originalFilenames[] =
{
    "index.html"
};

const char* getNamedResourceOriginalFilename (const char* resourceNameUTF8);
const char* getNamedResourceOriginalFilename (const char* resourceNameUTF8)
{
    for (unsigned int i = 0; i < (sizeof (namedResourceList) / sizeof (namedResourceList[0])); ++i)
        if (strcmp (namedResourceList[i], resourceNameUTF8) == 0)
            return originalFilenames[i];

    return nullptr;
}

}
