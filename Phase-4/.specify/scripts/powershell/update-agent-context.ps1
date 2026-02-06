#!/usr/bin/env pwsh

# Update agent context script (PowerShell)
#
# This script updates the agent context with current feature information.
# It follows the same structure as the original bash script.
#
# Usage: ./update-agent-context.ps1

$ErrorActionPreference = 'Stop'

# Source common functions
. "$PSScriptRoot/common.ps1"

# Get paths
$paths = Get-FeaturePathsEnv

# Validate we're on a feature branch
if (-not (Test-FeatureBranch -Branch $paths.CURRENT_BRANCH -HasGit:$paths.HAS_GIT)) { 
    exit 1 
}

# Check if feature directory exists
if (!(Test-Path $paths.FEATURE_DIR)) {
    Write-Output "ERROR: Feature directory not found: $($paths.FEATURE_DIR)"
    Write-Output "Run /sp.specify first to create the feature structure."
    exit 1
}

# Collect available files
$availableDocs = @()

if (Test-Path $paths.FEATURE_SPEC) {
    $specContent = Get-Content -Path $paths.FEATURE_SPEC -Raw
    $availableDocs += @{ name = "spec.md"; content = $specContent }
}

if (Test-Path $paths.IMPL_PLAN) {
    $planContent = Get-Content -Path $paths.IMPL_PLAN -Raw
    $availableDocs += @{ name = "plan.md"; content = $planContent }
}

if (Test-Path $paths.TASKS) {
    $tasksContent = Get-Content -Path $paths.TASKS -Raw
    $availableDocs += @{ name = "tasks.md"; content = $tasksContent }
}

if (Test-Path $paths.RESEARCH) {
    $researchContent = Get-Content -Path $paths.RESEARCH -Raw
    $availableDocs += @{ name = "research.md"; content = $researchContent }
}

if (Test-Path $paths.DATA_MODEL) {
    $dataModelContent = Get-Content -Path $paths.DATA_MODEL -Raw
    $availableDocs += @{ name = "data-model.md"; content = $dataModelContent }
}

# Check contracts directory
$contractsDir = $paths.CONTRACTS_DIR
if (Test-Path $contractsDir) {
    Get-ChildItem -Path $contractsDir -File | ForEach-Object {
        $contractContent = Get-Content -Path $_.FullName -Raw
        $availableDocs += @{ name = "contracts/$($_.Name)"; content = $contractContent }
    }
}

if (Test-Path $paths.QUICKSTART) {
    $quickstartContent = Get-Content -Path $paths.QUICKSTART -Raw
    $availableDocs += @{ name = "quickstart.md"; content = $quickstartContent }
}

# Output context information
Write-Output "---"
Write-Output "CURRENT_BRANCH: $($paths.CURRENT_BRANCH)"
Write-Output "FEATURE_DIR: $($paths.FEATURE_DIR)"
Write-Output "FILES_COUNT: $($availableDocs.Count)"
Write-Output "---"

# Output each document
foreach ($doc in $availableDocs) {
    Write-Output "# FILE: $($doc.name)"
    Write-Output $doc.content
    Write-Output ""
}
