param([ValidateSet('dev','build','start','lint','typecheck','test')][string]$Command = 'dev')
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$installedNpm = Get-Command npm.cmd -ErrorAction SilentlyContinue
if ($installedNpm) {
    & $installedNpm.Source run $Command
} else {
    # The current Codex host supplies Node without npm on PATH.
    $workspaceNpm = Join-Path $PSScriptRoot '../../work/npm/package/bin/npm-cli.js'
    if (!(Test-Path -LiteralPath $workspaceNpm)) {
        throw 'Install Node.js LTS with npm, then run npm install and npm run dev.'
    }
    & node $workspaceNpm run $Command
}
exit $LASTEXITCODE
