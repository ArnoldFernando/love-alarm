$token = "30|7HwNY0YpmbDm8kOJiOpoWgrTfRZXU9vD5ArMcxuLbb6c097e"
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8011/api/v1/matches" -Headers @{ "Authorization" = "Bearer $token"; "Accept" = "application/json" } -Method GET -UseBasicParsing
    Write-Host "STATUS:" $response.StatusCode
    Write-Host "BODY:" $response.Content
} catch {
    Write-Host "EXCEPTION:" $_.Exception.Message
}
