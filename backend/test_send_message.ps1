$token = "30|7HwNY0YpmbDm8kOJiOpoWgrTfRZXU9vD5ArMcxuLbb6c097e"
$body = @{ content = "hello test message" } | ConvertTo-Json
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8011/api/v1/conversations/01a04dca-d383-7122-a6a3-c4f4aa9f4d99/messages" -Headers @{ "Authorization" = "Bearer $token"; "Accept" = "application/json"; "Content-Type" = "application/json" } -Method POST -Body $body -UseBasicParsing
    Write-Host "STATUS:" $response.StatusCode
    Write-Host "BODY:" $response.Content
} catch {
    Write-Host "EXCEPTION:" $_.Exception.Message
}
