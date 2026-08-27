@echo off
setlocal
cd /d "%~dp0"

echo ============================================
echo   VibeShot one-click push
echo   Usage: push.bat
echo          push.bat "commit message"
echo ============================================

echo.
echo [1/3] git add -A
git add -A
if errorlevel 1 (
  echo   git add failed
  exit /b 1
)

echo [2/3] git commit
set "MSG=%*"
if "%MSG%"=="" set "MSG=update: %date% %time%"
git commit -m "%MSG%"
if errorlevel 1 (
  echo   (nothing to commit or commit failed)
)

echo [3/3] git push
git push
if errorlevel 1 (
  echo.
  echo   FAIL: push failed, check network / SSH
  exit /b 1
)

echo.
echo   OK: pushed, pipeline auto-deploy started
endlocal