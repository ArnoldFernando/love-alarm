$token = "28|M6Wek4WZTxw0IHtmWi2sMH9wEdCqiNRh5vcZRXWO171f331b"
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8011/api/v1/crushes/received" -Headers @{ "Authorization" = "Bearer $token"; "Accept" = "application/json" } -Method GET
    Write-Host "STATUS:" $response.StatusCode
    Write-Host "BODY:" $response.Content
} catch {
    Write-Host "EXCEPTION:" $_.Exception.Message
    if ($_.Exception.Response) {
        Write-Host "STATUS:" $_.Exception.Response.StatusCode.value__
    }
}
