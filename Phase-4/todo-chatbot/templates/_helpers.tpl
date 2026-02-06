{{/*
Expand the name of the chart.
*/}}
{{- define "taskmaster.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "taskmaster.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Backend fullname
*/}}
{{- define "taskmaster.backend.fullname" -}}
{{- printf "%s-backend" (include "taskmaster.fullname" .) | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Frontend fullname
*/}}
{{- define "taskmaster.frontend.fullname" -}}
{{- printf "%s-frontend" (include "taskmaster.fullname" .) | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "taskmaster.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "taskmaster.labels" -}}
helm.sh/chart: {{ include "taskmaster.chart" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Backend labels
*/}}
{{- define "taskmaster.backend.labels" -}}
{{ include "taskmaster.labels" . }}
{{ include "taskmaster.backend.selectorLabels" . }}
{{- end }}

{{/*
Frontend labels
*/}}
{{- define "taskmaster.frontend.labels" -}}
{{ include "taskmaster.labels" . }}
{{ include "taskmaster.frontend.selectorLabels" . }}
{{- end }}

{{/*
Backend selector labels
*/}}
{{- define "taskmaster.backend.selectorLabels" -}}
app.kubernetes.io/name: {{ include "taskmaster.name" . }}
app.kubernetes.io/component: backend
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Frontend selector labels
*/}}
{{- define "taskmaster.frontend.selectorLabels" -}}
app.kubernetes.io/name: {{ include "taskmaster.name" . }}
app.kubernetes.io/component: frontend
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "taskmaster.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "taskmaster.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Backend secret name
*/}}
{{- define "taskmaster.backend.secretName" -}}
{{- printf "%s-secret" (include "taskmaster.backend.fullname" .) }}
{{- end }}
