# Cấu hình API

## Mô tả

Thư mục này chứa các file cấu hình cho API endpoints của ứng dụng. Điều này cho phép bạn thay đổi baseURL và endpoints mà không cần build lại ứng dụng.

## Cách sử dụng

### 1. Cấu hình qua File JSON

Copy file `api.config.json` vào thư mục `public/` của build output và chỉnh sửa:

```json
{
  "baseURL": "https://your-api-server.com",
  "endpoints": {
    "searchPublicPetitions": "/api/sso/search-public-petitions",
    "petitionDetail": "/api/sso/petition-detail",
    "fileDownload": "/api/sso/file"
  },
  "timeout": 10000,
  "retryAttempts": 3
}
```

### 2. Cấu hình qua Environment Variables

Trong HTML của bạn, thêm:

```html
<script>
  window.__API_CONFIG__ = {
    baseURL: "https://your-api-server.com",
  };
</script>
```

### 3. Cấu hình động trong Runtime

```typescript
import { setApiConfig } from "./app/config/api";

// Thay đổi cấu hình runtime
setApiConfig({
  baseURL: "https://new-api-server.com",
});
```

## Deployment với IIS

### SPA Mode (Khuyến nghị)

1. Copy file `api.config.json` vào thư mục root của IIS website
2. Chỉnh sửa `baseURL` theo môi trường của bạn
3. Restart IIS để áp dụng cấu hình mới

### Reverse Proxy Mode

Nếu bạn sử dụng IIS làm reverse proxy, có thể giữ nguyên baseURL và chỉ cần proxy requests.

## Lưu ý

- File config sẽ được load asynchronously khi ứng dụng khởi động
- Nếu không tìm thấy file config, sẽ sử dụng cấu hình mặc định
- Environment variables có độ ưu tiên cao hơn file config
- Thay đổi cấu hình runtime sẽ override tất cả cấu hình khác
