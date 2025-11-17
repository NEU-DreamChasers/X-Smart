@echo off
REM Setup script for Windows (PowerShell/CMD)
SETLOCAL ENABLEDELAYEDEXPANSION

echo === X-Smart setup (Windows) ===

echo Installing backend dependencies...
pushd ..\backend
call npm install
if %ERRORLEVEL% NEQ 0 (
  echo Failed to install backend dependencies
  popd
  exit /b 1
)
popd

echo Installing frontend dependencies...
pushd ..\frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
  echo Failed to install frontend dependencies
  popd
  exit /b 1
)
popd

echo Ensure .env exists (copy from .env.example if present)...
if not exist .env (
  if exist .env.example copy .env.example .env
)

echo Starting docker-compose (build) ...
docker-compose up -d --build
if %ERRORLEVEL% NEQ 0 (
  echo docker-compose failed
  exit /b 1
)

echo Setup complete. You can view containers with `docker ps`.
exit /b 0
