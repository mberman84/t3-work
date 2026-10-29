!macro customInstall
  WriteRegStr HKCU "Software\Classes\T3WorkHTML" "" "T3Work web page"
  WriteRegStr HKCU "Software\Classes\T3WorkHTML" "URL Protocol" ""
  WriteRegStr HKCU "Software\Classes\T3WorkHTML\DefaultIcon" "" '$\"$appExe$\",0'
  WriteRegStr HKCU "Software\Classes\T3WorkHTML\shell\open\command" "" '$\"$appExe$\" $\"%1$\"'
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\T3Work" "" "T3Work"
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\T3Work\DefaultIcon" "" '$\"$appExe$\",0'
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\T3Work\shell\open\command" "" '$\"$appExe$\"'
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\T3Work\Capabilities" "ApplicationName" "T3Work"
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\T3Work\Capabilities" "ApplicationDescription" "Browse the web with T3Work"
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\T3Work\Capabilities" "ApplicationIcon" '$\"$appExe$\",0'
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\T3Work\Capabilities\URLAssociations" "http" "T3WorkHTML"
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\T3Work\Capabilities\URLAssociations" "https" "T3WorkHTML"
  WriteRegStr HKCU "Software\RegisteredApplications" "T3Work" "Software\Clients\StartMenuInternet\T3Work\Capabilities"
  System::Call 'shell32::SHChangeNotify(i 0x08000000, i 0, p 0, p 0)'
  !ifndef DO_NOT_CREATE_START_MENU_SHORTCUT
    ${IfNot} ${FileExists} "$newStartMenuLink"
      !insertmacro createMenuDirectory
      CreateShortCut "$newStartMenuLink" "$appExe" "" "$appExe" 0 "" "" "${APP_DESCRIPTION}"
      ClearErrors
      WinShell::SetLnkAUMI "$newStartMenuLink" "${APP_ID}"
    ${EndIf}
  !endif
!macroend

!macro customUnInstall
  DeleteRegValue HKCU "Software\RegisteredApplications" "T3Work"
  DeleteRegKey HKCU "Software\Clients\StartMenuInternet\T3Work"
  DeleteRegKey HKCU "Software\Classes\T3WorkHTML"
  System::Call 'shell32::SHChangeNotify(i 0x08000000, i 0, p 0, p 0)'
!macroend
