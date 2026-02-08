---
id: {{ID}}
title: {{TITLE}}
stage: {{STAGE}}
date: {{DATE_ISO}}
surface: {{SURFACE}}
model: {{MODEL}}
feature: {{FEATURE}}
branch: {{BRANCH}}
user: {{USER}}
command: {{COMMAND}}
labels: [{{LABELS}}]
links:
  spec: {{LINKS_SPEC}}
  ticket: {{LINKS_TICKET}}
  adr: {{LINKS_ADR}}
  pr: {{LINKS_PR}}
files:
{{FILES_YAML}}
tests:
{{TESTS_YAML}}
---

## Prompt

{{PROMPT_TEXT}}

## Response snapshot

{{RESPONSE_TEXT}}

## Outcome

- Impact: {{OUTCOME_IMPACT}}
- Tests: {{TESTS_SUMMARY}}
- Files: {{FILES_SUMMARY}}
- Next prompts: {{NEXT_PROMPTS}}
- Reflection: {{REFLECTION_NOTE}}
