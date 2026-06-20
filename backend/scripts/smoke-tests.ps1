$base='http://localhost:8080'
Write-Output 'Registering ADMIN...'
$adminReg = Invoke-RestMethod -Uri "$base/api/auth/register" -Method Post -ContentType 'application/json' -Body ('{"fullName":"Admin User","email":"admin@example.com","password":"adminpass","role":"ADMIN"}')
$adminToken = $adminReg.accessToken
Write-Output "ADMIN_TOKEN:$adminToken"

Write-Output 'Registering STAFF...'
$staffReg = Invoke-RestMethod -Uri "$base/api/auth/register" -Method Post -ContentType 'application/json' -Body ('{"fullName":"Staff User","email":"staff@example.com","password":"staffpass","role":"STAFF"}')
$staffToken = $staffReg.accessToken
Write-Output "STAFF_TOKEN:$staffToken"

Write-Output 'Login ADMIN...'
$adminLogin = Invoke-RestMethod -Uri "$base/api/auth/login" -Method Post -ContentType 'application/json' -Body ('{"email":"admin@example.com","password":"adminpass"}')
Write-Output "ADMIN_LOGIN_TOKEN:$($adminLogin.accessToken)"

Write-Output 'Login STAFF...'
$staffLogin = Invoke-RestMethod -Uri "$base/api/auth/login" -Method Post -ContentType 'application/json' -Body ('{"email":"staff@example.com","password":"staffpass"}')
Write-Output "STAFF_LOGIN_TOKEN:$($staffLogin.accessToken)"

Write-Output 'Creating Room with ADMIN...'
$roomBody = @{ name='Room 101'; building='Main'; floor=1; capacity=30 } | ConvertTo-Json
$roomResp = Invoke-RestMethod -Uri "$base/api/rooms" -Method Post -ContentType 'application/json' -Headers @{ Authorization = "Bearer $adminToken" } -Body $roomBody
Write-Output "ROOM_CREATED: $($roomResp.message)"

Write-Output 'Creating Course with ADMIN...'
$courseBody = @{ code='CS101'; name='Intro to CS'; studentCount=100 } | ConvertTo-Json
$courseResp = Invoke-RestMethod -Uri "$base/api/courses" -Method Post -ContentType 'application/json' -Headers @{ Authorization = "Bearer $adminToken" } -Body $courseBody
Write-Output "COURSE_CREATED: $($courseResp.message)"

Write-Output 'GET rooms with STAFF...'
$rooms = Invoke-RestMethod -Uri "$base/api/rooms" -Method Get -Headers @{ Authorization = "Bearer $staffToken" }
Write-Output "GET_ROOMS_OK: $($rooms.message)"

Write-Output 'GET courses with STAFF...'
$courses = Invoke-RestMethod -Uri "$base/api/courses" -Method Get -Headers @{ Authorization = "Bearer $staffToken" }
Write-Output "GET_COURSES_OK: $($courses.message)"

Write-Output 'Creating Room with STAFF (expected failure if role enforced)...'
try {
    Invoke-RestMethod -Uri "$base/api/rooms" -Method Post -ContentType 'application/json' -Headers @{ Authorization = "Bearer $staffToken" } -Body $roomBody -ErrorAction Stop
    Write-Output 'STAFF_CREATE_ROOM_SUCCEEDED'
} catch {
    Write-Output "STAFF_CREATE_ROOM_FAILED: $($_.Exception.Response.StatusCode) $($_.Exception.Message)"
}

Write-Output 'Smoke tests complete.'
