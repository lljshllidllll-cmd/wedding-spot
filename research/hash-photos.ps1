Add-Type -AssemblyName System.Drawing
$photoMetadata = Get-ChildItem -LiteralPath 'research/enrichment' -Filter '*-photos.json'
$hashRows = @()
foreach ($metadata in $photoMetadata) {
  $galleryRecord = Get-Content -LiteralPath $metadata.FullName -Raw | ConvertFrom-Json
  foreach ($photo in $galleryRecord.photos) {
    $bitmap = $null
    try {
      $absolutePhoto = Join-Path (Get-Location).Path $photo.localPath
      $bitmap = [System.Drawing.Bitmap]::FromFile($absolutePhoto)
      $dhash = ''
      for ($y = 0; $y -lt 8; $y++) {
        $previous = -1
        for ($x = 0; $x -lt 9; $x++) {
          $color = $bitmap.GetPixel([int](($x + 0.5) * $bitmap.Width / 9), [int](($y + 0.5) * $bitmap.Height / 8))
          $gray = $color.R * 0.299 + $color.G * 0.587 + $color.B * 0.114
          if ($x -gt 0) { if ($previous -gt $gray) { $dhash += '1' } else { $dhash += '0' } }
          $previous = $gray
        }
      }
      $hashRows += [pscustomobject]@{ id=$galleryRecord.id; imageUrl=$photo.imageUrl; localPath=$photo.localPath; dhash=$dhash; ratio=($bitmap.Width / $bitmap.Height) }
    } catch { }
    finally { if ($null -ne $bitmap) { $bitmap.Dispose() } }
  }
}
$hashRows | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath 'research/enrichment/photo-hashes.json' -Encoding utf8
Write-Output "Hashed $($hashRows.Count) photos"
