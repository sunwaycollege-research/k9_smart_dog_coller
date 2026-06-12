# K9 Smart Dog Collar — Backend API Test Documentation

> **Base URL:** `http://localhost:3000`  
> **Content-Type:** `application/json` (set on every request)  
> **Authorization:** `Bearer <JWT_TOKEN>` (where required)

---

## Authentication Note

Endpoints marked 🔒 require an `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

`/pet/update-attributes` has no auth guard (collar hardware sends directly).

---

## 1. User Endpoints

### `POST /user/register`

Register a new user account.

**Headers**
| Key | Value |
|---|---|
| Content-Type | application/json |

**Request Body**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "John@1234"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `username` | string | ✅ | Must be unique |
| `email` | string | ✅ | |
| `password` | string | ✅ | Min 8 chars, must include uppercase, lowercase, digit, special char (`@$!%*?&^#`) |

**Responses**

| Status | Body |
|---|---|
| `201` | `{ "message": "User created successfully", "user": { ... } }` |
| `400` | `{ "message": "User already exists" }` |
| `400` | `{ "message": "Password must be at least 8 characters..." }` |
| `500` | `{ "message": "Internal server error" }` |

---

## 2. Pet Endpoints

### `POST /pet/register` 🔒

Register a new pet under a user account.

**Headers**
| Key | Value |
|---|---|
| Content-Type | application/json |
| Authorization | Bearer `<token>` |

**Request Body**
```json
{
  "name": "Buddy",
  "breed": "Golden Retriever",
  "age": 3,
  "gender": "male",
  "color": "golden",
  "weight": 28.5,
  "owner": "684a1f2c3e4b5d6f7a8b9c0d",
  "vaccinations": ["Rabies", "Parvovirus"],
  "healthNotes": "No known allergies",
  "temperament": "Friendly and playful"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | ✅ | |
| `breed` | string | ✅ | |
| `age` | number | ✅ | |
| `gender` | string | ✅ | `"male"` or `"female"` only |
| `color` | string | ✅ | |
| `weight` | number | ✅ | in kg |
| `owner` | string | ✅ | MongoDB `_id` of the registered user |
| `vaccinations` | string[] | ❌ | defaults to `[]` |
| `healthNotes` | string | ❌ | defaults to `""` |
| `temperament` | string | ❌ | defaults to `""` |

**Responses**

| Status | Body |
|---|---|
| `201` | `{ "message": "Your pet has been added to our system.", "pet": { ... } }` |
| `400` | `{ "message": "All fields are required" }` |
| `404` | `{ "message": "You are not an owner." }` |
| `401` | `{ "message": "Unauthorized" }` |
| `500` | `{ "message": "Internal server error" }` |

---

### `POST /pet/assign-collar` 🔒

Link a physical collar to a registered pet.

**Headers**
| Key | Value |
|---|---|
| Content-Type | application/json |
| Authorization | Bearer `<token>` |

**Request Body**
```json
{
  "collarModelNo": "K9-COL-2024-001",
  "petId": "684a1f2c3e4b5d6f7a8b9c0d"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `collarModelNo` | string | ✅ | Must match an existing collar in the DB |
| `petId` | string | ✅ | MongoDB `_id` of the pet |

**Responses**

| Status | Body |
|---|---|
| `200` | `{ "message": "Collar assigned to pet successfully", "pet": { ... }, "collar": { ... } }` |
| `400` | `{ "message": "Collar model number and pet ID are required" }` |
| `400` | `{ "message": "Collar is already assigned to another pet" }` |
| `404` | `{ "message": "Collar not found" }` |
| `404` | `{ "message": "Pet not found" }` |
| `401` | `{ "message": "Unauthorized" }` |
| `500` | `{ "message": "Internal server error" }` |

---

### `POST /pet/check-collar` 🔒

Look up a collar's current status and assignment.

**Headers**
| Key | Value |
|---|---|
| Content-Type | application/json |
| Authorization | Bearer `<token>` |

**Request Body**
```json
{
  "collarModelNo": "K9-COL-2024-001"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `collarModelNo` | string | ✅ | |

**Responses**

| Status | Body |
|---|---|
| `200` | `{ "message": "Collar found", "collar": { ... } }` |
| `400` | `{ "message": "Collar model number is required" }` |
| `404` | `{ "message": "Collar not found" }` |
| `401` | `{ "message": "Unauthorized" }` |
| `500` | `{ "message": "Internal server error" }` |

---

### `POST /pet/update-attributes`

Push live sensor data from the collar. Called automatically every **10 seconds** by the collar hardware. No auth guard — collar sends directly.

> On the **first** call for a pet+collar pair, a new `PetAttributes` document is created with an empty `history[]`.
> On every **subsequent** call, the current live values are archived into `history[]` before being overwritten with the new data.

**Headers**
| Key | Value |
|---|---|
| Content-Type | application/json |

**Request Body**
```json
{
  "collarModelNo": "K9-COL-2024-001",
  "petId": "684a1f2c3e4b5d6f7a8b9c0d",
  "attributes": {
    "coordinates": {
      "latitude": 27.7172,
      "longitude": 85.3240
    },
    "heartRate": 82,
    "temperature": 38.5,
    "batteryLevel": 74,
    "status": "active"
  }
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `collarModelNo` | string | ✅ | Must match an existing collar |
| `petId` | string | ✅ | MongoDB `_id` of the pet |
| `attributes.coordinates.latitude` | number | ✅ | |
| `attributes.coordinates.longitude` | number | ✅ | |
| `attributes.heartRate` | number | ✅ | beats per minute |
| `attributes.temperature` | number | ✅ | in °C |
| `attributes.batteryLevel` | number | ✅ | percentage 0–100 |
| `attributes.status` | string | ✅ | e.g. `"active"`, `"resting"`, `"lost"` |

**Responses**

| Status | Body |
|---|---|
| `200` | `{ "message": "Attributes updated successfully", "petAttributes": { ... } }` |
| `400` | `{ "message": "Collar model number, pet ID, and attributes are required" }` |
| `404` | `{ "message": "Collar not found" }` |
| `404` | `{ "message": "Pet not found" }` |
| `500` | `{ "message": "Internal server error" }` |

---

## Rate Limits

| Limiter | Applied To | Limit |
|---|---|---|
| `authLimiter` | `/user/register`, `/pet/register`, `/pet/assign-collar`, `/pet/check-collar` | 10 requests / 15 min per IP |
| none | `/pet/update-attributes` | unlimited (hardware feed) |

---

## Postman Environment Variables (recommended)

Set these in a Postman Environment for easy reuse:

| Variable | Example Value |
|---|---|
| `base_url` | `http://localhost:3000` |
| `token` | `eyJhbGci...` (paste after getting it from your auth flow) |
| `owner_id` | `684a1f2c3e4b5d6f7a8b9c0d` |
| `pet_id` | `684b2c3d4e5f6a7b8c9d0e1f` |
| `collar_model_no` | `K9-COL-2024-001` |
