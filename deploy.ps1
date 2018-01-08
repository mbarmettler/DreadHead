
Write-Output "================= starting deployment script ================="
$repopath = "\2_PRV\_repo\DreadHead\"
$deploypath = "C:\xampp\htdocs\DreadHead\"

#xcopy $repopath $deploypath /s /y
$documents = [Environment]::GetFolderPath("MyDocuments")
$dreadheadRepo =  $documents + $repopath 
Write-Output "from: - " $dreadheadRepo 
Write-Output "to: - " $deploypath 

xcopy $dreadheadRepo $deploypath /s
Write-Output "================= deployment succeeded ================="