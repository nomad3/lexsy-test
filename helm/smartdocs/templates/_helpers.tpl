{{/*
Expand the name of the chart.
*/}}
{{- define "smartdocs.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "smartdocs.fullname" -}}
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
Common labels
*/}}
{{- define "smartdocs.labels" -}}
helm.sh/chart: {{ include "smartdocs.name" . }}-{{ .Chart.Version | replace "+" "_" }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}

{{/*
Selector labels for backend
*/}}
{{- define "smartdocs.backend.selectorLabels" -}}
app.kubernetes.io/name: {{ include "smartdocs.name" . }}
app.kubernetes.io/component: backend
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Selector labels for frontend
*/}}
{{- define "smartdocs.frontend.selectorLabels" -}}
app.kubernetes.io/name: {{ include "smartdocs.name" . }}
app.kubernetes.io/component: frontend
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Selector labels for postgres
*/}}
{{- define "smartdocs.postgres.selectorLabels" -}}
app.kubernetes.io/name: {{ include "smartdocs.name" . }}
app.kubernetes.io/component: postgres
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Database URL
*/}}
{{- define "smartdocs.databaseUrl" -}}
postgresql://{{ .Values.postgres.auth.username }}:$(POSTGRES_PASSWORD)@{{ include "smartdocs.fullname" . }}-postgres:5432/{{ .Values.postgres.auth.database }}
{{- end }}

{{/*
Image reference helper
*/}}
{{- define "smartdocs.image" -}}
{{- if .registry }}{{ .registry }}/{{ end }}{{ .name }}:{{ .tag }}
{{- end }}
