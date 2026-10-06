<#
.SYNOPSIS
  Adds a row to docs/token-log.md.

.DESCRIPTION
  Mode 1 (default) - activity record:
    .\scripts\add-token-record.ps1 -Activity "Generated user stories" -Tokens "~2k" -Optimization "Scoped to product-brief.md via #file"

  Mode 2 - AIC balance per team member (start and end of the day):
    .\scripts\add-token-record.ps1 -Member "Van" -Before 500 -After 430
  The script computes Delta = Before - After and refreshes "Total AIC consumed".

  If docs/token-log.md is missing it is created from the template.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\scripts\add-token-record.ps1 -Activity "Dev spec US-001" -Tokens "~3k" -Optimization "Reused BA template"
#>
[CmdletBinding(DefaultParameterSetName = 'Record')]
param(
    [Parameter(ParameterSetName = 'Record', Mandatory)] [string]$Activity,
    [Parameter(ParameterSetName = 'Record', Mandatory)] [string]$Tokens,
    [Parameter(ParameterSetName = 'Record')]            [string]$Optimization = '-',
    [Parameter(ParameterSetName = 'Record')]            [string]$Time = (Get-Date -Format 'HH:mm'),

    [Parameter(ParameterSetName = 'Aic', Mandatory)]    [string]$Member,
    [Parameter(ParameterSetName = 'Aic', Mandatory)]    [decimal]$Before,
    [Parameter(ParameterSetName = 'Aic', Mandatory)]    [decimal]$After,

    [string]$LogPath
)

$ErrorActionPreference = 'Stop'

# Windows PowerShell 5.1 leaves $PSScriptRoot empty inside param() defaults, so resolve it here.
$scriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
if (-not $LogPath) { $LogPath = Join-Path (Split-Path -Parent $scriptDir) 'docs\token-log.md' }
$utf8 = New-Object System.Text.UTF8Encoding($false)

$template = @'
## Token Log

| Time | Activity | Approx tokens | Optimization applied |
|------|----------|:-------------:|----------------------|
<!-- records:end -->

### AIC balance tracking

| Team member | AIC before | AIC after | Delta |
|-------------|:----------:|:---------:|:-----:|
<!-- aic:end -->

**Total AIC consumed:** 0
<!-- aic:total -->
'@

if (-not (Test-Path -LiteralPath $LogPath)) {
    New-Item -ItemType Directory -Path (Split-Path -Parent $LogPath) -Force | Out-Null
    [System.IO.File]::WriteAllText($LogPath, $template + "`r`n", $utf8)
    Write-Host "Created $LogPath from template" -ForegroundColor Yellow
}

[string[]]$lines = [System.IO.File]::ReadAllLines($LogPath)

function Find-Marker([string[]]$All, [string]$Marker) {
    for ($i = 0; $i -lt $All.Count; $i++) { if ($All[$i].Trim() -eq $Marker) { return $i } }
    throw "Marker '$Marker' not found in $LogPath. Restore it (see init-workshop-structure.ps1) or delete the file and re-run."
}

# Table cells must not contain '|' or newlines
function Clean([string]$s) { ($s -replace '\|', '/' -replace '\s*[\r\n]+\s*', ' ').Trim() }

$list = New-Object System.Collections.Generic.List[string]
$list.AddRange($lines)

if ($PSCmdlet.ParameterSetName -eq 'Record') {
    $at  = Find-Marker $lines '<!-- records:end -->'
    $row = '| {0} | {1} | {2} | {3} |' -f (Clean $Time), (Clean $Activity), (Clean $Tokens), (Clean $Optimization)
    $list.Insert($at, $row)
    [System.IO.File]::WriteAllLines($LogPath, $list.ToArray(), $utf8)
    Write-Host "Added record: $row" -ForegroundColor Green
    return
}

# --- AIC mode ---------------------------------------------------------------
$delta = $Before - $After
$fmt   = [System.Globalization.CultureInfo]::InvariantCulture
$at    = Find-Marker $lines '<!-- aic:end -->'
$row   = '| {0} | {1} | {2} | {3} |' -f (Clean $Member), $Before.ToString($fmt), $After.ToString($fmt), $delta.ToString($fmt)
$list.Insert($at, $row)

# Recompute total from every Delta cell in the AIC table
$start = Find-Marker $list.ToArray() '### AIC balance tracking'
$end   = Find-Marker $list.ToArray() '<!-- aic:end -->'
$total = [decimal]0
for ($i = $start; $i -lt $end; $i++) {
    if ($list[$i] -match '^\|\s*(?!Team member|-)[^|]+\|[^|]*\|[^|]*\|\s*(-?[0-9.]+)\s*\|\s*$') {
        $total += [decimal]::Parse($Matches[1], $fmt)
    }
}
for ($i = $end; $i -lt $list.Count; $i++) {
    if ($list[$i] -like '**Total AIC consumed:**') {
        $list[$i] = '**Total AIC consumed:** ' + $total.ToString($fmt)
        break
    }
}
[System.IO.File]::WriteAllLines($LogPath, $list.ToArray(), $utf8)
Write-Host "Added AIC row: $row" -ForegroundColor Green
Write-Host ("Total AIC consumed: {0}" -f $total.ToString($fmt)) -ForegroundColor Cyan
