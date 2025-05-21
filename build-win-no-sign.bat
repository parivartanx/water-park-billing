@echo off
echo Building Water Park Billing application without code signing...

echo Step 1: Cleaning previous build files
call npm run clean

echo Step 2: Building the application
call npm run build

echo Step 3: Packaging with electron-builder (no code signing)
npx electron-builder --win --config=electron-builder-no-sign.json

echo Build completed!
