@echo off
echo Setting up Windows environment for building...
echo.

:: Check if running as administrator
net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo This script requires administrator privileges.
    echo Please right-click and select "Run as administrator"
    pause
    exit /b 1
)

echo Enabling symbolic links privilege for the current user...
echo This will help with future builds.
echo.

:: Use fsutil to check if symlinks are enabled
fsutil behavior query SymlinkEvaluation | findstr "L2L:1 L2R:1 R2L:1 R2R:1" >nul
if %ERRORLEVEL% NEQ 0 (
    :: Enable symlinks
    fsutil behavior set SymlinkEvaluation L2L:1 L2R:1 R2L:1 R2R:1
    echo Symbolic links have been enabled.
) else (
    echo Symbolic links are already enabled.
)

:: Clean electron-builder cache
echo.
echo Cleaning electron-builder cache...
if exist "%LOCALAPPDATA%\electron-builder\Cache\winCodeSign" (
    rmdir /s /q "%LOCALAPPDATA%\electron-builder\Cache\winCodeSign"
    echo Cache cleaned successfully.
) else (
    echo No cache to clean.
)

echo.
echo Environment setup complete. You can now run build-win-portable.bat
echo.
pause
