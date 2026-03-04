/* ==================================== JUCER_BINARY_RESOURCE ====================================

   This is an auto-generated file: Any edits you make may be overwritten!

*/

#include <cstring>

namespace BinaryData
{

//================== index.html ==================
static const unsigned char temp_binary_data_0[] =
"<!doctype html>\r\n"
"<html lang=\"en\">\r\n"
"  <head>\r\n"
"    <meta charset=\"UTF-8\" />\r\n"
"    <link rel=\"icon\" type=\"image/svg+xml\" href=\"/vite.svg\" />\r\n"
"    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\r\n"
"    <title>ui</title>\r\n"
"    <script type=\"module\" crossorigin src=\"/assets/index-DIoyqiqm.js\"></script>\n"
"    <link rel=\"stylesheet\" crossorigin href=\"/assets/index-CgQhQ4SS.css\">\n"
"  </head>\r\n"
"  <body>\r\n"
"    <div id=\"root\"></div>\r\r\n"
"  </body>\r\n"
"</html>\r\n";

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
        case 0x2c834af8:  numBytes = 462; return index_html;
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
