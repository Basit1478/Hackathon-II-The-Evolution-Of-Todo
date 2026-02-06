#!/usr/bin/env pwsh

# Create new feature script (PowerShell)
#
# This script creates a new feature directory with required template files.
# It follows the same structure as the original bash script.
#
# Usage: ./create-new-feature.ps1 "Feature Description"

param(
    [Parameter(Mandatory=$true)]
    [string]$FeatureDescription
)

$ErrorActionPreference = 'Stop'

# Source common functions
. "$PSScriptRoot/common.ps1"

# Extract repo root and current branch
$repoRoot = Get-RepoRoot
$currentBranch = Get-CurrentBranch
$featureDir = Get-FeatureDir -RepoRoot $repoRoot -Branch $currentBranch

# Validate we're on a feature branch
if (-not (Test-FeatureBranch -Branch $currentBranch -HasGit $(Test-HasGit))) {
    exit 1
}

# Create feature directory if it doesn't exist
if (!(Test-Path $featureDir)) {
    New-Item -ItemType Directory -Path $featureDir | Out-Null
    Write-Output "Created feature directory: $featureDir"
}

# Define template files
$templates = @(
    @{ Name = "spec.md"; Template = "spec-template.md" },
    @{ Name = "plan.md"; Template = "plan-template.md" },
    @{ Name = "tasks.md"; Template = "tasks-template.md" },
    @{ Name = "research.md"; Template = "phr-template.prompt.md" }
)

# Copy template files if they don't exist
foreach ($template in $templates) {
    $targetPath = Join-Path $featureDir $template.Name
    $sourcePath = Join-Path $PSScriptRoot "../../templates/$($template.Template)"
    
    if (!(Test-Path $targetPath)) {
        if (Test-Path $sourcePath) {
            Copy-Item -Path $sourcePath -Destination $targetPath
            Write-Output "Created $($template.Name) from template"
        } else {
            # Create empty file if template doesn't exist
            "" | Out-File -FilePath $targetPath -Encoding UTF8
            Write-Output "Created empty $($template.Name)"
        }
    } else {
        Write-Output "Skipped $($template.Name) (already exists)"
    }
}

# Create contracts directory if it doesn't exist
$contractsDir = Join-Path $featureDir "contracts"
if (!(Test-Path $contractsDir)) {
    New-Item -ItemType Directory -Path $contractsDir | Out-Null
    Write-Output "Created contracts directory: $contractsDir"
}

Write-Output "Feature initialization complete in: $featureDir"
