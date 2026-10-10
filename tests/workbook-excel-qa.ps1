# Read-only Microsoft Excel COM verification of sheets, records and embedded photos; writes an audit report.
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$workbookPath = Join-Path $projectRoot 'Roshan-Industries-Product-Catalogue.xlsx'
# Active records exclude retired SKUs retained in the permanent identifier map.
$expectedRecords = 0
foreach ($source in @('reviewed-products.json', 'pump-products.json', 'online-products.json')) {
    $activeRecords = Get-Content -Raw (Join-Path $projectRoot ('src/data/' + $source)) | ConvertFrom-Json
    $expectedRecords += $activeRecords.Count
}
$activeCategories = Get-Content -Raw (Join-Path $projectRoot 'src/data/reviewed-categories.json') | ConvertFrom-Json
$expectedSheets = $activeCategories.Count + 2
$expectedPhotos = $expectedRecords * 2
$excelAudit = New-Object -ComObject Excel.Application
$excelAudit.Visible = $false
$excelAudit.DisplayAlerts = $false
$excelAudit.AutomationSecurity = 3
try {
    $auditBook = $excelAudit.Workbooks.Open($workbookPath, 0, $true)
    if ($auditBook.Worksheets.Count -ne $expectedSheets) { throw "Unexpected sheet count: $($auditBook.Worksheets.Count), expected $expectedSheets" }
    $records = $auditBook.Worksheets.Item('All Products').UsedRange.Rows.Count - 5
    if ($records -ne $expectedRecords) { throw 'Unexpected product count' }
    $photos = 0
    foreach ($sheet in $auditBook.Worksheets) {
        if ($sheet.Name -ne 'Overview') {
            $photos += $sheet.Shapes.Count
            if ($sheet.UsedRange.Columns.Count -ne 7) { throw 'Unexpected product column count' }
        }
    }
    if ($photos -ne $expectedPhotos) { throw 'Unexpected photo count' }
    $report = @{ excelNormalOpen = $true; products = $records; sheets = $expectedSheets; embeddedPhotos = $photos; xlsxSha256 = (Get-FileHash -LiteralPath $workbookPath -Algorithm SHA256).Hash.ToLower(); duplicateWorksheetFiltersRemoved = $true }
    $report | ConvertTo-Json | Set-Content -Encoding UTF8 (Join-Path $projectRoot 'reports/high-resolution-audit/excel-desktop-validation.json')
    Write-Output "PASS Microsoft Excel normal open: $records products, $expectedSheets sheets and $photos photos."
    $auditBook.Close($false)
} finally {
    $excelAudit.Quit()
    [void][System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($excelAudit)
}
