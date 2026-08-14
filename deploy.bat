@echo off
setlocal

cd /d "%~dp0"

echo ===============================================
echo   FamilyQuizz - Build + Deploi Firebase Hosting
echo ===============================================
echo.

echo [1/2] Compilation (npm run build)...
call npm run build
if errorlevel 1 (
  echo.
  echo ERREUR : le build a echoue. Deploiement annule.
  pause
  exit /b 1
)

echo.
echo [2/2] Deploiement sur Firebase Hosting...
call firebase deploy --only hosting
if errorlevel 1 (
  echo.
  echo ERREUR : le deploiement a echoue.
  pause
  exit /b 1
)

echo.
echo Termine ! L'appli est en ligne.
pause
