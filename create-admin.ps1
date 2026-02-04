# PowerShell script to create admin user
$uri = "http://localhost:5000/api/auth/signup"
$body = @{
    name = "Admin User"
    email = "admin@plantdi.com"
    password = "admin123"
    role = "admin"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $uri -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ Admin user created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📧 Login Credentials:" -ForegroundColor Cyan
    Write-Host "Email: admin@plantdi.com"
    Write-Host "Password: admin123"
    Write-Host ""
    Write-Host "🌐 Login at: http://localhost:5173/login" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "ℹ️  Admin user already exists!" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "📧 Use these credentials to login:" -ForegroundColor Cyan
        Write-Host "Email: admin@plantdi.com"
        Write-Host "Password: admin123"
    } else {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        Write-Host "Make sure the backend server is running on port 5000" -ForegroundColor Yellow
        Write-Host "Run: cd backend && npm run dev" -ForegroundColor Cyan
    }
}
