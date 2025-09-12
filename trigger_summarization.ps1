# trigger_summarization.ps1
$url = 'http://localhost:3000/api/start-summarization'   # change to your deployed URL if not local
# call with empty JSON body (your endpoint tolerates missing accessToken)
try {
  $resp = Invoke-RestMethod -Uri $url -Method Post -ContentType 'application/json' -Body '{}'
  Write-Output "Triggered summarization: $($resp | ConvertTo-Json -Depth 3)"
} catch {
  Write-Output "Trigger failed: $($_.Exception.Message)"
}