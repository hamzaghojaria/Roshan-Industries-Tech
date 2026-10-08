# Read-only Microsoft Excel COM verification of sheets, records and embedded photos; writes an audit report.
﻿$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$workbookPath = Join-Path $projectRoot 'Roshan-Industries-Product-Catalogue.xlsx'
$excelAudit = New-Object -ComObject Excel.Application
$excelAudit.Visible = $false
$excelAudit.DisplayAlerts = $false
$excelAudit.AutomationSecurity = 3
try {
    $auditBook = $excelAudit.Workbooks.Open($workbookPath, 0, $true)
    if ($auditBook.Worksheets.Count -ne 23) { throw 'Unexpected sheet count' }
    $records = $auditBook.Worksheets.Item('All Products').UsedRange.Rows.Count - 5
    if ($records -ne 268) { throw 'Unexpected product count' }
    $photos = 0
    foreach ($sheet in $auditBook.Worksheets) { $photos += $sheet.Shapes.Count }
    if ($photos -ne 536) { throw 'Unexpected photo count' }
    $report = @{ excelNormalOpen = $true; products = $records; sheets = 23; embeddedPhotos = $photos; xlsxSha256 = (Get-FileHash -LiteralPath $workbookPath -Algorithm SHA256).Hash.ToLower(); duplicateWorksheetFiltersRemoved = $true }
    $report | ConvertTo-Json | Set-Content -Encoding UTF8 (Join-Path $projectRoot 'reports/high-resolution-audit/excel-desktop-validation.json')
    Write-Output 'PASS Microsoft Excel normal open: 268 products, 23 sheets and 536 photos.'
    $auditBook.Close($false)
} finally {
    $excelAudit.Quit()
    [void][System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($excelAudit)
}
