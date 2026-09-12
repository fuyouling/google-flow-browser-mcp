@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0test-flow-image.ps1" %*
