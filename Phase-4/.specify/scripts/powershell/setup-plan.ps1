#!/usr/bin/env pwsh

# Setup plan script (PowerShell)
#
# This script sets up the plan.md file based on spec.md content.
# It follows the same logic as the original bash script.
#
# Usage: ./setup-plan.ps1

$ErrorActionPreference = 'Stop'

# Source common functions
. "$PSScriptRoot/common.ps1"

# Get paths
$paths = Get-FeaturePathsEnv

# Validate we're on a feature branch
if (-not (Test-FeatureBranch -Branch $paths.CURRENT_BRANCH -HasGit:$paths.HAS_GIT)) { 
    exit 1 
}

# Verify spec.md exists
if (!(Test-Path $paths.FEATURE_SPEC)) {
    Write-Output "ERROR: spec.md not found at $($paths.FEATURE_SPEC)"
    Write-Output "Run /sp.specify first to create the feature structure."
    exit 1
}

# Verify plan.md doesn't exist
if (Test-Path $paths.IMPL_PLAN) {
    Write-Output "ERROR: plan.md already exists at $($paths.IMPL_PLAN)"
    Write-Output "If you need to recreate it, remove the existing plan.md first."
    exit 1
}

# Extract feature name from directory
$featureName = Split-Path -Leaf $paths.FEATURE_DIR
$featureTitle = ($featureName -replace '^\d{3}-', '') -replace '-', ' '

# Create plan.md from template
$templatePath = Join-Path $PSScriptRoot "../../templates/plan-template.md"

if (Test-Path $templatePath) {
    # Read template content
    $templateContent = Get-Content -Path $templatePath -Raw
    
    # Replace placeholders
    $planContent = $templateContent.Replace('{{FEATURE_NAME}}', $featureName)
    $planContent = $planContent.Replace('{{FEATURE_TITLE}}', $featureTitle)
    
    # Read spec content
    $specContent = Get-Content -Path $paths.FEATURE_SPEC -Raw
    $planContent = $planContent.Replace('{{SPEC_CONTENT}}', $specContent)
} else {
    # Fallback template content
    $planContent = "# Implementation Plan for $featureName\n\nBased on spec: $($paths.FEATURE_SPEC)\n\nTODO: Generate implementation plan based on spec content."
}

# Write plan.md
$planContent | Out-File -FilePath $paths.IMPL_PLAN -Encoding UTF8

Write-Output "Created plan.md for feature: $featureName"
Write-Output "Location: $($paths.IMPL_PLAN)"
