[Setup]
AppName=Ripened
AppVersion=1.0.0
DefaultDirName={autopf}\Ripened
DefaultGroupName=Ripened
OutputBaseFilename=RipenedInstaller
Compression=lzma
SolidCompression=yes

[Files]
Source: "Builds\VisualStudio2022\x64\Release\App\Ripened.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "Builds\VisualStudio2022\UI\dist\*"; DestDir: "{app}\UI\dist"; Flags: ignoreversion recursesubdirs

[Icons]
Name: "{group}\Ripened"; Filename: "{app}\Ripened.exe"
Name: "{commondesktop}\Ripened"; Filename: "{app}\Ripened.exe"

[Run]
Filename: "{app}\Ripened.exe"; Description: "Launch Ripened"; Flags: nowait postinstall skipifsilent