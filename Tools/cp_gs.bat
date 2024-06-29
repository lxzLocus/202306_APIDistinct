@echo off
setlocal enabledelayedexpansion

REM 作業ディレクトリと保存先ディレクトリを指定
set "source_dir=C:\Users\unico\Desktop\tmp"
set "destination_dir=C:\Users\unico\Desktop\gs"
set "file_extension=.gs .js"


REM ファイルを再帰的に検索しコピー
for /r "%source_dir%" %%f in (*.gs *.js) do (
    set "source_file=%%f"
    set "relative_path=!source_file:%source_dir%=!"
    set "destination_file=!destination_dir!!relative_path!"

    if not exist "!source_file!" (
        for %%d in ("%%~dpf") do (
            set "source_dir=%%~d"
            set "destination_subdir=!destination_dir!!relative_path!"
            if not exist "!destination_subdir!" (
                md "!destination_subdir!"
            )
        )
    )

    REM 重複ファイルの処理
    if exist "!destination_file!" (
        set "count=1"
        set "new_destination_file=!destination_file!"
        set "file_extension=%%~xf"
        :loop
        set "new_destination_file=!destination_dir!!relative_path:~0,-4!_!count!!file_extension!"
        if exist "!new_destination_file!" (
            set /a "count+=1"
            goto :loop
        )
        copy "%%f" "!new_destination_file!"
    ) else (
        copy "%%f" "!destination_file!"
    )
)

echo 作業が完了しました。
pause
