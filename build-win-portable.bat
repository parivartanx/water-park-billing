@echo off
echo Building Water Park Billing Portable Version...
echo.
echo Step 1: Cleaning previous builds...
call npm run clean
if %ERRORLEVEL% NEQ 0 goto :error

echo.
echo Step 2: Building application...
call npm run build
if %ERRORLEVEL% NEQ 0 goto :error

echo.
echo Step 3: Creating portable executable...
call electron-builder --config electron-builder-portable.json
if %ERRORLEVEL% NEQ 0 goto :error

echo.
echo Build completed successfully!
echo Portable application is available in dist/portable folder
goto :end

:error
echo.
echo Build process failed with error %ERRORLEVEL%
exit /b %ERRORLEVEL%

:end
pause
