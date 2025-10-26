@echo off
REM Backend startup script for Windows

echo Installing Python dependencies...
pip install -r requirements.txt

echo.
echo Starting Real-ESRGAN backend server...
echo Server will be available at http://localhost:8000
echo.

python main.py

pause
