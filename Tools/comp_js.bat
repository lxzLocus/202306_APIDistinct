@echo off
setlocal enabledelayedexpansion

set "directory=E:\Files\workspace\202306_APIDistinct\Datasets\#code_copy\js"  REM 実行したいファイルが存在するディレクトリのパス
set "script_directory=E:\Files\workspace\202306_APIDistinct\Esprima_jp"  REM main_cp.js スクリプトのディレクトリのパス

REM フォルダ内の全ての .js ファイルに対してループを実行
for %%f in ("%directory%\*") do (
    REM 拡張子が .js のファイルのみ処理対象とする
    if %%~xf==.js (
        REM main_cp.js スクリプトを実行するコマンドを表示
        echo Running main_cp.js for file: %%~nxf
        REM main_cp.js スクリプトを実行
        node "%script_directory%\main_cp.js" "%%f"
    )
)

endlocal