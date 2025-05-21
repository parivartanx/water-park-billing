@echo off
echo Building Water Park Billing (Direct Portable Method)...
echo.

:: Clean previous builds
echo Step 1: Cleaning previous builds...
call npm run clean
if %ERRORLEVEL% NEQ 0 goto :error

:: Build the app
echo.
echo Step 2: Building application...
call npm run build
if %ERRORLEVEL% NEQ 0 goto :error

:: Create a directory for the portable app
echo.
echo Step 3: Preparing portable directory...
if not exist "dist\portable" mkdir "dist\portable"

:: Copy the built files directly without electron-builder
echo.
echo Step 4: Creating portable package...
xcopy /E /I /Y "out" "dist\portable\out"
xcopy /E /I /Y "resources" "dist\portable\resources"
copy "package.json" "dist\portable\"
copy "node_modules\electron\dist\electron.exe" "dist\portable\WaterParkBilling.exe"

:: Create a basic launcher
echo.
echo Step 5: Creating launcher...
(
echo @echo off
echo start WaterParkBilling.exe
) > "dist\portable\LaunchApp.bat"

echo.
echo Build completed successfully!
echo Portable application is available in dist\portable folder
goto :end

:error
echo.
echo Build process failed with error %ERRORLEVEL%
exit /b %ERRORLEVEL%

:end
pause
