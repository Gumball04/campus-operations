$base='http://localhost:8080'
$ts = [int][double]::Parse((Get-Date -UFormat %s))
$adminEmail = "admin+$ts@example.com"
$staffEmail = "staff+$ts@example.com"

function PostJson($url,$body,$token) {
    $hdr = @{}
    if ($token) { $hdr.Authorization = "Bearer $token" }
    try {
        $r = Invoke-WebRequest -Uri $url -Method Post -ContentType 'application/json' -Body ($body | ConvertTo-Json -Depth 5) -Headers $hdr -UseBasicParsing -ErrorAction Stop
        return @{ Status=$r.StatusCode; Body=$r.Content }
    } catch {
        if ($_.Exception.Response) { return @{ Status=($_.Exception.Response.StatusCode.Value__); Body=$_.Exception.Message } } else { return @{ Status=0; Body=$_.Exception.Message } }
    }
}

function GetJson($url,$token) {
    $hdr = @{}
    if ($token) { $hdr.Authorization = "Bearer $token" }
    try {
        $r = Invoke-WebRequest -Uri $url -Method Get -Headers $hdr -UseBasicParsing -ErrorAction Stop
        return @{ Status=$r.StatusCode; Body=$r.Content }
    } catch {
        if ($_.Exception.Response) { return @{ Status=($_.Exception.Response.StatusCode.Value__); Body=$_.Exception.Message } } else { return @{ Status=0; Body=$_.Exception.Message } }
    }
}

Write-Output "Registering ADMIN ($adminEmail)..."
$adminReg = PostJson "$base/api/auth/register" @{ fullName='Admin User'; email=$adminEmail; password='adminpass'; role='ADMIN' } $null
Write-Output "ADMIN register => $($adminReg.Status)"
if ($adminReg.Status -eq 200) { $adminToken = (ConvertFrom-Json $adminReg.Body).accessToken } else { Write-Output "ADMIN register body: $($adminReg.Body)" }

Write-Output "Registering STAFF ($staffEmail)..."
$staffReg = PostJson "$base/api/auth/register" @{ fullName='Staff User'; email=$staffEmail; password='staffpass'; role='STAFF' } $null
Write-Output "STAFF register => $($staffReg.Status)"
if ($staffReg.Status -eq 200) { $staffToken = (ConvertFrom-Json $staffReg.Body).accessToken } else { Write-Output "STAFF register body: $($staffReg.Body)" }

Write-Output "Login ADMIN..."
$adminLogin = PostJson "$base/api/auth/login" @{ email=$adminEmail; password='adminpass' } $null
Write-Output "ADMIN login => $($adminLogin.Status)"
if ($adminLogin.Status -eq 200) { $adminToken = (ConvertFrom-Json $adminLogin.Body).accessToken; Write-Output "ADMIN_TOKEN:$adminToken" } else { Write-Output $adminLogin.Body }

Write-Output "Login STAFF..."
$staffLogin = PostJson "$base/api/auth/login" @{ email=$staffEmail; password='staffpass' } $null
Write-Output "STAFF login => $($staffLogin.Status)"
if ($staffLogin.Status -eq 200) { $staffToken = (ConvertFrom-Json $staffLogin.Body).accessToken; Write-Output "STAFF_TOKEN:$staffToken" } else { Write-Output $staffLogin.Body }

# Create room with ADMIN
Write-Output 'Creating Room with ADMIN...'
$roomBody = @{ name='Room 101'; building='Main'; floor=1; capacity=30 }
$roomResp = PostJson "$base/api/rooms" $roomBody $adminToken
Write-Output "CREATE ROOM => $($roomResp.Status)"
Write-Output $roomResp.Body

# Create course with ADMIN
Write-Output 'Creating Course with ADMIN...'
$courseBody = @{ code=("CS101-$ts"); name='Intro to CS'; studentCount=100 }
$courseResp = PostJson "$base/api/courses" $courseBody $adminToken
Write-Output "CREATE COURSE => $($courseResp.Status)"
Write-Output $courseResp.Body

# GET rooms with STAFF
Write-Output 'GET rooms with STAFF...'
$rooms = GetJson "$base/api/rooms" $staffToken
Write-Output "GET ROOMS => $($rooms.Status)"
Write-Output $rooms.Body

# GET courses with STAFF
Write-Output 'GET courses with STAFF...'
$courses = GetJson "$base/api/courses" $staffToken
Write-Output "GET COURSES => $($courses.Status)"
Write-Output $courses.Body

# Try POST room with STAFF (should be forbidden)
Write-Output 'Creating Room with STAFF (expected failure if role enforced)...'
$staffCreateRoom = PostJson "$base/api/rooms" $roomBody $staffToken
Write-Output "STAFF CREATE ROOM => $($staffCreateRoom.Status)"
Write-Output $staffCreateRoom.Body

Write-Output 'Smoke tests 2 complete.'
