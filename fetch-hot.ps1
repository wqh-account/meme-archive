# fetch-hot.ps1 - Daily hot topics fetcher (Bilibili official + Weibo/Douyin multi-source)
# Works on both Windows PowerShell 5.1 (local) and pwsh on GitHub Actions (ubuntu).
# Output: js/daily-data.js  (window.DAILY_HOT = {...})

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$UA = @{ "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36" }
$Limit = 15
$OutFile = Join-Path $PSScriptRoot "js\daily-data.js"

$result = [ordered]@{
    date      = (Get-Date -Format "yyyy-MM-dd")
    updatedAt = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    sources   = [ordered]@{ weibo = ""; bili = ""; douyin = "" }
    weibo     = @()
    bili      = @()
    douyin    = @()
}

# ---------- Bilibili (official API) ----------
try {
    $r = Invoke-RestMethod -Uri "https://api.bilibili.com/x/web-interface/popular?ps=$Limit" -Headers $UA -TimeoutSec 20
    $list = @()
    $rank = 0
    foreach ($item in $r.data.list) {
        $rank++
        $list += [ordered]@{ rank = $rank; title = [string]$item.title; hot = [int64]$item.stat.view; url = "https://www.bilibili.com/video/$($item.bvid)" }
    }
    $result.bili = $list
    $result.sources.bili = "bilibili-official"
    Write-Host "[OK] bilibili: $($list.Count) items"
} catch {
    $result.sources.bili = "FAIL: $($_.Exception.Message)"
    Write-Host "[FAIL] bilibili: $($_.Exception.Message)"
}

# ---------- Weibo (fallback chain) ----------
function Get-WeiboSource {
    # source 1: vvhan
    try {
        $r = Invoke-RestMethod -Uri "https://api.vvhan.com/api/hotlist/wbHot" -Headers $UA -TimeoutSec 12
        if ($r.success -and $r.data) { return @{ list = $r.data; src = "vvhan" } }
    } catch { }
    # source 2: imsyy dailyhot
    try {
        $r = Invoke-RestMethod -Uri "https://api-hot.imsyy.top/wbhot" -Headers $UA -TimeoutSec 12
        if ($r.data) { return @{ list = $r.data; src = "imsyy" } }
    } catch { }
    # source 3: Baidu hot board (reliable in mainland China)
    try {
        $r = Invoke-RestMethod -Uri "https://top.baidu.com/api/board?platform=wise&tab=realtime" -Headers $UA -TimeoutSec 12
        $card = $r.data.cards | Where-Object { $_.component -eq "tabTextList" } | Select-Object -First 1
        if ($card -and $card.content) {
            # Baidu returns a nested structure: content[0].content[] holds the real list
            $raw = if ($card.content[0] -and $card.content[0].content) { $card.content[0].content } else { $card.content }
            $list = @()
            foreach ($it in $raw) {
                if (-not $it.word) { continue }
                $list += [pscustomobject]@{
                    title = [string]$it.word
                    hot   = 0
                    url   = if ($it.url) { [string]$it.url } else { "https://www.baidu.com/s?wd=$([uri]::EscapeDataString([string]$it.word))" }
                }
            }
            if ($list.Count) { return @{ list = $list; src = "baidu-hot" } }
        }
    } catch { }
    return $null
}
$wbSrc = Get-WeiboSource
if ($wbSrc) {
    $list = @()
    $rank = 0
    foreach ($item in ($wbSrc.list | Select-Object -First $Limit)) {
        $rank++
        $t = [string]$item.title
        $h = if ($null -ne $item.hot) { [int64]$item.hot } elseif ($null -ne $item.num) { [int64]$item.num } else { 0 }
        $u = if ($item.url) { [string]$item.url } else { "https://s.weibo.com/weibo?q=$([uri]::EscapeDataString($t))" }
        $list += [ordered]@{ rank = $rank; title = $t; hot = $h; url = $u }
    }
    $result.weibo = $list
    $result.sources.weibo = $wbSrc.src
    Write-Host "[OK] weibo ($($wbSrc.src)): $($list.Count) items"
} else {
    $result.sources.weibo = "unavailable"
    Write-Host "[FAIL] weibo: all sources unreachable"
}

# ---------- Douyin (vvhan -> imsyy -> toutiao fallback) ----------
function Get-DouyinSource {
    try {
        $r = Invoke-RestMethod -Uri "https://api.vvhan.com/api/hotlist/douyinHot" -Headers $UA -TimeoutSec 12
        if ($r.success -and $r.data) { return @{ list = $r.data; src = "vvhan" } }
    } catch { }
    try {
        $r = Invoke-RestMethod -Uri "https://api-hot.imsyy.top/douyinhot" -Headers $UA -TimeoutSec 12
        if ($r.data) { return @{ list = $r.data; src = "imsyy" } }
    } catch { }
    return $null
}
$dySrc = Get-DouyinSource
if ($dySrc) {
    $list = @()
    $rank = 0
    foreach ($item in ($dySrc.list | Select-Object -First $Limit)) {
        $rank++
        $t = [string]$item.title
        $h = if ($null -ne $item.hot) { [int64]$item.hot } elseif ($null -ne $item.num) { [int64]$item.num } else { 0 }
        $u = if ($item.url) { [string]$item.url } else { "https://www.douyin.com/search/$([uri]::EscapeDataString($t))" }
        $list += [ordered]@{ rank = $rank; title = $t; hot = $h; url = $u }
    }
    $result.douyin = $list
    $result.sources.douyin = $dySrc.src
    Write-Host "[OK] douyin ($($dySrc.src)): $($list.Count) items"
} else {
    # fallback: toutiao hot board (ByteDance, same ecosystem as douyin)
    try {
        $r = Invoke-RestMethod -Uri "https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc" -Headers $UA -TimeoutSec 15
        $list = @()
        $rank = 0
        foreach ($item in ($r.data | Select-Object -First $Limit)) {
            $rank++
            $list += [ordered]@{ rank = $rank; title = [string]$item.Title; hot = [int64]$item.HotValue; url = [string]$item.Url }
        }
        $result.douyin = $list
        $result.sources.douyin = "toutiao-fallback"
        Write-Host "[OK] douyin (toutiao fallback): $($list.Count) items"
    } catch {
        $result.sources.douyin = "unavailable"
        Write-Host "[FAIL] douyin: all sources unreachable"
    }
}

# ---------- Write js/daily-data.js (UTF-8 no BOM) ----------
$json = $result | ConvertTo-Json -Depth 6
$js = "// Auto-generated by fetch-hot.ps1 at $($result.updatedAt)`nwindow.DAILY_HOT = $json;`n"
[System.IO.File]::WriteAllText($OutFile, $js, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "[DONE] wrote $OutFile ($($js.Length) bytes)"
