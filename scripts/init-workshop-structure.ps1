<#
.SYNOPSIS
  Creates the folder structure the AI-Native Workshop expects. Safe to re-run:
  it never overwrites an existing file.

.DESCRIPTION
  Creates folders (with .gitkeep so git tracks empty ones) and a few starter files
  that hold only a title. All real content is written step by step with Copilot.
  Exception: docs/token-log.md gets a ready template, because add-token-record.ps1 needs it.

.PARAMETER Root
  Repo root. Defaults to the parent folder of this script.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\scripts\init-workshop-structure.ps1
#>
[CmdletBinding()]
param(
    [string]$Root
)

$ErrorActionPreference = 'Stop'

# Windows PowerShell 5.1 leaves $PSScriptRoot empty inside param() defaults, so resolve it here.
$scriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
if (-not $Root) { $Root = Split-Path -Parent $scriptDir }
$utf8 = New-Object System.Text.UTF8Encoding($false)   # UTF-8 without BOM

# --- 1. Folders -------------------------------------------------------------
$folders = @(
    '.github\agents',            # custom agents: ba / developer / test
    '.github\prompts',           # reusable prompt files (optional)
    'docs\requirements',         # user stories           US-{id}-{slug}.md
    'docs\design',               # architecture (SAD)
    'docs\specs',                # dev specs              US-{id}-dev-spec.md
    'docs\test-strategy',        # test strategy
    'docs\test-cases',           # test cases             US-{id}-test-cases.md
    'docs\knowledge',            # knowledge base for agents
    'docs\development-plans',    # output of create-development-plan skill
    'src',                       # application code
    'tests\e2e',                 # Playwright specs
    'tests\page-objects',        # Playwright page objects
    'scripts'
)

$created = 0
foreach ($f in $folders) {
    $path = Join-Path $Root $f
    if (-not (Test-Path -LiteralPath $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
        Write-Host "  + dir   $f" -ForegroundColor Green
        $created++
    }
    else {
        Write-Host "  = dir   $f (exists)" -ForegroundColor DarkGray
    }
    # .gitkeep only where the folder is still empty (src/tests get real files later)
    if (-not (Get-ChildItem -LiteralPath $path -Force | Select-Object -First 1)) {
        [System.IO.File]::WriteAllText((Join-Path $path '.gitkeep'), '', $utf8)
    }
}

# --- 2. Starter files (title only, never overwritten) ------------------------
$tokenLog = @'
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

$files = [ordered]@{
    'docs\product-brief.md'            = "# Product Brief`r`n"
    'docs\demo-script.md'              = "# Demo Script`r`n"
    'docs\knowledge\glossary.md'       = "# Glossary`r`n"
    'docs\knowledge\decisions.md'      = "# Architecture Decisions`r`n"
    'docs\token-log.md'                = $tokenLog + "`r`n"
    '.gitignore'                       = "node_modules/`r`ndist/`r`n.env`r`n.env.local`r`n.vercel`r`ntest-results/`r`nplaywright-report/`r`ncoverage/`r`n"
}

foreach ($rel in $files.Keys) {
    $path = Join-Path $Root $rel
    if (Test-Path -LiteralPath $path) {
        Write-Host "  = file  $rel (exists, left untouched)" -ForegroundColor DarkGray
        continue
    }
    [System.IO.File]::WriteAllText($path, $files[$rel], $utf8)
    Write-Host "  + file  $rel" -ForegroundColor Green
}

# --- 3. Reminder of what is still missing -----------------------------------
$todo = @(
    '.github\copilot-instructions.md',
    '.github\agents\ba.agent.md',
    '.github\agents\developer.agent.md',
    '.github\agents\test.agent.md'
) | Where-Object { -not (Test-Path -LiteralPath (Join-Path $Root $_)) }

Write-Host ''
Write-Host "Done. $created new folder(s) under $Root" -ForegroundColor Cyan
if ($todo) {
    Write-Host 'Still to create (next steps, with Copilot):' -ForegroundColor Yellow
    $todo | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
}
