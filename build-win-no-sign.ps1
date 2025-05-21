# PowerShell script for building without code signing
# Must be run as administrator

Write-Host "Starting the build process without code signing..." -ForegroundColor Green

# Step 1: Clean previous build artifacts
Write-Host "Step 1: Cleaning previous build artifacts..." -ForegroundColor Yellow
npm run clean

# Step 2: Run the TypeScript type check and build
Write-Host "Step 2: Building the application..." -ForegroundColor Yellow
npm run typecheck
npm run electron-vite build

# Step 3: Package the application without signing
Write-Host "Step 3: Packaging the application without signing..." -ForegroundColor Yellow
$env:CSC_IDENTITY_AUTO_DISCOVERY = "false"
npx electron-builder --win --config.win.sign=false --config.win.signAndEditExecutable=false --config.forceCodeSigning=false --publish=never

Write-Host "Build completed!" -ForegroundColor Green
