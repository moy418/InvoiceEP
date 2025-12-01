@echo off
echo Starting El Paso Furniture Invoice Generator...
echo.
echo Opening browser at http://localhost:8080
echo.
start http://localhost:8080
python -m http.server 8080
