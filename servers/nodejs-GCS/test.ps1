# test-spis.ps1 (improved)
# End-to-end test for SPIS backend with robust error parsing
# Run: pwsh .\test-spis.ps1

$BASE = $env:SPIS_BASE_URL
if (-not $BASE -or $BASE -eq "") { $BASE = "http://localhost:4200" }

function Read-ErrorBody {
  param($ex)
  try {
    $resp = $ex.Exception.Response
    if (-not $resp) { return @{ message = "$ex" } }
    $stream = $resp.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $text = $reader.ReadToEnd()
    try {
      $json = $text | ConvertFrom-Json
      if ($json.error -and $json.error.message) {
        return @{ message = $json.error.message; raw = $json; structured = $true }
      } elseif ($json.message) {
        return @{ message = $json.message; raw = $json; structured = $false }
      } else {
        return @{ message = $text; raw = $json; structured = $false }
      }
    } catch {
      return @{ message = $text; raw = $null; structured = $false }
    }
  } catch {
    return @{ message = "$ex" }
  }
}

function Invoke-JsonPost {
  param([string]$Url, [hashtable]$Body, [hashtable]$Headers = @{})
  try {
    $json = ($Body | ConvertTo-Json -Depth 8)
    $res = Invoke-RestMethod -Method Post -Uri $Url -Headers $Headers -ContentType "application/json" -Body $json
    return @{ ok = $true; data = $res }
  } catch {
    $err = Read-ErrorBody $_
    Write-Host "POST $Url -> $($err.message)" -ForegroundColor Yellow
    return @{ ok = $false; error = $err }
  }
}

function Invoke-JsonGet {
  param([string]$Url, [hashtable]$Headers = @{})
  try {
    $res = Invoke-RestMethod -Method Get -Uri $Url -Headers $Headers
    return @{ ok = $true; data = $res }
  } catch {
    $err = Read-ErrorBody $_
    Write-Host "GET $Url -> $($err.message)" -ForegroundColor Yellow
    return @{ ok = $false; error = $err }
  }
}

function Banner($text) { Write-Host "`n=== $text ===" -ForegroundColor Cyan }

# Unique users
$guid = [Guid]::NewGuid().ToString().Substring(0,8)
$AdminEmail = "admin+$guid@test.local"
$InvInEmail = "inv.in+$guid@test.local"
$SalesEmail = "sales+$guid@test.local"
$InvMgrEmail = "inv.mgr+$guid@test.local"
$Password = "Test@12345"

Banner "Signup users"
$adminSignup = (Invoke-JsonPost "$BASE/signup" @{ fullName = "Admin User"; email = $AdminEmail; password = $Password })
$invInSignup = (Invoke-JsonPost "$BASE/signup" @{ fullName = "Inventory In"; email = $InvInEmail; password = $Password })
$salesSignup = (Invoke-JsonPost "$BASE/signup" @{ fullName = "Salesperson"; email = $SalesEmail; password = $Password })
$invMgrSignup = (Invoke-JsonPost "$BASE/signup" @{ fullName = "Inventory Manager"; email = $InvMgrEmail; password = $Password })

$AdminId = $adminSignup.data.user._id
$InvInId = $invInSignup.data.user._id
$SalesId = $salesSignup.data.user._id
$InvMgrId = $invMgrSignup.data.user._id

Banner "Login users"
$adminLogin = (Invoke-JsonPost "$BASE/login" @{ email = $AdminEmail; password = $Password })
$invInLogin = (Invoke-JsonPost "$BASE/login" @{ email = $InvInEmail; password = $Password })
$salesLogin = (Invoke-JsonPost "$BASE/login" @{ email = $SalesEmail; password = $Password })
$invMgrLogin = (Invoke-JsonPost "$BASE/login" @{ email = $InvMgrEmail; password = $Password })

$AdminHdr = @{ Authorization = "Bearer $($adminLogin.data.token)" }
$InvInHdr = @{ Authorization = "Bearer $($invInLogin.data.token)" }
$SalesHdr = @{ Authorization = "Bearer $($salesLogin.data.token)" }
$InvMgrHdr = @{ Authorization = "Bearer $($invMgrLogin.data.token)" }

Banner "Create organization (Admin)"
$orgName = "Pharma-$guid"
$org = (Invoke-JsonPost "$BASE/orgs" @{ name = $orgName } $AdminHdr)
$OrgId = $org.data._id
Write-Host "OrgId: $OrgId Name: $orgName" -ForegroundColor Green

Banner "Add users to org (Admin)"
$null = Invoke-JsonPost "$BASE/orgs/$OrgId/users" @{ userId = $InvInId; role = "Inventory In" } $AdminHdr
$null = Invoke-JsonPost "$BASE/orgs/$OrgId/users" @{ userId = $SalesId; role = "Salesperson" } $AdminHdr
$null = Invoke-JsonPost "$BASE/orgs/$OrgId/users" @{ userId = $InvMgrId; role = "Inventory Manager" } $AdminHdr

Banner "Try add medicine as Salesperson (expect 403)"
$badAdd = Invoke-JsonPost "$BASE/orgs/$OrgId/medicines" @{
  barcodeNo = "BAR-001"; name = "Paracetamol"; type = "Tablet"; qty = 50; exp = "2026-06-01"; mfg = "2024-01-01"
} $SalesHdr

Banner "Add medicines as Inventory In"
$addMed1 = Invoke-JsonPost "$BASE/orgs/$OrgId/medicines" @{
  barcodeNo = "BAR-001"; name = "Paracetamol"; type = "Tablet"; qty = 50; exp = "2026-06-01"; mfg = "2024-01-01"
} $InvInHdr
$addMed2 = Invoke-JsonPost "$BASE/orgs/$OrgId/medicines" @{
  barcodeNo = "BAR-002"; name = "Ibuprofen"; type = "Tablet"; qty = 30; exp = "2026-12-01"; mfg = "2024-02-01"
} $InvInHdr

Banner "Attempt duplicate barcode with another name (expect 409)"
$dupBarcode = Invoke-JsonPost "$BASE/orgs/$OrgId/medicines" @{
  barcodeNo = "BAR-001"; name = "WrongName"; type = "Tablet"; qty = 10; exp = "2026-07-01"; mfg = "2024-01-15"
} $InvInHdr

Banner "Inventory (Salesperson view - limited fields; only sellable)"
$invSales = Invoke-JsonGet "$BASE/orgs/$OrgId/inventory" $SalesHdr
$invSales.data | ConvertTo-Json -Depth 8 | Write-Host

Banner "Inventory (Admin) with search + pagination"
$invAdminPage1 = Invoke-JsonGet "$BASE/orgs/$OrgId/inventory?q=para&page=1&limit=1" $AdminHdr
$invAdminPage1.data | ConvertTo-Json -Depth 8 | Write-Host

Banner "Sell as Salesperson"
$sell = Invoke-JsonPost "$BASE/orgs/$OrgId/sell" @{ barcodeNo = "BAR-001"; qty = 3 } $SalesHdr
if ($sell.ok) { Write-Host "Sold 3 of BAR-001" -ForegroundColor Green }

Banner "Add expired batch for Ibuprofen (Inventory In)"
$addExpiredBatch = Invoke-JsonPost "$BASE/orgs/$OrgId/medicines" @{
  barcodeNo = "BAR-002"; name = "Ibuprofen"; type = "Tablet"; qty = 5; exp = "2020-01-01"; mfg = "2019-01-01"
} $InvInHdr

Banner "Manual expire-check (Inventory Manager)"
$expireCheck = Invoke-JsonPost "$BASE/orgs/$OrgId/expire-check" @{} $InvMgrHdr

Banner "Fetch Admin inventory to find a non-discarded batch to discard"
$invAdminFull = Invoke-JsonGet "$BASE/orgs/$OrgId/inventory" $AdminHdr
$invAdminFull.data | ConvertTo-Json -Depth 8 | Write-Host

# Find a batchId for Paracetamol to discard
$items = $invAdminFull.data.items
if (-not $items) { $items = $invAdminFull.data } # fallback
$paracetamol = $items | Where-Object { $_.barcodeNo -eq "BAR-001" } | Select-Object -First 1
$batchToDiscard = $paracetamol.batches | Where-Object { -not $_.isDiscarded } | Select-Object -First 1
if ($batchToDiscard) {
  Banner "Discard batch as Inventory Manager"
  $discard = Invoke-JsonPost "$BASE/orgs/$OrgId/batches/$($batchToDiscard.batchId)/discard" @{} $InvMgrHdr
}

Banner "Reports (Admin) - stock summary"
$stockSummary = Invoke-JsonGet "$BASE/orgs/$OrgId/reports/stock-summary" $AdminHdr
$stockSummary.data | ConvertTo-Json -Depth 8 | Write-Host

Banner "Reports (Inventory Manager) - low stock"
$lowStock = Invoke-JsonGet "$BASE/orgs/$OrgId/reports/low-stock?threshold=20" $InvMgrHdr
$lowStock.data | ConvertTo-Json -Depth 8 | Write-Host

Banner "Negative RBAC checks (expect 403)"
$badDiscard = Invoke-JsonPost "$BASE/orgs/$OrgId/batches/INVALID/discard" @{} $SalesHdr
$badReport = Invoke-JsonGet "$BASE/orgs/$OrgId/reports/stock-summary" $SalesHdr

Write-Host "`nDONE. Check outputs for expected 200/201 and 403/409 validations." -ForegroundColor Green
