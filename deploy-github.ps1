# Script de automatización para inicializar git y subir al repositorio en GitHub
$ErrorActionPreference = "Stop"

Write-Host "Iniciando despliegue hacia GitHub..." -ForegroundColor Cyan

# Inicializar git si no existe
if (-not (Test-Path ".git")) {
    Write-Host "Inicializando repositorio git local..." -ForegroundColor Yellow
    git init
}

# Agregar el remote origin si no está configurado
$remote = git remote get-url origin 2>$null
if (-not $remote) {
    Write-Host "Configurando remote origin https://github.com/JSM788/Crecer-b2b.git..." -ForegroundColor Yellow
    git remote add origin https://github.com/JSM788/Crecer-b2b.git
} else {
    Write-Host "Actualizando remote origin..." -ForegroundColor Yellow
    git remote set-url origin https://github.com/JSM788/Crecer-b2b.git
}

# Configurar rama principal
git branch -M main

# Agregar todos los cambios
Write-Host "Preparando archivos para commit..." -ForegroundColor Yellow
git add .

# Hacer commit
$status = git status --porcelain
if ($status) {
    Write-Host "Creando commit..." -ForegroundColor Yellow
    git commit -m "feat: maqueta frontend completa b2b aquamundo c01-c24 con arquitectura limpia"
} else {
    Write-Host "No hay cambios pendientes por commitear." -ForegroundColor Green
}

# Push a GitHub
Write-Host "Subiendo a GitHub (rama main)..." -ForegroundColor Cyan
git push -u origin main

Write-Host "`n¡Listo! El código está en GitHub." -ForegroundColor Green
Write-Host "GitHub Actions iniciará la compilación y despliegue a GitHub Pages en unos minutos." -ForegroundColor Green
Write-Host "URL final: https://jsm788.github.io/Crecer-b2b/" -ForegroundColor Cyan
