@echo off
echo Creating Admin User...
echo.

curl -X POST http://localhost:5000/api/auth/signup ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Admin User\",\"email\":\"admin@plantdi.com\",\"password\":\"admin123\",\"role\":\"admin\"}"

echo.
echo.
echo ========================================
echo Admin Login Credentials:
echo Email: admin@plantdi.com
echo Password: admin123
echo ========================================
echo.
echo Login at: http://localhost:5173/login
echo.
pause
