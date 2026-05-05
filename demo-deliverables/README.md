# Demo Deliverables

This folder is prepared for clean GitHub upload and client sharing.

## Included outputs
- `artifacts/ENTERPRISE_DEMO_REPORT.pdf`
- `artifacts/ENTERPRISE_DEMO_VIDEO.mp4`
- `artifacts/ENTERPRISE_DEMO_VIDEO.webm`
- `screenshots/*.png`
- `ENTERPRISE_DEMO_REPORT.html`
- `automation/generate-demo.js`
- `automation/render-pdf.js`
- `automation/package.json`

## Re-run setup (future)
From repo root:

```powershell
cd demo-deliverables/automation
npm install playwright
npx playwright install chromium
```

Optional MP4 conversion tool (one-time):

```powershell
winget install --id Gyan.FFmpeg -e --accept-package-agreements --accept-source-agreements
```

## Re-generate demo assets

```powershell
cd demo-deliverables/automation
node generate-demo.js
node render-pdf.js
```

## Verify PDF output

```powershell
cd demo-deliverables/automation
node render-pdf.js
start ..\artifacts\ENTERPRISE_DEMO_REPORT.pdf
```

## Convert WebM to MP4 manually (if needed)

```powershell
$ffmpeg = "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin\ffmpeg.exe"
& "$ffmpeg" -y -i "..\artifacts\ENTERPRISE_DEMO_VIDEO.webm" -c:v libx264 -preset veryfast -crf 22 -pix_fmt yuv420p -movflags +faststart "..\artifacts\ENTERPRISE_DEMO_VIDEO.mp4"
```

## Notes
- `node_modules` and temporary capture files are intentionally removed for clean upload.
- If you need to run automation again, install dependencies using the setup commands above.
- Cleanup command after generation:

```powershell
cd demo-deliverables/automation
if (Test-Path .\node_modules) { Remove-Item .\node_modules -Recurse -Force }
```
