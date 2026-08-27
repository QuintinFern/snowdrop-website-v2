@echo off
REM ===========================================================================
REM  Snowdrop United - local preview
REM
REM  Double-click this file. It starts a small web server in this folder and
REM  opens the site in your browser.
REM
REM  Opening index.html directly (file://) will NOT work: components.js is an
REM  ES module, and browsers block module imports over the file:// protocol.
REM
REM  Close this window or press Ctrl+C to stop the server.
REM ===========================================================================

cd /d "%~dp0"

where python >nul 2>nul
if errorlevel 1 goto nopython

python preview-server.py
goto done

:nopython
echo.
echo   ERROR: Python was not found on your PATH.
echo   Install it from https://python.org (tick "Add python.exe to PATH"),
echo   then run this file again.
echo.

:done
echo.
pause
