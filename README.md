# User Management API

REST API untuk manajemen pengguna yang dibangun dengan Node.js, Express, TypeScript, dan Firebase Firestore. API ini dirancang untuk diintegrasikan dengan aplikasi Flutter.

## 🚀 Fitur

- **Registrasi Pengguna** - Daftarkan pengguna baru dengan avatar
- **Login Pengguna** - Autentikasi pengguna dengan email dan password
- **Manajemen Profil** - Lihat dan update profil pengguna
- **Upload Avatar** - Upload dan update foto profil pengguna
- **Keamanan** - Password di-hash menggunakan bcrypt
- **Database** - Firebase Firestore untuk penyimpanan data

## 📋 Prasyarat

Pastikan Anda telah menginstall:

- [Node.js](https://nodejs.org/) (v16 atau lebih tinggi)
- [npm](https://www.npmjs.com/) atau [yarn](https://yarnpkg.com/)
- [Firebase Project](https://console.firebase.google.com/) dengan Firestore aktif

## 🛠️ Instalasi & Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd user_management_api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Firebase

1. Buat project baru di [Firebase Console](https://console.firebase.google.com/)
2. Aktifkan Firestore Database
3. Buat Service Account:
   - Buka **Project Settings** > **Service Accounts**
   - Klik **Generate new private key**
   - Download file JSON dan rename menjadi `serviceAccountKey.json`
   - Letakkan file di root directory project

### 4. Setup Environment Variables

Buat file `.env` di root directory:

```env
PORT=3000
FIREBASE_PROJECT_ID=your-project-id
```

### 5. Setup Direktori Upload

Pastikan folder `uploads/avatars/` sudah ada:

```bash
mkdir -p uploads/avatars
```

## 🚀 Menjalankan Server

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

Server akan berjalan di `http://localhost:3000`

## 📚 API Endpoints

### Base URL

```
http://localhost:3000/api/users
```

### 1. Registrasi Pengguna

**POST** `/register`

**Request:**

- Content-Type: `multipart/form-data`

**Body:**

```
name: string (required)
email: string (required)
password: string (required)
avatar: file (optional) - Image file
```

**Response Success (201):**

```json
{
  "id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "avatarUrl": "/uploads/avatars/filename.jpg",
  "createdAt": "2025-07-30T10:00:00.000Z"
}
```

**Response Error (400):**

```json
{
  "message": "Email sudah terdaftar"
}
```

### 2. Login Pengguna

**POST** `/login`

**Request:**

- Content-Type: `application/json`

**Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response Success (200):**

```json
{
  "id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "avatarUrl": "/uploads/avatars/filename.jpg",
  "createdAt": "2025-07-30T10:00:00.000Z"
}
```

**Response Error (404):**

```json
{
  "message": "Email atau Password salah"
}
```

### 3. Get All Users

**GET** `/`

**Response Success (200):**

```json
[
  {
    "id": "user_id_1",
    "name": "John Doe",
    "email": "john@example.com",
    "avatarUrl": "/uploads/avatars/filename.jpg",
    "createdAt": "2025-07-30T10:00:00.000Z"
  },
  {
    "id": "user_id_2",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "avatarUrl": null,
    "createdAt": "2025-07-30T11:00:00.000Z"
  }
]
```

### 4. Get User by ID

**GET** `/:id`

**Response Success (200):**

```json
{
  "id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "avatarUrl": "/uploads/avatars/filename.jpg",
  "createdAt": "2025-07-30T10:00:00.000Z"
}
```

**Response Error (404):**

```json
{
  "message": "User tidak ditemukan"
}
```

### 5. Update User

**PUT** `/:id`

**Request:**

- Content-Type: `multipart/form-data`

**Body:**

```
name: string (optional)
email: string (optional)
password: string (optional)
avatar: file (optional) - Image file
```

**Response Success (200):**

```json
{
  "id": "user_id",
  "name": "John Doe Updated",
  "email": "john.updated@example.com",
  "avatarUrl": "/uploads/avatars/new_filename.jpg",
  "createdAt": "2025-07-30T10:00:00.000Z"
}
```

## 🔒 Keamanan

- Password di-hash menggunakan bcrypt dengan salt rounds 10
- Validasi input pada semua endpoint
- CORS enabled untuk cross-origin requests
- File upload dibatasi pada folder `uploads/avatars/`

## 📁 Struktur Project

```
user_management_api/
├── src/
│   ├── controller/
│   │   └── userController.ts     # Controller untuk user operations
│   ├── middleware/
│   │   └── upload.ts            # Middleware untuk file upload
│   ├── routes/
│   │   └── userRoutes.ts        # Route definitions
│   ├── services/
│   │   └── firebase.ts          # Firebase configuration
│   └── index.ts                 # Entry point
├── uploads/
│   └── avatars/                 # Upload directory untuk avatar
├── package.json
├── tsconfig.json
├── serviceAccountKey.json       # Firebase service account
└── README.md
```

## 🐛 Error Handling

API menggunakan HTTP status codes standar:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## 📝 Catatan Pengembangan

1. **Firebase Setup**: Pastikan Firestore rules memungkinkan read/write
2. **File Upload**: Avatar disimpan di folder `uploads/avatars/`
3. **CORS**: Diaktifkan untuk semua origin (sesuaikan untuk production)
4. **Environment**: Gunakan `.env` file untuk konfigurasi environment

## 🚀 Deployment

Untuk deployment ke production:

1. Set environment variables
2. Update CORS settings
3. Setup SSL certificate
4. Configure reverse proxy (nginx)

## 📞 Support

Jika mengalami masalah, periksa:

1. Firebase service account key sudah benar
2. Port 3000 tidak digunakan aplikasi lain
3. Firestore database sudah aktif
4. Dependencies sudah terinstall dengan benar
