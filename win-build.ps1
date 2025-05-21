$symbolicLinkPrivilege = "SeCreateSymbolicLinkPrivilege"

function Enable-SymbolicLink {
    $currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    if (!$currentPrincipal.IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)) {
        Write-Host "This script must be run with administrator privileges. Please run as administrator."
        exit
    }
    
    try {
        # Clean electron-builder cache to force it to download again
        $cachePath = "$env:LOCALAPPDATA\electron-builder\Cache\winCodeSign"
        if (Test-Path $cachePath) {
            Write-Host "Cleaning electron-builder cache at $cachePath"
            Remove-Item -Path $cachePath -Recurse -Force -ErrorAction SilentlyContinue
        }

        # Completely disable code signing
        Write-Host "Building Windows package with code signing completely disabled..."
        npm run clean
        npm run build
        
        # Set environment variables to disable code signing
        $env:CSC_IDENTITY_AUTO_DISCOVERY = "false"
        electron-builder --win --config.win.sign=false --config.win.signAndEditExecutable=false --config.forceCodeSigning=false --publish=never

        # If the build still fails, try with portable build only
        if ($LASTEXITCODE -ne 0) {
            Write-Host "First build attempt failed, trying portable build only..."
            electron-builder --win portable --config.win.sign=false --config.win.signAndEditExecutable=false --config.forceCodeSigning=false --publish=never
        }
    }
    catch {
        Write-Host "An error occurred: $_"
    }
}
}

Enable-SymbolicLink
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
