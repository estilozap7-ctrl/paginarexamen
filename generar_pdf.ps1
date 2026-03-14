$htmlFile = "d:\React\googleGravioty\Unicordoba\Razonamiento\evaluacion_razonamiento_logico.html"
$pdfFile  = "d:\React\googleGravioty\Unicordoba\Razonamiento\evaluacion_razonamiento_logico.pdf"
$fileUrl  = "file:///" + $htmlFile.Replace("\", "/")

# Rutas posibles de navegadores
$browsers = @(
    "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    "C:\Program Files\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
)

$browser = $null
foreach ($b in $browsers) {
    if (Test-Path $b) { $browser = $b; break }
}

if ($null -eq $browser) {
    Write-Host "ERROR: No se encontro Edge ni Chrome instalado." -ForegroundColor Red
    exit 1
}

Write-Host "Usando: $browser" -ForegroundColor Cyan
Write-Host "Generando PDF desde: $fileUrl" -ForegroundColor Yellow

$argList = @(
    "--headless",
    "--disable-gpu",
    "--print-to-pdf=$pdfFile",
    "--print-to-pdf-no-header",
    "--no-margins",
    $fileUrl
)

Start-Process -FilePath $browser -ArgumentList $argList -Wait -NoNewWindow
Start-Sleep -Seconds 5

if (Test-Path $pdfFile) {
    $size = (Get-Item $pdfFile).Length
    Write-Host "PDF generado exitosamente!" -ForegroundColor Green
    Write-Host "Ruta: $pdfFile" -ForegroundColor Green
    Write-Host "Tamanio: $([math]::Round($size/1024, 1)) KB" -ForegroundColor Green
} else {
    Write-Host "ERROR: El PDF no fue creado." -ForegroundColor Red
}
