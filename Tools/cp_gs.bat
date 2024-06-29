@echo off
setlocal enabledelayedexpansion

REM ��ƃf�B���N�g���ƕۑ���f�B���N�g�����w��
set "source_dir=C:\Users\unico\Desktop\tmp"
set "destination_dir=C:\Users\unico\Desktop\gs"
set "file_extension=.gs .js"


REM �t�@�C�����ċA�I�Ɍ������R�s�[
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

    REM �d���t�@�C���̏���
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

echo ��Ƃ��������܂����B
pause
