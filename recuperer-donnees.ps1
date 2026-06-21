# Script de recuperation de la base de donnees liste-course

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "=== Recuperation de la base de donnees Liste de Courses ===" -ForegroundColor Cyan
Write-Host ""

# ─── 1. Corbeille Windows ────────────────────────────────────────────────────
Write-Host "[1/3] Verification de la Corbeille Windows..." -ForegroundColor Yellow

$shell = New-Object -ComObject Shell.Application
$recycleBin = $shell.Namespace(0xA)
$corbeilleItems = @()

foreach ($item in $recycleBin.Items()) {
    if ($item.Name -like "liste_courses*") {
        $corbeilleItems += $item
        Write-Host "  TROUVE dans la Corbeille : $($item.Name)" -ForegroundColor Green
        Write-Host "  (Ouvre la Corbeille, clique droit sur le fichier et choisis 'Restaurer')" -ForegroundColor Gray
    }
}

if ($corbeilleItems.Count -gt 0) {
    Write-Host ""
    Write-Host "  Des fichiers sont dans la Corbeille !" -ForegroundColor Green
    Write-Host "  Restaure-les manuellement depuis la Corbeille Windows, puis relance l'app." -ForegroundColor White
    Write-Host ""
}

# ─── 2. Recherche sur le disque (DB + backups) ───────────────────────────────
Write-Host "[2/3] Recherche sur le disque..." -ForegroundColor Yellow

$searchRoots = @(
    "$env:USERPROFILE\Desktop",
    "$env:USERPROFILE\Documents",
    "$env:USERPROFILE\Downloads",
    "$env:USERPROFILE\AppData\Local",
    "C:\",
    "D:\"
)

$found = @()

foreach ($root in $searchRoots) {
    if (Test-Path $root) {
        try {
            # Cherche DB principale et fichiers backup
            $files = Get-ChildItem -Path $root -Recurse -ErrorAction SilentlyContinue -Force |
                     Where-Object { $_.Name -like "liste_courses*" -and ($_.Extension -eq '.db' -or $_.Name -like "*.backup*") }
            foreach ($f in $files) { $found += $f }
        } catch {}
    }
}

# ─── 3. Versions precedentes Windows ─────────────────────────────────────────
Write-Host "[3/3] Verification des versions precedentes Windows..." -ForegroundColor Yellow
Write-Host "  (Fonctionnalite Windows - depend de la configuration du PC)" -ForegroundColor Gray

Write-Host ""

# ─── Affichage des resultats ──────────────────────────────────────────────────
if ($found.Count -eq 0 -and $corbeilleItems.Count -eq 0) {
    Write-Host "Aucun fichier trouve." -ForegroundColor Red
    Write-Host ""
    Write-Host "Dernieres options :" -ForegroundColor Yellow
    Write-Host "  1. Ouvre la Corbeille Windows et cherche 'liste_courses' ou 'donnees_application'"
    Write-Host "  2. Clic droit sur le bureau -> 'Proprietes' -> 'Versions precedentes'"
    Write-Host "  3. Si tu as OneDrive ou un autre cloud, verifie la corbeille en ligne"
    Write-Host ""
    Read-Host "Appuie sur Entree pour quitter"
    exit
}

if ($found.Count -gt 0) {
    Write-Host "$($found.Count) fichier(s) trouve(s) sur le disque :" -ForegroundColor Green
    Write-Host ""

    $i = 1
    foreach ($f in $found) {
        $sizeKB = [math]::Round($f.Length / 1KB, 1)
        $tag = if ($f.Name -like "*.backup*") { " [BACKUP]" } else { "" }
        Write-Host "  [$i]$tag $($f.FullName)" -ForegroundColor White
        Write-Host "      Modifiee le : $($f.LastWriteTime)  |  Taille : $sizeKB Ko" -ForegroundColor Gray
        Write-Host ""
        $i++
    }

    $destDir  = Join-Path $scriptDir "donnees_application"
    $destFile = Join-Path $destDir "liste_courses.db"
    Write-Host "Destination : $destFile" -ForegroundColor Cyan
    Write-Host ""

    if ($found.Count -eq 1) {
        $choice = 1
    } else {
        $choice = Read-Host "Quel fichier veux-tu restaurer ? (numero)"
        if ($choice -notmatch '^\d+$' -or [int]$choice -lt 1 -or [int]$choice -gt $found.Count) {
            Write-Host "Choix invalide." -ForegroundColor Red
            Read-Host "Appuie sur Entree pour quitter"
            exit
        }
        $choice = [int]$choice
    }

    $selected = $found[$choice - 1]

    if (Test-Path $destFile) {
        $backupFile = $destFile + ".backup_" + (Get-Date -Format "yyyyMMdd_HHmmss")
        Copy-Item $destFile $backupFile
        Write-Host "Base actuelle sauvegardee : $backupFile" -ForegroundColor Yellow
    }

    if (-not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }

    Copy-Item $selected.FullName $destFile -Force
    Write-Host ""
    Write-Host "Base de donnees restauree ! Relance l'application." -ForegroundColor Green
}

Write-Host ""
Read-Host "Appuie sur Entree pour quitter"
