@echo off
set "msg=Update: %date% %time%"
if not "%~1"=="" (
    set "msg=%~1"
)

echo Staging all changes...
git add .

echo Committing changes...
git commit -m "%msg%"

echo Pushing to GitHub...
git push origin Artha-AI

echo Done! Your changes are live on GitHub.
