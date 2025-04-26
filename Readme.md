# 📚 API Documentation

## Base URL

```
http://localhost:3000/api
```

---

## 1. **POST** `/addMenu`

### Description
Stores a new menu into the storage (Redis or file-based, depending on configuration).

### Request

- **Method**: `POST`
- **URL**: `/api/addMenu`
- **Content-Type**: `application/json`

### Body Parameters

```json
{
  "menus": [
    {
      "id": 1,
      "sysName": "King menu",
      "name": {
        "en-GB": "King menu",
        "fr-FR": "Le menu de roi"
      },
      "price": 2.3,
      "vatRate": "normal"
    }
  ],
  "vatRates": {
    "normal": {
      "ratePct": 20,
      "isDefault": true
    }
  }
}
```

**Field Validation**:
- `menus` (array of objects): Required
  - `id` (integer > 0): Required
  - `sysName` (string): Required
  - `name` (object with locale keys, values as strings): Required
  - `price` (float > 0): Required
  - `vatRate` (enum: `'normal' | 'reduced' | 'none'`): Required
- `vatRates` (object): Required
  - keys must be `'normal'`, `'reduced'`, or `'none'`
  - each value must contain:
    - `ratePct` (float > 0): Required
    - `isDefault` (boolean): Optional (defaults to false)

### Response

- **Success** (201 Created)

```json
{
  "status": "stored",
  "key": "DATA_A"
}
```

- **Error** (400 Bad Request or 500 Internal Server Error)

```json
{
  "error": "Validation failed"
}
```

---

## 2. **GET** `/getMenu`

### Description
Retrieves and merges stored menu data (`DATA_A`) with external API data (`DATA_B`).  
Supports caching and automatic retries.

### Behavior

- Tries to **fetch cached external data** first.
- If external API fetch **fails**, retries up to **5 times**.
- Merges `DATA_A` (local) and `DATA_B` (external) into one final response.
- Sets cache-related HTTP headers (`Cache-Control`, `ETag`, etc.).

### Request

- **Method**: `GET`
- **URL**: `/api/getMenu`

### Response

- **Success** (200 OK)

```json
{
  "menus": [...],
  "vatRates": {...},
  ... (merged fields from internal + external data)
}
```

HTTP Headers:
- `Cache-Control: public, max-age=60`
- `ETag`: Content hash for cache validation
- `X-Source: merged-from-body-and-external`

- **Cache Miss Example**:
  - If `DATA_A` not found, returns 404.
  - If cached external data (`DATA_B`) not found, returns 503.

```json
{
  "error": "err_menu_not_found"
}
```

or

```json
{
  "error": "err_external_data_not_found"
}
```

---

## ⚙️ Storage Behavior

- **Redis / File storage** 
- External API data is cached into storage after successful fetch.

---

# 🚀 Future Improvements

- If external API fails, **fallback to cached external data**.


