@echo off
set "PROGRAMFILES=D:\WorkSpace\e_drive\202306\git-nature-js\#sort_extension\gs"
set "ERRORLOG=C:\Users\unico\Desktop\error.log"
set "MAINJS=D:\WorkSpace\e_drive\202306\Esprima_jp\main.js"
set "TOTAL_FILES=0"
set "ERROR_COUNT=0"

:: ログファイルへのコンソール出力のリダイレクト開始
(
  echo.
  echo.
  echo.
)

for %%F in ("%PROGRAMFILES%\*.*") do (
  set /a TOTAL_FILES+=1
  echo Processing: %%~nxF
  node "%MAINJS%" "%%F"
  if errorlevel 1 (
    set /a ERROR_COUNT+=1
    echo Error processing file: %%~nxF >> %ERRORLOG%
  )

  echo.
  echo.
  echo.
)

:: ログファイルへのコンソール出力のリダイレクト終了
) > %ERRORLOG%

:: ログファイルへのコンソール出力が終了したので、コンソールにメッセージを表示
echo Log saved to %ERRORLOG%

if exist %ERRORLOG% (
  echo Errors occurred during processing. See %ERRORLOG% for details.
) else (
  echo All files processed successfully.
)
