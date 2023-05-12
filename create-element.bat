@echo off
setlocal EnableDelayedExpansion

:: get params
set type=%1
set name=%2
shift
shift

:: set the path to either containers components depending on the param.
if "%type%" == "component" (
	set localPath=./src/components
) else if "%type%" == "container" (
	set localPath=./src/containers
) else (
	echo Invalid type "%type%".
	echo usage: create-element [type:component^|container] [name]
	exit 1
)

:: validate the name
if "%name%" == "" (
	echo Name must be specified.
	echo usage: create-element %type% [name]
	exit 1
)

:: create the directory structure.
if not exist %localPath% (
	md %localPath%
)

:: check that the component doesn't exist.
if exist "%localPath%/%name%" (
	echo %type% "%name%" already exists.
	set /p write= "Overwrite? (y/n): "
	if "!write!" NEQ "y" (
		echo Component unmodified, exiting...
		exit 1
	)
	echo Overwriting component "%name%".
) else (
	mkdir "%localPath%/%name%"
)

:: create the index file.
> "%localPath%/%name%/index.js" (
	echo import { %name% } from "./%name%.jsx";
	echo export default %name%;
)

:: create the scss file.
> "%localPath%/%name%/%name%.module.scss" (
	echo .%name% {}
)

:: create the jsx file.
> "%localPath%/%name%/%name%.jsx" (
	echo import styles from "./%name%.module.scss";
	echo.
	echo function %name%^(props^) {;
	echo 	return ^<^>^</^>;
	echo }
	echo.
	echo export default %name%;
)

:: notify the user.
echo Component %name% created successfully.
exit 0