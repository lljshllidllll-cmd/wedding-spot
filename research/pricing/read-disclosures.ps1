Add-Type -AssemblyName System.IO.Compression.FileSystem
$result = @()
Get-ChildItem -LiteralPath 'research/pricing/disclosures' -Filter '*.xlsx' | ForEach-Object {
  $archive = [System.IO.Compression.ZipFile]::OpenRead($_.FullName)
  try {
    $strings = @()
    $entry = $archive.GetEntry('xl/sharedStrings.xml')
    if ($entry) { $reader = [IO.StreamReader]::new($entry.Open()); [xml]$doc = $reader.ReadToEnd(); $reader.Dispose(); $strings = @($doc.sst.si | ForEach-Object { ($_.SelectNodes('.//*[local-name()="t"]') | ForEach-Object { $_.InnerText }) -join '' }) }
    $sheets = @()
    foreach ($sheet in @($archive.Entries | Where-Object { $_.FullName -match '^xl/worksheets/sheet[0-9]+.xml$' })) {
      $reader = [IO.StreamReader]::new($sheet.Open()); [xml]$doc = $reader.ReadToEnd(); $reader.Dispose()
      $rows = @($doc.worksheet.sheetData.row | ForEach-Object {
        $cells = @($_.c | ForEach-Object { $value = [string]$_.v; if ($_.t -eq 's') { $value = $strings[[int]$value] }; if ($_.t -eq 'inlineStr') { $value = $_.is.InnerText }; if ($value) { "$($_.r):$value" } }); $cells -join ' | '
      } | Where-Object { $_ })
      $sheets += @{sheet=$sheet.FullName;rows=$rows}
    }
    $result += @{file=$_.Name;sheets=$sheets}
  } finally { $archive.Dispose() }
}
$result | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath 'research/pricing/disclosures/rows.json' -Encoding utf8
