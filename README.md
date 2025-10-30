# 🐼 Panda Market - Backend API

NestJS 기반 중고거래 마켓플레이스 백엔드 API

## 📖 개요

Panda Market의 RESTful API 서버입니다. JWT 인증, OAuth 2.0 소셜 로그인, 상품/게시글 관리, 댓글, 좋아요 등의 기능을 제공합니다.

## 🛠️ 기술 스택

- **Framework**: NestJS 10.x
- **Language**: TypeScript
- **Database**: PostgreSQL 12.x+
- **ORM**: Prisma 6.x
- **Authentication**: Passport.js (JWT, Google OAuth, Kakao OAuth)
- **Validation**: class-validator, class-transformer
- **Logging**: Winston
- **File Upload**: Multer

## 🚀 시작하기

### 필수 요구사항

- Node.js 18.x 이상
- PostgreSQL 12.x 이상
- npm 또는 yarn

### 설치

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 열어서 필요한 값 설정
```

### 데이터베이스 설정

```bash
# Prisma 마이그레이션 실행
npx prisma migrate dev

# Prisma Client 생성
npx prisma generate

# 시드 데이터 생성 (선택사항)
npm run seed

# 데이터베이스 초기화 (주의: 모든 데이터 삭제)
npx prisma migrate reset
```

### 실행

```bash
# 개발 모드 (Hot Reload)
npm run start:dev

# 디버그 모드
npm run start:debug

# 프로덕션 빌드
npm run build

# 프로덕션 실행
npm run start:prod
```

서버가 `http://localhost:3000`에서 실행됩니다.

## 📁 프로젝트 구조

```
backend/
├── src/
│   ├── auth/                 # 인증 모듈
│   │   ├── strategies/       # Passport 전략 (JWT, Google, Kakao)
│   │   ├── guards/           # 인증 가드
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── user/                 # 사용자 관리
│   │   ├── repository/       # Repository 패턴
│   │   ├── dto/              # Data Transfer Objects
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   └── user.module.ts
│   ├── product/              # 상품 관리
│   │   ├── dto/
│   │   ├── guards/           # 소유권 검증 가드
│   │   ├── product.controller.ts
│   │   ├── product.service.ts
│   │   └── product.module.ts
│   ├── article/              # 게시글 관리
│   ├── comment/              # 댓글 관리
│   ├── favorite/             # 좋아요 관리
│   ├── upload/               # 파일 업로드
│   ├── prisma/               # Prisma 서비스
│   ├── logger/               # Winston 로거
│   ├── interceptors/         # 전역 인터셉터
│   └── main.ts               # 애플리케이션 진입점
├── prisma/
│   ├── schema.prisma         # 데이터베이스 스키마
│   ├── migrations/           # 마이그레이션 파일
│   └── seed.ts               # 시드 데이터
├── test/                     # E2E 테스트
├── uploads/                  # 업로드된 파일 (gitignored)
├── logs/                     # 로그 파일 (gitignored)
└── http/                     # REST Client 테스트 파일
```

## 🔑 환경 변수

`.env` 파일 설정:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/pandamarket_dev?schema=public"

# JWT
JWT_SECRET="your-jwt-secret-key"

# Google OAuth (선택사항)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/auth/google/callback"

# Kakao OAuth (선택사항)
KAKAO_CLIENT_ID="your-kakao-rest-api-key"
KAKAO_CLIENT_SECRET="your-kakao-client-secret"
KAKAO_CALLBACK_URL="http://localhost:3000/auth/kakao/callback"

# Server
PORT=3000
NODE_ENV=development
DEBUG=true

# CORS
FRONTEND_URL="http://localhost:3001"
SERVER_URL="http://localhost:3000"
```

자세한 OAuth 설정은 [문서](../docs/) 참고하세요.

## 📡 API 엔드포인트

### 인증 (Auth)

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/auth/signup` | 이메일 회원가입 |
| POST | `/auth/signin` | 이메일 로그인 |
| POST | `/auth/refresh` | 토큰 갱신 |
| GET | `/auth/google` | Google OAuth 시작 |
| GET | `/auth/google/callback` | Google OAuth 콜백 |
| GET | `/auth/kakao` | Kakao OAuth 시작 |
| GET | `/auth/kakao/callback` | Kakao OAuth 콜백 |

### 사용자 (User)

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/users/me` | 내 정보 조회 |
| PATCH | `/users/me` | 내 정보 수정 |

### 상품 (Product)

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/products` | 상품 목록 조회 (페이지네이션, 정렬, 검색) |
| GET | `/products/:id` | 상품 상세 조회 |
| POST | `/products` | 상품 등록 (인증 필요) |
| PATCH | `/products/:id` | 상품 수정 (소유자만) |
| DELETE | `/products/:id` | 상품 삭제 (소유자만) |

### 게시글 (Article)

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/articles` | 게시글 목록 조회 |
| GET | `/articles/:id` | 게시글 상세 조회 |
| POST | `/articles` | 게시글 작성 (인증 필요) |
| PATCH | `/articles/:id` | 게시글 수정 (소유자만) |
| DELETE | `/articles/:id` | 게시글 삭제 (소유자만) |

### 댓글 (Comment)

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/comments?productId=:id` | 상품 댓글 조회 |
| GET | `/comments?articleId=:id` | 게시글 댓글 조회 |
| POST | `/comments` | 댓글 작성 (인증 필요) |
| PATCH | `/comments/:id` | 댓글 수정 (소유자만) |
| DELETE | `/comments/:id` | 댓글 삭제 (소유자만) |

### 좋아요 (Favorite)

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/favorites` | 좋아요 추가 (인증 필요) |
| DELETE | `/favorites/:id` | 좋아요 취소 (인증 필요) |

### 파일 업로드 (Upload)

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/upload` | 파일 업로드 (multipart/form-data) |

업로드된 파일은 `/uploads/:filename` 경로로 접근 가능합니다.

## 🧪 테스트

```bash
# 단위 테스트
npm test

# 특정 파일 테스트
npm test -- user.service.spec.ts

# Watch 모드
npm run test:watch

# 테스트 커버리지
npm run test:cov

# E2E 테스트
npm run test:e2e
```

## 🔒 인증 시스템

### JWT 인증
- **Access Token**: 1시간 유효, API 요청 시 사용
- **Refresh Token**: 7일 유효, Access Token 갱신용
- **저장**: User 테이블의 `refreshToken` 필드

### OAuth 2.0 소셜 로그인
- **지원**: Google, Kakao
- **자동 연동**: 동일 이메일 시 기존 계정에 자동 연동
- **프로필 동기화**: 로그인 시마다 최신 프로필로 업데이트

## 📊 데이터베이스 스키마

주요 모델:

```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  password     String?  // SNS 전용 계정은 null
  nickname     String?
  image        String?
  refreshToken String?
  socials      SocialAccount[]
  products     Product[]
  articles     Article[]
  // ...
}

model SocialAccount {
  id         String @id @default(uuid())
  userId     String
  provider   String  // 'google' | 'kakao'
  providerId String  @unique
  user       User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerId])
}

model Product {
  id          String   @id @default(uuid())
  name        String
  description String?
  price       Float
  images      String[]
  authorId    String?
  author      User?    @relation(fields: [authorId], references: [id])
  // ...
}
```

전체 스키마는 `prisma/schema.prisma` 참고.

## 🔧 코드 품질

```bash
# ESLint 검사 및 자동 수정
npm run lint

# Prettier 포맷팅
npm run format
```

## 📝 HTTP 테스트

REST Client 확장을 사용한 API 테스트 파일:
- `http/user.http`: 사용자 관련 API 테스트

## 🚢 배포

### 프로덕션 빌드

```bash
npm run build
npm run start:prod
```

### 환경 변수 설정
프로덕션 환경에서는 다음을 확인하세요:
- `NODE_ENV=production`
- 안전한 `JWT_SECRET` 설정
- 프로덕션 데이터베이스 URL
- CORS `FRONTEND_URL` 설정
- OAuth 콜백 URL을 프로덕션 도메인으로 변경

## 📚 추가 문서

- [Google OAuth 설정](../docs/GOOGLE_OAUTH_SETUP.md)
- [Kakao OAuth 설정](../docs/KAKAO_OAUTH_SETUP.md)

## 🤝 기여

이 프로젝트는 학습 목적으로 만들어졌습니다.

---

**Built with NestJS & Prisma**
