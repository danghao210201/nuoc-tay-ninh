# Hướng dẫn Deployment với Cấu hình API động

## Tổng quan

Ứng dụng này hiện hỗ trợ cấu hình baseURL API động, cho phép thay đổi server API mà không cần build lại code.

## Cấu trúc Files

```
app/
├── config/
│   ├── api.ts              # Logic cấu hình API
│   ├── api.config.json     # File cấu hình mẫu
│   └── README.md          # Hướng dẫn cấu hình
├── services/
│   └── api.ts             # API services (đã updated)
└── components/
    ├── GovernmentResponse.tsx (đã updated)
    └── ReflectionImage.tsx    (đã updated)
```

## Deployment trên IIS

### Bước 1: Build ứng dụng

```bash
# Disable SSR để chạy SPA mode (đơn giản hơn cho IIS)
# Sửa react-router.config.ts: ssr: false

npm run build
```

### Bước 2: Chuẩn bị files cho IIS

1. Copy nội dung thư mục `build/client` vào thư mục IIS website
2. **QUAN TRỌNG**: Copy file `web.config.simple` vào thư mục root của IIS website và đổi tên thành `web.config` (để fix lỗi 404 khi F5)
   - ✅ **Đã kiểm chứng**: File này đã xử lý thành công vấn đề F5 tại các route
   - Nếu cần security headers, có thể dùng file `web.config` gốc thay thế
3. Copy file `app/config/api.config.json` vào thư mục root của IIS website
4. Đổi tên thành `api.config.json` (bỏ prefix)

### Bước 3: Cấu hình API cho môi trường

Chỉnh sửa file `api.config.json` trong IIS website:

```json
{
  "baseURL": "https://your-production-api.com",
  "endpoints": {
    "searchPublicPetitions": "/api/sso/search-public-petitions",
    "petitionDetail": "/api/sso/petition-detail",
    "fileDownload": "/api/sso/file"
  },
  "timeout": 10000,
  "retryAttempts": 3
}
```

### Bước 4: Cấu hình IIS

**QUAN TRỌNG**: File `web.config` đã được tạo sẵn trong project. Copy file này vào thư mục root của IIS website để giải quyết lỗi 404 khi F5 tại các route như `/send-reflection`.

File `web.config` bao gồm:
- URL Rewrite rules để chuyển hướng tất cả requests về index.html
- MIME type mappings cho các file static
- Custom error handling cho 404 errors
- Loại trừ các đường dẫn API và assets khỏi rewrite

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="React Router" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
            <add input="{REQUEST_URI}" pattern="^/(api|assets)/" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
      <mimeMap fileExtension=".js" mimeType="application/javascript" />
      <mimeMap fileExtension=".css" mimeType="text/css" />
      <mimeMap fileExtension=".json" mimeType="application/json" />
      <mimeMap fileExtension=".woff" mimeType="font/woff" />
      <mimeMap fileExtension=".woff2" mimeType="font/woff2" />
      <mimeMap fileExtension=".svg" mimeType="image/svg+xml" />
    </staticContent>
    <httpErrors errorMode="Custom">
      <remove statusCode="404" subStatusCode="-1" />
      <error statusCode="404" path="/" responseMode="ExecuteURL" />
    </httpErrors>
  </system.webServer>
</configuration>
```

## Các tình huống Deployment

### Tình huống 1: Same Domain API

```json
{
  "baseURL": "https://yourdomain.com"
}
```

### Tình huống 2: Different Domain API

```json
{
  "baseURL": "https://api.yourdomain.com"
}
```

### Tình huống 3: Development vs Production

Tạo nhiều file config:

- `api.config.dev.json`
- `api.config.prod.json`

Script deployment có thể copy file phù hợp.

### Tình huống 4: API Proxy qua IIS

Nếu muốn proxy API qua IIS:

```xml
<rule name="API Proxy" stopProcessing="true">
  <match url="^api/(.*)" />
  <action type="Rewrite" url="https://real-api-server.com/api/{R:1}" />
</rule>
```

Và config:

```json
{
  "baseURL": ""
}
```

## Script Deployment tự động

### PowerShell Script (deploy.ps1)

```powershell
param(
    [string]$Environment = "prod",
    [string]$IISPath = "C:\inetpub\wwwroot\your-app"
)

# Build app
npm run build

# Copy files
Copy-Item -Path "build\client\*" -Destination $IISPath -Recurse -Force

# Copy web.config for IIS URL rewrite (using simple version - proven to work)
Copy-Item -Path "web.config.simple" -Destination "$IISPath\web.config" -Force
Copy-Item -Path "web.config" -Destination "$IISPath\web.config.full" -Force

# Copy appropriate config
$configFile = "app\config\api.config.$Environment.json"
if (Test-Path $configFile) {
    Copy-Item -Path $configFile -Destination "$IISPath\api.config.json" -Force
} else {
    Copy-Item -Path "app\config\api.config.json" -Destination "$IISPath\api.config.json" -Force
}

Write-Host "Deployment completed for $Environment environment"
```

### Bash Script (deploy.sh)

```bash
#!/bin/bash
ENVIRONMENT=${1:-prod}
IIS_PATH="/c/inetpub/wwwroot/your-app"

# Build app
npm run build

# Copy files
cp -r build/client/* "$IIS_PATH/"

# Copy web.config for IIS URL rewrite (using simple version - proven to work)
cp "web.config.simple" "$IIS_PATH/web.config"
cp "web.config" "$IIS_PATH/web.config.full"

# Copy appropriate config
if [ -f "app/config/api.config.$ENVIRONMENT.json" ]; then
    cp "app/config/api.config.$ENVIRONMENT.json" "$IIS_PATH/api.config.json"
else
    cp "app/config/api.config.json" "$IIS_PATH/api.config.json"
fi

echo "Deployment completed for $ENVIRONMENT environment"
```

## Testing

### Test cấu hình đang hoạt động:

```javascript
// Mở Developer Console và chạy:
console.log(window.__API_CONFIG__);

// Hoặc kiểm tra network requests để xem baseURL
```

### Test thay đổi config runtime:

```javascript
// Trong console:
import { setApiConfig } from "./app/config/api";
setApiConfig({ baseURL: "https://test-api.com" });
```

## Troubleshooting

1. **Lỗi 404 khi F5 tại các route (VD: /send-reflection, /reflection/:id)**:
   - **Nguyên nhân**: IIS không hiểu client-side routing của React Router
   - **✅ GIẢI PHÁP ĐÃ KIỂM CHỨNG**: Sử dụng file `web.config.simple` - đã xử lý thành công vấn đề này
   - **Giải pháp thay thế**: File `web.config` (phiên bản đầy đủ) nếu cần thêm security headers
   - **Kiểm tra bắt buộc**:
     * IIS có module URL Rewrite được cài đặt
     * File `index.html` tồn tại trong thư mục root
     * Quyền đọc/ghi file cho IIS user
   - **Test**: Sau khi copy web.config.simple, thử F5 tại `/send-reflection` và `/reflection/123`
   - **Debug**: Kiểm tra IIS logs nếu vẫn lỗi 404

2. **Config không load được**: Kiểm tra file `api.config.json` có trong root website không

3. **CORS errors**: Cấu hình CORS trên API server hoặc dùng proxy

4. **Network errors**: Kiểm tra network tab để xem requests đi đâu

5. **Cache issues**: Clear browser cache sau khi update config

6. **URL Rewrite module không có**:
   - Download và cài đặt IIS URL Rewrite Module từ Microsoft
   - Restart IIS sau khi cài đặt

7. **Cách kiểm tra URL Rewrite hoạt động**:
   - Mở IIS Manager → chọn website → kiểm tra có icon "URL Rewrite" không
   - Nếu không có: cài đặt URL Rewrite Module
   - Test bằng cách truy cập trực tiếp: `yourdomain.com/send-reflection`

8. **Debug chi tiết cho lỗi 404**:
   - **Bước 1**: Kiểm tra file `index.html` có trong root không
   - **Bước 2**: Test URL đơn giản: `yourdomain.com/` (phải load được)
   - **Bước 3**: Kiểm tra IIS logs tại `C:\inetpub\logs\LogFiles\`
   - **Bước 4**: Thử `web.config.simple` thay vì `web.config`
   - **Bước 5**: Kiểm tra Application Pool identity có quyền đọc file không

9. **Các file web.config có sẵn**:
   - `web.config.simple`: ✅ **KHUYẾN NGHỊ** - Phiên bản tối giản, đã kiểm chứng hoạt động tốt
   - `web.config`: Phiên bản đầy đủ với security headers (backup option)

## Lưu ý quan trọng

- File config chỉ được load 1 lần khi app khởi động
- Để thay đổi config, cần refresh page hoặc dùng `setApiConfig()`
- File config phải có format JSON hợp lệ
- Backup file config cũ trước khi update production
