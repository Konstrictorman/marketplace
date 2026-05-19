/**
 * OpenAPI 3 document for Swagger UI (`docs.routes.ts`).
 * Paths omit the `/api` prefix — see `servers[0].url`.
 */
export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Marketplace API",
    version: "1.0.0",
    description:
      "Express REST API (`apps/api`). **Swagger UI:** open `GET /docs` under the API base (e.g. `http://localhost:3001/api/docs`). **Raw spec:** `GET /docs/openapi.json`. JSON errors use `ApiErrorEnvelope` (`error.code`, `error.message`, optional `error.details`). **operationId** is stable for generated clients. Covers health, **categories**, products & images (catalog rows do **not** store a rating column), **`GET /products/{id}/rating`** (average of `order_items.rating`), uploads, conversations, **messages**, orders & line items (**`PATCH /orders/{orderId}/items/{itemId}/rating`** to rate after purchase), **roles**, **users**, **user_roles**, and **`POST /auth/login`** (Bearer JWT for API clients such as Postman). **Browser sessions:** the Next.js app (`apps/web`) proxies login to this API and stores the JWT in HttpOnly cookie `mp_session`; logout is **`POST` or `GET` `/api/auth/logout` on the web origin** (not an Express route).",
  },
  servers: [
    {
      url: "/api",
      description:
        "API base relative to host (e.g. `http://localhost:3001` + `/api`).",
    },
  ],
  tags: [
    {
      name: "Documentation",
      description:
        "Machine-readable OpenAPI export (`openapi.json`). Interactive UI is served at `GET /docs` (HTML; not listed as a JSON path here).",
    },
    { name: "Health", description: "Liveness & database connectivity" },
    {
      name: "Authentication",
      description:
        "**API clients (Postman, curl):** `POST /auth/login` on this host (e.g. `http://localhost:3001/api/auth/login`) returns `data.token` (Bearer JWT) and `data.expiresIn`. Use header `Authorization: Bearer <token>`. Claims: `sub`/`userId`, `username`, `institutionalEmail`, `roles`, `role`. **`GET /auth/login`** → `405` + `Allow: POST`. **Browser (Next.js):** `POST /api/auth/login` on the web app (`:3000`) sets HttpOnly `mp_session` and returns `{ data: { ok: true } }` only — not suitable for copying a Bearer token.",
    },
    {
      name: "Products",
      description:
        "Product catalog CRUD & search. Each product’s `categoryId` must reference an existing category (see **Categories**). **Ratings:** buyers rate purchased lines on `order_items` (`PATCH` under **Orders**); the public score is computed — **`GET /products/{id}/rating`** — not stored on `products`. List/detail rows include `sellerUserName` (seller display name).",
    },
    {
      name: "Categories",
      description:
        "Product taxonomy (`categories` table: `name` unique to 100 chars, optional `description`, `is_active` default true, `created_at`). JSON uses camelCase (`isActive`, `createdAt`). List supports `isActive=true|false`, optional `q` on `name`, pagination. **Delete** returns `category_in_use` (`409`) while any product references the row (FK `ON DELETE RESTRICT`).",
    },
    {
      name: "Product images",
      description:
        "Gallery URLs per product (`sellerId` in body enforced until auth is wired)",
    },
    {
      name: "Uploads",
      description:
        "`POST /uploads` stores one image on disk (`UPLOAD_DIR`) and returns a public URL (`PUBLIC_UPLOAD_URL_BASE`). **`GET` / `HEAD` `/uploads/{filename}`** (under this spec’s `/api` server → `/api/uploads/...`) serves stored files; the app also mounts the same directory at host root `GET /uploads/{filename}` when not stripped by a proxy. Pair the upload URL with `POST /products/{productId}/images` to attach to a listing.",
    },
    {
      name: "Conversations",
      description:
        "Buyer/seller threads for a product (`userId`/`buyerId` in query/body until auth is wired)",
    },
    {
      name: "Messages",
      description:
        "Rows in `messages` for a conversation. **List:** optional `userId` query returns only messages with that `senderId`; the conversation must exist (participant check is not enforced on list). **Get one:** optional `userId` requires the message’s `senderId` to match or yields `404`. **Patch:** `isRead` and optional `userId` (when set, that user must be a participant). **Delete:** JSON body with `userId` — must equal the message `senderId` or `403`.",
    },
    {
      name: "Orders",
      description:
        "Orders and line items. **Line quantity** (`PATCH /orders/{orderId}/items/{itemId}`) applies only while the order is `pending`. **Product rating** (`PATCH /orders/{orderId}/items/{itemId}/rating`) sets `order_items.rating` (0–5) when the order is `confirmed` or `delivered`; averages feed **`GET /products/{id}/rating`**. **Interim identity:** optional `buyerId` on routes (query or JSON); when provided it must match the order buyer (`403`).",
    },
    {
      name: "Roles",
      description:
        "Role catalog (`roles` table). User assignments: `GET|POST /users/{userId}/roles`, `DELETE /users/{userId}/roles/{roleId}`.",
    },
    {
      name: "User roles",
      description: "Join rows in `user_roles` (which roles a user has).",
    },
    {
      name: "Users",
      description:
        "Institutional user accounts. Responses never include `password_hash`. `POST` / `PATCH` accept a plaintext `password`, which is stored with scrypt.",
    },
  ],
  paths: {
    "/health": {
      get: {
        operationId: "getHealthPing",
        tags: ["Health"],
        summary: "Plain-text health ping",
        responses: {
          "200": {
            description: "Plain text body (not JSON)",
            content: {
              "text/plain": {
                schema: { type: "string", example: "Hello Marketplace !" },
              },
            },
          },
        },
      },
    },
    "/health/db": {
      get: {
        operationId: "getHealthDb",
        tags: ["Health"],
        summary: "PostgreSQL readiness",
        responses: {
          "200": {
            description: "Database reachable",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["ok"],
                  properties: { ok: { type: "boolean", example: true } },
                },
              },
            },
          },
          "503": {
            description: "Database unreachable",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
    },
    "/docs/openapi.json": {
      get: {
        operationId: "getOpenApiDocument",
        tags: ["Documentation"],
        summary: "OpenAPI 3 document (JSON)",
        description:
          "Returns the same object Swagger UI loads. For tooling and codegen, not for production traffic shaping.",
        responses: {
          "200": {
            description: "OpenAPI 3.0.3 document",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  description:
                    "Full specification: `openapi`, `info`, `servers`, `tags`, `paths`, `components`.",
                  additionalProperties: true,
                },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      get: {
        operationId: "getAuthLoginMethodNotAllowed",
        tags: ["Authentication"],
        summary: "Login is POST only",
        description:
          "Express answers `GET` with `405` and `Allow: POST` so tools and browsers do not see `route_not_found`.",
        responses: {
          "405": {
            description: "Use `POST` with JSON `AuthLoginBody`",
            headers: {
              Allow: {
                description: "Allowed HTTP methods for this URL",
                schema: { type: "string", example: "POST" },
              },
            },
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
      post: {
        operationId: "login",
        tags: ["Authentication"],
        summary: "Login with institutional email and password",
        description:
          "Returns a **Bearer** JWT in `data.token` and lifetime hint in `data.expiresIn`. Claims: `sub` (user UUID), `userId`, `username` (display name), `institutionalEmail`, `roles` (array of role names), `role` (first role name, or empty string), plus `iat` / `exp`. Configure `JWT_SECRET` (≥32 chars) and optional `JWT_EXPIRES_IN` (default `7d`) on the server. **Next.js BFF:** the marketplace web app proxies this route; the browser receives `{ data: { ok: true } }` and an HttpOnly `mp_session` cookie. **Logout** for that flow is **`POST` or `GET` `/api/auth/logout`** on the web app (this Express API has no logout endpoint).",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthLoginBody" },
            },
          },
        },
        responses: {
          "200": {
            description: "JWT issued",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthLoginResponse" },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "401": {
            description: "`invalid_credentials`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "403": {
            description: "`user_inactive`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "503": {
            description:
              "`auth_misconfigured` (e.g. missing `JWT_SECRET` in production)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
    },
    "/uploads": {
      post: {
        operationId: "uploadProductImageFile",
        tags: ["Uploads"],
        summary: "Upload one image file to disk",
        description:
          "Multipart `multipart/form-data`: field **`file`** (image), field **`sellerId`** (UUID, must exist in `users`). Returns **`data.url`** suitable for `POST /products/{productId}/images` body. Files are stored under `UPLOAD_DIR` and served via **`GET /uploads/{filename}`** (see that path in this document; also at host root `/uploads/...` per deployment). Max size 5 MiB; JPEG, PNG, WebP, GIF only.",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["sellerId", "file"],
                properties: {
                  sellerId: {
                    type: "string",
                    format: "uuid",
                    description:
                      "Uploader user id (interim auth until JWT on this route).",
                  },
                  file: {
                    type: "string",
                    format: "binary",
                    description: "Image file",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description:
              "Stored file; use returned URL with product image APIs",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: {
                    data: {
                      type: "object",
                      required: ["url"],
                      properties: {
                        url: {
                          type: "string",
                          format: "uri",
                          example:
                            "http://localhost:3001/uploads/550e8400-e29b-41d4-a716-446655440000.jpg",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description:
              "Missing file, invalid `sellerId`, or multipart limits",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "`user_not_found`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "413": {
            description: "`file_too_large`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "415": {
            description: "`unsupported_media_type`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
    },
    "/uploads/{filename}": {
      parameters: [
        {
          name: "filename",
          in: "path",
          required: true,
          description:
            "Stored file basename (as returned in `data.url` from `POST /uploads`, without query string).",
          schema: {
            type: "string",
            example: "550e8400-e29b-41d4-a716-446655440000.jpg",
          },
        },
      ],
      get: {
        operationId: "getUploadedFile",
        tags: ["Uploads"],
        summary: "Serve a stored upload file",
        description:
          "Static file from `UPLOAD_DIR`. Under the API app, this path is registered for **`GET`** and **`HEAD`** only at `/api/uploads/...` so **`POST /uploads`** remains the multipart upload route.",
        responses: {
          "200": {
            description:
              "Binary body; `Content-Type` reflects the file (typically `image/jpeg`, `image/png`, `image/webp`, or `image/gif`).",
            content: {
              "image/jpeg": {
                schema: { type: "string", format: "binary" },
              },
              "image/png": {
                schema: { type: "string", format: "binary" },
              },
              "image/webp": {
                schema: { type: "string", format: "binary" },
              },
              "image/gif": {
                schema: { type: "string", format: "binary" },
              },
            },
          },
          "404": {
            description: "No file with that name under `UPLOAD_DIR`",
          },
        },
      },
      head: {
        operationId: "headUploadedFile",
        tags: ["Uploads"],
        summary: "Headers for a stored upload (no body)",
        description: "Same routing as `GET`; typical use is cache validation.",
        responses: {
          "200": {
            description: "Success; body empty",
          },
          "404": {
            description: "No file with that name under `UPLOAD_DIR`",
          },
        },
      },
    },
    "/products": {
      get: {
        operationId: "listProducts",
        tags: ["Products"],
        summary: "List products",
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "pageSize",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          },
          {
            name: "status",
            in: "query",
            schema: { $ref: "#/components/schemas/ProductStatus" },
          },
          {
            name: "categoryId",
            in: "query",
            schema: { type: "string", format: "uuid" },
          },
          {
            name: "sellerId",
            in: "query",
            schema: { type: "string", format: "uuid" },
          },
          {
            name: "condition",
            in: "query",
            schema: { $ref: "#/components/schemas/ProductCondition" },
          },
          {
            name: "minPrice",
            in: "query",
            description: "Max 2 decimal places",
            schema: { type: "string", example: "10.99" },
          },
          {
            name: "maxPrice",
            in: "query",
            description: "Max 2 decimal places; must be ≥ minPrice",
            schema: { type: "string", example: "99.99" },
          },
          {
            name: "q",
            in: "query",
            description: "Title / description substring (case-insensitive)",
            schema: { type: "string", maxLength: 200 },
          },
          {
            name: "sortBy",
            in: "query",
            schema: {
              type: "string",
              enum: ["createdAt", "price", "title"],
              default: "createdAt",
            },
          },
          {
            name: "sortOrder",
            in: "query",
            schema: { type: "string", enum: ["asc", "desc"], default: "desc" },
          },
        ],
        responses: {
          "200": {
            description:
              "Paged list. Each row includes `description`, `mainImageUrl`, and `sellerUserName`. Use **`GET /products/{id}/rating`** for the computed score (not embedded here).",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductListResponse" },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
      post: {
        operationId: "createProduct",
        tags: ["Products"],
        summary: "Create product",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductCreateBody" },
            },
          },
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductDetailResponse" },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "Seller or category not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
    },
    "/products/{id}/rating": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      get: {
        operationId: "getProductRating",
        tags: ["Products"],
        summary: "Get computed product rating",
        description:
          "Read-only aggregate: `AVG(order_items.rating)` where `rating IS NOT NULL` for this `productId`. Returns `rating: \"0.00\"` and `ratingCount: 0` when no rated purchases exist. Does not read a column on `products`.",
        responses: {
          "200": {
            description: "Computed average and count of rated line items",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ProductRatingResponse",
                },
              },
            },
          },
          "404": {
            description: "Product not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
    },
    "/products/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      get: {
        operationId: "getProduct",
        tags: ["Products"],
        summary: "Get product by id",
        description:
          "Full catalog row including `description` and `sellerUserName`. For the buyer-average score, call **`GET /products/{id}/rating`**.",
        responses: {
          "200": {
            description: "Product detail (rating not embedded; see `/products/{id}/rating`)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductDetailResponse" },
              },
            },
          },
          "400": {
            description: "Invalid id",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "Not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
      patch: {
        operationId: "updateProduct",
        tags: ["Products"],
        summary: "Update product",
        description:
          "Partial update; `sellerId` must match the product owner until auth is wired.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductPatchBody" },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductDetailResponse" },
              },
            },
          },
          "400": {
            description: "Validation failed or empty patch",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "403": {
            description: "sellerId mismatch",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "Product or category not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
      delete: {
        operationId: "softDeleteProduct",
        tags: ["Products"],
        summary: "Soft delete product",
        description:
          "Sets `status` to `removed`. `sellerId` must match owner. Idempotent.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductDeleteBody" },
            },
          },
        },
        responses: {
          "204": {
            description: "No body",
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "403": {
            description: "sellerId mismatch",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "Product not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
    },
    "/products/{productId}/images": {
      parameters: [
        {
          name: "productId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      get: {
        operationId: "listProductImages",
        tags: ["Product images"],
        summary: "List product images",
        description:
          "Returns images ordered by `sortOrder`, then `createdAt`, then `id`.",
        responses: {
          "200": {
            description: "Gallery list",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ProductImageListResponse",
                },
              },
            },
          },
          "404": {
            description: "Product not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
      post: {
        operationId: "createProductImage",
        tags: ["Product images"],
        summary: "Add product image",
        description:
          "`sellerId` must match owner. Cannot add to `removed` products. If `isMain` is true, other images for this product lose the main flag.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductImageCreateBody" },
            },
          },
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductImageResponse" },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "403": {
            description: "sellerId mismatch",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "Product not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "409": {
            description: "Product removed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
    },
    "/products/{productId}/images/{imageId}": {
      parameters: [
        {
          name: "productId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
        {
          name: "imageId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      get: {
        operationId: "getProductImage",
        tags: ["Product images"],
        summary: "Get one product image",
        description:
          "Returns the image if it belongs to `productId`. Wrong `imageId` for this product yields `image_not_found` when the product exists.",
        responses: {
          "200": {
            description: "Single image",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductImageResponse" },
              },
            },
          },
          "404": {
            description: "`product_not_found` or `image_not_found`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
      patch: {
        operationId: "updateProductImage",
        tags: ["Product images"],
        summary: "Update product image",
        description:
          "`sellerId` must match owner. Include at least one of `url`, `sortOrder`, `isMain`. Setting `isMain` to true clears main on other images for this product.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductImagePatchBody" },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductImageResponse" },
              },
            },
          },
          "400": {
            description: "Validation failed or empty patch",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "403": {
            description: "sellerId mismatch",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "`product_not_found` or `image_not_found`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "409": {
            description: "Product removed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
      delete: {
        operationId: "deleteProductImage",
        tags: ["Product images"],
        summary: "Delete product image",
        description:
          "Hard-delete the image row. `sellerId` must match owner. Same envelope as listing when product or image is missing.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductDeleteBody" },
            },
          },
        },
        responses: {
          "204": {
            description: "No body",
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "403": {
            description: "sellerId mismatch",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "`product_not_found` or `image_not_found`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "409": {
            description: "Product removed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
    },
    "/conversations": {
      get: {
        operationId: "listConversations",
        tags: ["Conversations"],
        summary: "List conversations for user",
        parameters: [
          {
            name: "userId",
            in: "query",
            required: false,
            schema: { type: "string", format: "uuid" },
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "pageSize",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          },
          {
            name: "productId",
            in: "query",
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "Paged list for the participant user",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ConversationListResponse",
                },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
      post: {
        operationId: "createConversation",
        tags: ["Conversations"],
        summary: "Create conversation",
        description:
          "Creates buyer/seller conversation for a product. If one already exists for that product + pair, returns it.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ConversationCreateBody" },
            },
          },
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ConversationResponse" },
              },
            },
          },
          "200": {
            description: "Existing conversation returned (idempotent create)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ConversationResponse" },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "Product or buyer not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "409": {
            description: "Invalid participants (buyer equals seller)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
    },
    "/conversations/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      get: {
        operationId: "getConversation",
        tags: ["Conversations"],
        summary: "Get conversation by id",
        parameters: [
          {
            name: "userId",
            in: "query",
            required: false,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "Conversation detail for participant",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ConversationResponse" },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "403": {
            description: "Not a participant",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "Conversation not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
      delete: {
        operationId: "deleteConversation",
        tags: ["Conversations"],
        summary: "Delete conversation",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ConversationDeleteBody" },
            },
          },
        },
        responses: {
          "204": {
            description: "No body",
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "403": {
            description: "Not a participant",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "Conversation not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
    },
    "/conversations/{conversationId}/participants": {
      parameters: [
        {
          name: "conversationId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      get: {
        operationId: "listConversationParticipants",
        tags: ["Conversations"],
        summary: "List participants in conversation",
        parameters: [
          {
            name: "userId",
            in: "query",
            required: false,
            description:
              "Optional caller identity for participant-only access until auth is wired. Omitted returns participants when the conversation exists.",
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "Conversation participants",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ConversationParticipantListResponse",
                },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "403": {
            description: "Not a participant",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "Conversation not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
      post: {
        operationId: "addConversationParticipant",
        tags: ["Conversations"],
        summary: "Add participant to conversation",
        description:
          "Actor must already be a conversation participant. `actorUserId` represents the caller identity while JWT/session auth is not wired. Returns existing participant when already present.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ConversationParticipantCreateBody",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Participant added",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ConversationParticipantResponse",
                },
              },
            },
          },
          "200": {
            description: "Existing participant returned (idempotent add)",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ConversationParticipantResponse",
                },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "403": {
            description: "Not a participant",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "Conversation or user not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
    },
    "/conversations/{conversationId}/participants/{participantId}": {
      parameters: [
        {
          name: "conversationId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
        {
          name: "participantId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      get: {
        operationId: "getConversationParticipant",
        tags: ["Conversations"],
        summary: "Get one conversation participant",
        parameters: [
          {
            name: "userId",
            in: "query",
            required: false,
            description:
              "Optional caller identity for participant-only access until auth is wired. Omitted returns the participant row if it exists for this conversation.",
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "Participant detail",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ConversationParticipantResponse",
                },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "403": {
            description: "Not a participant",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "Conversation or participant not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
      delete: {
        operationId: "deleteConversationParticipant",
        tags: ["Conversations"],
        summary: "Delete conversation participant",
        description:
          "`actorUserId` represents the caller identity while JWT/session auth is not wired.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ConversationParticipantDeleteBody",
              },
            },
          },
        },
        responses: {
          "204": {
            description: "No body",
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "403": {
            description: "Not a participant",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "Conversation or participant not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "409": {
            description: "Minimum participants required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
    },
    "/conversations/{conversationId}/messages": {
      parameters: [
        {
          name: "conversationId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      get: {
        operationId: "listMessages",
        tags: ["Messages"],
        summary: "List messages in a conversation",
        description:
          "Paged by `sentAt`. The conversation must exist; **participant membership is not verified** on this route (interim behavior).",
        parameters: [
          {
            name: "userId",
            in: "query",
            required: false,
            schema: { type: "string", format: "uuid" },
            description:
              "Optional filter: when set, only messages whose `senderId` equals this value are returned.",
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "pageSize",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 50 },
          },
          {
            name: "sortOrder",
            in: "query",
            schema: { type: "string", enum: ["asc", "desc"], default: "asc" },
            description: "Order by `sentAt`",
          },
        ],
        responses: {
          "200": {
            description: "Paged messages",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageListResponse" },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "Conversation not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
      post: {
        operationId: "createMessage",
        tags: ["Messages"],
        summary: "Send a message in a conversation",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/MessageCreateBody" },
            },
          },
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageResponse" },
              },
            },
          },
          "400": {
            description: "Validation failed or empty content",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "403": {
            description: "Sender not a participant",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "Conversation or sender not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
    },
    "/conversations/{conversationId}/messages/{messageId}": {
      parameters: [
        {
          name: "conversationId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
        {
          name: "messageId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      get: {
        operationId: "getMessage",
        tags: ["Messages"],
        summary: "Get one message",
        parameters: [
          {
            name: "userId",
            in: "query",
            required: false,
            schema: { type: "string", format: "uuid" },
            description:
              "Optional filter: when set, the message must have this `senderId` or the response is `404`.",
          },
        ],
        responses: {
          "200": {
            description: "Message row",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageResponse" },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description:
              "Conversation not found, message not in conversation, or `userId` filter does not match `senderId`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
      patch: {
        operationId: "patchMessage",
        tags: ["Messages"],
        summary: "Update message read state",
        description:
          "Sets `isRead`. When `userId` is provided, that user must be a conversation participant (interim auth). When omitted, only the conversation must exist.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/MessagePatchBody" },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated message",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageResponse" },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "403": {
            description: "Not a participant",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "Conversation or message not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
      delete: {
        operationId: "deleteMessage",
        tags: ["Messages"],
        summary: "Delete a message",
        description:
          "`userId` must equal the message `senderId`; only the sender may delete.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/MessageDeleteBody" },
            },
          },
        },
        responses: {
          "204": {
            description: "No body",
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "403": {
            description: "`userId` does not match message sender",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "Conversation or message not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
    },
    "/orders": {
      get: {
        operationId: "listOrders",
        tags: ["Orders"],
        summary: "List orders",
        description:
          "Paged order summaries (no embedded line items). Omit `buyerId` to list all buyers’ orders; include it to filter. Combine with optional `status`.",
        parameters: [
          {
            name: "buyerId",
            in: "query",
            required: false,
            description:
              "Filter by buyer. Omit for an unfiltered list (interim behavior until auth).",
            schema: { type: "string", format: "uuid" },
          },
          {
            name: "page",
            in: "query",
            description: "1-based page index",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "pageSize",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          },
          {
            name: "status",
            in: "query",
            description: "Filter by order lifecycle status",
            schema: { $ref: "#/components/schemas/OrderStatus" },
          },
        ],
        responses: {
          "200": {
            description: "Paged order summaries (no embedded items)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OrderListResponse" },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
      post: {
        operationId: "createOrder",
        tags: ["Orders"],
        summary: "Create order with line items",
        description:
          "Creates a pending order, snapshots line pricing, decrements product inventory atomically. Duplicate `productId` entries in `items` are combined into a single line (quantities summed).",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/OrderCreateBody" },
            },
          },
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OrderDetailResponse" },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "`buyer_not_found` or `product_not_found`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "409": {
            description:
              "`insufficient_inventory`, `product_removed`, or `product_not_available`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
    },
    "/orders/{orderId}": {
      parameters: [
        {
          name: "orderId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      get: {
        operationId: "getOrder",
        tags: ["Orders"],
        summary: "Get order with items",
        description:
          "Returns full order including line items. Optional query `buyerId`: if sent, it must equal the order’s buyer or the API returns `403`. If omitted, any caller may read the order by id (interim until auth).",
        parameters: [
          {
            name: "buyerId",
            in: "query",
            required: false,
            description:
              "When provided, must match `data.buyerId` on the order (`403 forbidden` otherwise).",
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "Order detail including line items",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OrderDetailResponse" },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "403": {
            description:
              "`forbidden` when `buyerId` is provided but does not match the order buyer",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "`order_not_found`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
      patch: {
        operationId: "patchOrder",
        tags: ["Orders"],
        summary: "Patch order (status)",
        description:
          "Updates order status. **`status` is required** in the JSON body. **`buyerId` is optional**; when present it must match the order buyer (`403` otherwise). Typical buyer action: set `status` to `cancelled` while the order is `pending` (restores inventory). Sending `cancelled` when already `cancelled` is idempotent. Sending the same non-cancel status as the current status is a no-op (`200`). Other transitions return `409 invalid_order_transition`.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/OrderPatchBody" },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated order with items",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OrderDetailResponse" },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "403": {
            description:
              "`forbidden` when `buyerId` is provided but does not match the order buyer",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "`order_not_found`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "409": {
            description:
              "`invalid_order_transition`, `cancelled_only_from_pending`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
      delete: {
        operationId: "deleteOrder",
        tags: ["Orders"],
        summary: "Delete pending order",
        description:
          "Hard-deletes the order while pending after restoring inventory. Optional JSON body with `buyerId`; when provided, must match the order buyer. Body may be omitted.",
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/OrderDeleteBody" },
            },
          },
        },
        responses: {
          "204": { description: "No body" },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "403": {
            description:
              "`forbidden` when `buyerId` is provided but does not match the order buyer",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "`order_not_found`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "409": {
            description: "`order_not_pending`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
    },
    "/orders/{orderId}/items": {
      parameters: [
        {
          name: "orderId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      get: {
        operationId: "listOrderItems",
        tags: ["Orders"],
        summary: "List order line items",
        description:
          "Optional query `buyerId`: when provided, must equal the order’s buyer (`403` otherwise). Omit for interim unauthenticated access.",
        parameters: [
          {
            name: "buyerId",
            in: "query",
            required: false,
            description: "When provided, must match the order buyer user id.",
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "Line items only",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OrderItemListResponse" },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "403": {
            description:
              "`forbidden` when query parameter `buyerId` is provided but does not match the order buyer",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "`order_not_found`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
      post: {
        operationId: "addOrderItem",
        tags: ["Orders"],
        summary: "Add line item",
        description:
          "Pending orders only; returns full order with items. Optional body `buyerId`; when set must match the order buyer. If the order already has a line for `productId`, quantities are merged on that line (same `unitPrice` snapshot as the existing row).",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/OrderItemCreateBody" },
            },
          },
        },
        responses: {
          "201": {
            description: "Updated order detail",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OrderDetailResponse" },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "403": {
            description:
              "`forbidden` when JSON body property `buyerId` is provided but does not match the order buyer",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "`order_not_found` or `product_not_found`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "409": {
            description:
              "`order_not_pending`, `insufficient_inventory`, `product_removed`, or `product_not_available`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
    },
    "/orders/{orderId}/items/{itemId}/rating": {
      parameters: [
        {
          name: "orderId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
        {
          name: "itemId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      patch: {
        operationId: "patchOrderItemRating",
        tags: ["Orders"],
        summary: "Rate a purchased line item",
        description:
          "Sets or updates the buyer’s product rating (0–5) on an order line. Allowed when the parent order is `confirmed` or `delivered`. Optional body `buyerId`; when set must match the order buyer. Feeds the computed product rating (`GET /products/{id}/rating`).",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/OrderItemRatingPatchBody",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated line item with rating",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OrderItemResponse" },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "403": {
            description:
              "`forbidden` when JSON body property `buyerId` is provided but does not match the order buyer",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "`order_not_found` or `order_item_not_found`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "409": {
            description:
              "`order_not_rateable` when the order is `pending` or `cancelled`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
    },
    "/orders/{orderId}/items/{itemId}": {
      parameters: [
        {
          name: "orderId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
        {
          name: "itemId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      get: {
        operationId: "getOrderItem",
        tags: ["Orders"],
        summary: "Get one line item",
        description:
          "Optional query `buyerId`: when provided, must equal the order’s buyer (`403` otherwise). Omit for interim unauthenticated access.",
        parameters: [
          {
            name: "buyerId",
            in: "query",
            required: false,
            description: "When provided, must match the order buyer user id.",
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "Line item row",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OrderItemResponse" },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "403": {
            description:
              "`forbidden` when query parameter `buyerId` is provided but does not match the order buyer",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "`order_not_found` or `order_item_not_found`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
      patch: {
        operationId: "patchOrderItem",
        tags: ["Orders"],
        summary: "Patch line quantity",
        description:
          "Pending orders only; updates `quantity` and recomputes `subtotal` / order total. `unitPrice` snapshot is unchanged. **Not for product ratings** — use **`PATCH .../items/{itemId}/rating`**. Optional body `buyerId`; when set must match the order buyer.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/OrderItemPatchBody" },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated order detail",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OrderDetailResponse" },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "403": {
            description:
              "`forbidden` when JSON body property `buyerId` is provided but does not match the order buyer",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "`order_not_found` or `order_item_not_found`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "409": {
            description: "`order_not_pending` or `insufficient_inventory`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
      delete: {
        operationId: "deleteOrderItem",
        tags: ["Orders"],
        summary: "Delete line item",
        description:
          "Restores quantity to inventory; pending only. Optional body `buyerId`; when set must match the order buyer. Body may be omitted.",
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/OrderItemDeleteBody" },
            },
          },
        },
        responses: {
          "204": { description: "No body" },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "403": {
            description:
              "`forbidden` when JSON body property `buyerId` is provided but does not match the order buyer",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "`order_not_found` or `order_item_not_found`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "409": {
            description: "`order_not_pending`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
    },
    "/categories": {
      get: {
        operationId: "listCategories",
        tags: ["Categories"],
        summary: "List categories",
        description:
          "Ordered by `name` ascending. Filter active rows with `isActive=true` (typical for storefront pickers).",
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "pageSize",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          },
          {
            name: "q",
            in: "query",
            description: "Case-insensitive substring match on `name`",
            schema: { type: "string", minLength: 1, maxLength: 100 },
          },
          {
            name: "isActive",
            in: "query",
            description: "Filter by `isActive` (`true` or `false`)",
            schema: { type: "string", enum: ["true", "false"] },
          },
        ],
        responses: {
          "200": {
            description: "Paged list ordered by name",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CategoryListResponse",
                },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
      post: {
        operationId: "createCategory",
        tags: ["Categories"],
        summary: "Create category",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CategoryCreateBody" },
            },
          },
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CategoryDetailResponse" },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "409": {
            description: "`category_name_conflict`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
    },
    "/categories/{categoryId}": {
      parameters: [
        {
          name: "categoryId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      get: {
        operationId: "getCategory",
        tags: ["Categories"],
        summary: "Get category by id",
        responses: {
          "200": {
            description: "Category",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CategoryDetailResponse" },
              },
            },
          },
          "400": {
            description: "Invalid `categoryId`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "`category_not_found`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
      patch: {
        operationId: "patchCategory",
        tags: ["Categories"],
        summary: "Update category",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CategoryPatchBody" },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated category",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CategoryDetailResponse" },
              },
            },
          },
          "400": {
            description: "Validation failed (body or invalid `categoryId`)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "`category_not_found`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "409": {
            description: "`category_name_conflict`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
      delete: {
        operationId: "deleteCategory",
        tags: ["Categories"],
        summary: "Delete category",
        description:
          "Fails with `category_in_use` when products still reference this category (FK `ON DELETE RESTRICT`).",
        responses: {
          "204": { description: "No body" },
          "400": {
            description: "Invalid `categoryId`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "`category_not_found`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "409": {
            description: "`category_in_use`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
    },
    "/roles": {
      get: {
        operationId: "listRoles",
        tags: ["Roles"],
        summary: "List roles",
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "pageSize",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          },
          {
            name: "q",
            in: "query",
            description: "Case-insensitive substring match on `name`",
            schema: { type: "string", minLength: 1, maxLength: 100 },
          },
        ],
        responses: {
          "200": {
            description: "Paged list ordered by name",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RoleListResponse" },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
      post: {
        operationId: "createRole",
        tags: ["Roles"],
        summary: "Create role",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RoleCreateBody" },
            },
          },
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RoleDetailResponse" },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "409": {
            description: "`role_name_conflict`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
    },
    "/roles/{roleId}": {
      parameters: [
        {
          name: "roleId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      get: {
        operationId: "getRole",
        tags: ["Roles"],
        summary: "Get role by id",
        responses: {
          "200": {
            description: "Role",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RoleDetailResponse" },
              },
            },
          },
          "400": {
            description: "Invalid id",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "`role_not_found`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
      patch: {
        operationId: "updateRole",
        tags: ["Roles"],
        summary: "Update role",
        description: "Partial update; at least one of `name`, `description`.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RolePatchBody" },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated role",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RoleDetailResponse" },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "`role_not_found`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "409": {
            description: "`role_name_conflict`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
      delete: {
        operationId: "deleteRole",
        tags: ["Roles"],
        summary: "Delete role",
        description:
          "Removes the role and cascades `user_roles` rows for this role.",
        responses: {
          "204": { description: "No body" },
          "400": {
            description: "Invalid id",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "`role_not_found`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
    },
    "/users": {
      get: {
        operationId: "listUsers",
        tags: ["Users"],
        summary: "List users",
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "pageSize",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          },
          {
            name: "q",
            in: "query",
            description:
              "Case-insensitive match on `institutionalEmail` or `name`",
            schema: { type: "string", minLength: 1, maxLength: 200 },
          },
          {
            name: "isActive",
            in: "query",
            description:
              "When set, only `true` or `false` (string). Omit to return users regardless of active flag.",
            schema: { type: "string", enum: ["true", "false"] },
          },
          {
            name: "sortBy",
            in: "query",
            schema: {
              type: "string",
              enum: ["createdAt", "name", "institutionalEmail"],
              default: "createdAt",
            },
          },
          {
            name: "sortOrder",
            in: "query",
            schema: { type: "string", enum: ["asc", "desc"], default: "desc" },
          },
        ],
        responses: {
          "200": {
            description: "Paged list",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserListResponse" },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
      post: {
        operationId: "createUser",
        tags: ["Users"],
        summary: "Create user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserCreateBody" },
            },
          },
        },
        responses: {
          "201": {
            description: "Created (password never returned)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserDetailResponse" },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "409": {
            description: "`user_email_conflict`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
    },
    "/users/{userId}": {
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      get: {
        operationId: "getUser",
        tags: ["Users"],
        summary: "Get user by id",
        responses: {
          "200": {
            description: "User (no password)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserDetailResponse" },
              },
            },
          },
          "400": {
            description: "Invalid id",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "`user_not_found`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
      patch: {
        operationId: "updateUser",
        tags: ["Users"],
        summary: "Update user",
        description:
          "Partial update. `password` replaces the stored hash (scrypt). `reputation` is a decimal string 0–9.99 (DB `Decimal(3,2)`).",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserPatchBody" },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated user",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserDetailResponse" },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "`user_not_found`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "409": {
            description: "`user_email_conflict`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
      delete: {
        operationId: "deleteUser",
        tags: ["Users"],
        summary: "Delete user",
        description:
          "Hard delete. Fails with `user_in_use` when foreign keys still reference this user (e.g. products, orders).",
        responses: {
          "204": { description: "No body" },
          "400": {
            description: "Invalid id",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "`user_not_found`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "409": {
            description: "`user_in_use`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
    },
    "/users/{userId}/roles": {
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      get: {
        operationId: "listUserRoles",
        tags: ["User roles"],
        summary: "List roles assigned to a user",
        responses: {
          "200": {
            description: "Each row includes nested `role`",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UserRoleListResponse",
                },
              },
            },
          },
          "400": {
            description: "Invalid `userId`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "`user_not_found`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
      post: {
        operationId: "assignUserRole",
        tags: ["User roles"],
        summary: "Assign a role to a user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserRoleAssignBody" },
            },
          },
        },
        responses: {
          "201": {
            description: "Assignment created",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UserRoleDetailResponse",
                },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "`user_not_found` or `role_not_found`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "409": {
            description: "`user_role_exists`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
    },
    "/users/{userId}/roles/{roleId}": {
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
        {
          name: "roleId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      delete: {
        operationId: "removeUserRole",
        tags: ["User roles"],
        summary: "Remove a role from a user",
        responses: {
          "204": { description: "No body" },
          "400": {
            description: "Invalid path ids",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
          "404": {
            description: "`user_not_found` or `user_role_not_found`",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      ApiErrorEnvelope: {
        type: "object",
        description:
          "Standard JSON error envelope. `error.code` is stable for clients; see `properties.error.properties.code.description` for common values.",
        required: ["error"],
        properties: {
          error: {
            type: "object",
            required: ["code", "message"],
            properties: {
              code: {
                type: "string",
                description:
                  "Stable machine code. Examples: `validation_failed`, `not_found`, `route_not_found`, `method_not_allowed`, `forbidden`, `invalid_credentials`, `user_inactive`, `auth_misconfigured`, `buyer_not_found`, `seller_not_found`, `category_not_found`, `product_not_found`, `product_removed`, `product_not_available`, `image_not_found`, `order_not_found`, `order_item_not_found`, `order_not_pending`, `order_not_rateable`, `insufficient_inventory`, `invalid_order_transition`, `cancelled_only_from_pending`, `conversation_not_found`, `participant_not_found`, `invalid_participants`, `min_participants_required`, `role_not_found`, `role_name_conflict`, `user_not_found`, `user_email_conflict`, `user_in_use`, `user_role_exists`, `user_role_not_found`, `database_unreachable`, … Prisma: `P2002`, `P2003`, `P2015`, `P2025` when surfaced. `database_unavailable`, `internal_error`.",
                example: "validation_failed",
              },
              message: {
                type: "string",
                description: "Human-readable summary for logs and debugging.",
              },
              details: {
                description:
                  "Optional structured validation issues (e.g. Zod `issues`); shape varies by endpoint.",
              },
            },
          },
        },
      },
      PaginationMeta: {
        type: "object",
        required: ["page", "pageSize", "total", "totalPages"],
        properties: {
          page: { type: "integer" },
          pageSize: { type: "integer" },
          total: { type: "integer" },
          totalPages: { type: "integer" },
        },
      },
      AuthLoginBody: {
        type: "object",
        required: ["institutionalEmail", "password"],
        properties: {
          institutionalEmail: { type: "string", format: "email" },
          password: { type: "string", minLength: 1, maxLength: 200 },
        },
      },
      AuthLoginResponse: {
        type: "object",
        required: ["data"],
        properties: {
          data: {
            type: "object",
            required: ["token", "tokenType", "expiresIn"],
            properties: {
              token: {
                type: "string",
                description:
                  "HS256 JWT. Payload includes `sub`, `userId`, `username`, `institutionalEmail`, `roles`, `role`, `iat`, `exp`.",
              },
              tokenType: {
                type: "string",
                enum: ["Bearer"],
              },
              expiresIn: {
                type: "string",
                description:
                  "Lifetime hint (e.g. `7d`); matches server `JWT_EXPIRES_IN`.",
                example: "7d",
              },
            },
          },
        },
      },
      Category: {
        type: "object",
        required: ["id", "name", "description", "isActive", "createdAt"],
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", maxLength: 100 },
          description: { type: "string", nullable: true },
          isActive: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      CategoryListResponse: {
        type: "object",
        required: ["data", "meta"],
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Category" },
          },
          meta: { $ref: "#/components/schemas/PaginationMeta" },
        },
      },
      CategoryDetailResponse: {
        type: "object",
        required: ["data"],
        properties: {
          data: { $ref: "#/components/schemas/Category" },
        },
      },
      CategoryCreateBody: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", minLength: 1, maxLength: 100 },
          description: { type: "string", nullable: true, maxLength: 20000 },
          isActive: { type: "boolean" },
        },
      },
      CategoryPatchBody: {
        type: "object",
        description:
          "Partial update; at least one of `name`, `description`, `isActive` (matches route `refine`).",
        minProperties: 1,
        properties: {
          name: { type: "string", minLength: 1, maxLength: 100 },
          description: { type: "string", nullable: true, maxLength: 20000 },
          isActive: { type: "boolean" },
        },
      },
      Role: {
        type: "object",
        required: ["id", "name", "description", "createdAt"],
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", maxLength: 50 },
          description: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      RoleListResponse: {
        type: "object",
        required: ["data", "meta"],
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Role" },
          },
          meta: { $ref: "#/components/schemas/PaginationMeta" },
        },
      },
      RoleDetailResponse: {
        type: "object",
        required: ["data"],
        properties: {
          data: { $ref: "#/components/schemas/Role" },
        },
      },
      RoleCreateBody: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", minLength: 1, maxLength: 50 },
          description: {
            type: "string",
            nullable: true,
            maxLength: 5000,
          },
        },
      },
      RolePatchBody: {
        type: "object",
        description: "At least one property required.",
        properties: {
          name: { type: "string", minLength: 1, maxLength: 50 },
          description: { type: "string", nullable: true, maxLength: 5000 },
        },
      },
      User: {
        type: "object",
        required: [
          "id",
          "institutionalEmail",
          "name",
          "career",
          "photoUrl",
          "reputation",
          "isActive",
          "createdAt",
          "updatedAt",
        ],
        properties: {
          id: { type: "string", format: "uuid" },
          institutionalEmail: { type: "string", format: "email" },
          name: { type: "string", maxLength: 150 },
          career: { type: "string", nullable: true, maxLength: 150 },
          photoUrl: { type: "string", nullable: true },
          reputation: {
            type: "string",
            description: "Decimal string from `Decimal(3,2)`",
            example: "0",
          },
          isActive: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      UserListResponse: {
        type: "object",
        required: ["data", "meta"],
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/User" },
          },
          meta: { $ref: "#/components/schemas/PaginationMeta" },
        },
      },
      UserDetailResponse: {
        type: "object",
        required: ["data"],
        properties: {
          data: { $ref: "#/components/schemas/User" },
        },
      },
      UserCreateBody: {
        type: "object",
        required: ["institutionalEmail", "password", "name"],
        properties: {
          institutionalEmail: { type: "string", format: "email" },
          password: { type: "string", minLength: 8, maxLength: 200 },
          name: { type: "string", minLength: 1, maxLength: 150 },
          career: {
            type: "string",
            nullable: true,
            maxLength: 150,
            description: "Optional; omit or null.",
          },
          photoUrl: {
            type: "string",
            nullable: true,
            format: "uri",
            maxLength: 2000,
            description: "Optional profile image URL; omit or null.",
          },
        },
      },
      UserPatchBody: {
        type: "object",
        description: "At least one property required.",
        properties: {
          institutionalEmail: { type: "string", format: "email" },
          password: { type: "string", minLength: 8, maxLength: 200 },
          name: { type: "string", minLength: 1, maxLength: 150 },
          career: { type: "string", nullable: true, maxLength: 150 },
          photoUrl: { type: "string", nullable: true, format: "uri" },
          reputation: {
            type: "string",
            pattern: "^(?:[0-9](?:\\.[0-9]{1,2})?)$",
            description: "0 through 9.99",
          },
          isActive: { type: "boolean" },
        },
      },
      UserRoleAssignment: {
        type: "object",
        required: ["userId", "roleId", "createdAt", "role"],
        properties: {
          userId: { type: "string", format: "uuid" },
          roleId: { type: "string", format: "uuid" },
          createdAt: { type: "string", format: "date-time" },
          role: { $ref: "#/components/schemas/Role" },
        },
      },
      UserRoleListResponse: {
        type: "object",
        required: ["data"],
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/UserRoleAssignment" },
          },
        },
      },
      UserRoleDetailResponse: {
        type: "object",
        required: ["data"],
        properties: {
          data: { $ref: "#/components/schemas/UserRoleAssignment" },
        },
      },
      UserRoleAssignBody: {
        type: "object",
        required: ["roleId"],
        properties: {
          roleId: { type: "string", format: "uuid" },
        },
      },
      OrderStatus: {
        type: "string",
        enum: ["pending", "confirmed", "delivered", "cancelled"],
      },
      OrderItem: {
        type: "object",
        description:
          "One catalog line on an order. The database enforces at most one row per (`orderId`,`productId`); adding the same product again merges quantity on that row (see `POST /orders/{orderId}/items`). `rating` is stored on `order_items` (nullable until `PATCH .../rating`).",
        required: [
          "id",
          "orderId",
          "productId",
          "sellerId",
          "quantity",
          "unitPrice",
          "subtotal",
          "rating",
          "createdAt",
        ],
        properties: {
          id: { type: "string", format: "uuid" },
          orderId: { type: "string", format: "uuid" },
          productId: { type: "string", format: "uuid" },
          sellerId: { type: "string", format: "uuid" },
          quantity: { type: "integer", minimum: 1 },
          unitPrice: { type: "string", description: "Decimal string snapshot" },
          subtotal: { type: "string", description: "Decimal string" },
          rating: {
            type: "string",
            nullable: true,
            description:
              "Buyer product rating 0–5; `null` until set via `PATCH .../rating`.",
          },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      OrderItemRatingPatchBody: {
        type: "object",
        description:
          "`rating` is required (0–5, up to 2 decimals). Optional `buyerId`; when provided it must match the parent order’s buyer. Order must be `confirmed` or `delivered`.",
        required: ["rating"],
        properties: {
          buyerId: { type: "string", format: "uuid" },
          rating: {
            type: "number",
            minimum: 0,
            maximum: 5,
            description: "Product rating after purchase, e.g. 4.5",
          },
        },
      },
      OrderSummary: {
        type: "object",
        description:
          "List row. `totalAmount` is the JSON field for the order total (decimal string); it maps from the persisted order total in the database.",
        required: [
          "id",
          "buyerId",
          "status",
          "totalAmount",
          "createdAt",
          "updatedAt",
        ],
        properties: {
          id: { type: "string", format: "uuid" },
          buyerId: { type: "string", format: "uuid" },
          status: { $ref: "#/components/schemas/OrderStatus" },
          totalAmount: {
            type: "string",
            example: "99.98",
            description:
              "Total for the order (sum of line subtotals at persist time).",
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      OrderDetail: {
        allOf: [
          { $ref: "#/components/schemas/OrderSummary" },
          {
            type: "object",
            required: ["items"],
            properties: {
              items: {
                type: "array",
                items: { $ref: "#/components/schemas/OrderItem" },
              },
            },
          },
        ],
      },
      OrderListResponse: {
        type: "object",
        required: ["data", "meta"],
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/OrderSummary" },
          },
          meta: { $ref: "#/components/schemas/PaginationMeta" },
        },
      },
      OrderDetailResponse: {
        type: "object",
        required: ["data"],
        properties: {
          data: { $ref: "#/components/schemas/OrderDetail" },
        },
      },
      OrderCreateBody: {
        type: "object",
        description:
          "`buyerId` must exist in `users`. Line items reference active catalog products with sufficient inventory.",
        required: ["buyerId", "items"],
        properties: {
          buyerId: { type: "string", format: "uuid" },
          items: {
            type: "array",
            description:
              "Non-empty. Duplicate `productId` values are merged into one line each (quantities summed, single price snapshot per product).",
            minItems: 1,
            items: {
              type: "object",
              required: ["productId", "quantity"],
              properties: {
                productId: { type: "string", format: "uuid" },
                quantity: { type: "integer", minimum: 1 },
              },
            },
          },
        },
      },
      OrderPatchBody: {
        type: "object",
        description:
          "`status` is required. `buyerId` is optional; when provided it must match the order’s buyer (`403` otherwise).",
        required: ["status"],
        properties: {
          buyerId: { type: "string", format: "uuid" },
          status: { $ref: "#/components/schemas/OrderStatus" },
        },
      },
      OrderDeleteBody: {
        type: "object",
        description:
          "Optional body. `buyerId` may be omitted (interim). When provided it must match the order buyer. Clients may send `{}` or omit the body entirely.",
        properties: {
          buyerId: { type: "string", format: "uuid" },
        },
      },
      OrderItemListResponse: {
        type: "object",
        required: ["data"],
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/OrderItem" },
          },
        },
      },
      OrderItemResponse: {
        type: "object",
        required: ["data"],
        properties: {
          data: { $ref: "#/components/schemas/OrderItem" },
        },
      },
      OrderItemCreateBody: {
        type: "object",
        description:
          "`productId` and `quantity` are required. Optional `buyerId`; when provided it must match the parent order’s buyer. Order must be `pending`. If a line for `productId` already exists, quantity is increased and `unitPrice` stays the snapshot from the first line.",
        required: ["productId", "quantity"],
        properties: {
          buyerId: { type: "string", format: "uuid" },
          productId: { type: "string", format: "uuid" },
          quantity: { type: "integer", minimum: 1 },
        },
      },
      OrderItemPatchBody: {
        type: "object",
        description:
          "`quantity` is required (≥ 1); parent order must be `pending`. Optional `buyerId`. To rate a purchased product use **`OrderItemRatingPatchBody`** on `PATCH .../items/{itemId}/rating`.",
        required: ["quantity"],
        properties: {
          buyerId: { type: "string", format: "uuid" },
          quantity: { type: "integer", minimum: 1 },
        },
      },
      OrderItemDeleteBody: {
        type: "object",
        description:
          "Optional. `buyerId` may be omitted (interim). When provided it must match the parent order’s buyer.",
        properties: {
          buyerId: { type: "string", format: "uuid" },
        },
      },
      ProductCondition: {
        type: "string",
        enum: ["new", "used"],
      },
      ProductStatus: {
        type: "string",
        enum: ["active", "inactive", "removed"],
      },
      ProductSummary: {
        type: "object",
        description:
          "Product list row returned by `GET /products`. `mainImageUrl` is the primary gallery image (`isMain` preferred, else first by `sortOrder`). Average rating: **`GET /products/{id}/rating`**.",
        required: [
          "id",
          "sellerId",
          "categoryId",
          "title",
          "description",
          "price",
          "condition",
          "inventory",
          "status",
          "createdAt",
          "updatedAt",
          "mainImageUrl",
          "sellerUserName",
        ],
        properties: {
          id: { type: "string", format: "uuid" },
          sellerId: { type: "string", format: "uuid" },
          categoryId: { type: "string", format: "uuid" },
          title: { type: "string" },
          description: { type: "string" },
          price: {
            type: "string",
            description: 'Decimal string, e.g. "12.99"',
          },
          condition: { $ref: "#/components/schemas/ProductCondition" },
          inventory: { type: "integer" },
          status: { $ref: "#/components/schemas/ProductStatus" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          mainImageUrl: {
            type: "string",
            format: "uri",
            nullable: true,
            description:
              "Public image URL when the product has images; otherwise `null`.",
          },
          sellerUserName: {
            type: "string",
            description: "Seller display name (`users.name`).",
          },
        },
      },
      ProductDetail: {
        type: "object",
        description:
          "Full product (`GET /products/{id}`). Average rating is not embedded; use **`GET /products/{id}/rating`**.",
        required: [
          "id",
          "sellerId",
          "categoryId",
          "title",
          "description",
          "price",
          "condition",
          "inventory",
          "status",
          "createdAt",
          "updatedAt",
          "mainImageUrl",
          "sellerUserName",
        ],
        properties: {
          id: { type: "string", format: "uuid" },
          sellerId: { type: "string", format: "uuid" },
          categoryId: { type: "string", format: "uuid" },
          title: { type: "string" },
          description: { type: "string" },
          price: { type: "string" },
          condition: { $ref: "#/components/schemas/ProductCondition" },
          inventory: { type: "integer" },
          status: { $ref: "#/components/schemas/ProductStatus" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          mainImageUrl: {
            type: "string",
            format: "uri",
            nullable: true,
            description:
              "Primary list image (`isMain` preferred, else first by `sortOrder`).",
          },
          sellerUserName: {
            type: "string",
            description: "Seller display name (`users.name`).",
          },
        },
      },
      ProductRating: {
        type: "object",
        required: ["productId", "rating", "ratingCount"],
        properties: {
          productId: { type: "string", format: "uuid" },
          rating: {
            type: "string",
            description:
              "Average of rated order items (0–5), e.g. \"4.25\". \"0.00\" when none.",
          },
          ratingCount: {
            type: "integer",
            description: "Number of order items with a non-null rating",
          },
        },
      },
      ProductRatingResponse: {
        type: "object",
        required: ["data"],
        properties: {
          data: { $ref: "#/components/schemas/ProductRating" },
        },
      },
      ProductListResponse: {
        type: "object",
        required: ["data", "meta"],
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/ProductSummary" },
          },
          meta: { $ref: "#/components/schemas/PaginationMeta" },
        },
      },
      ProductDetailResponse: {
        type: "object",
        required: ["data"],
        properties: {
          data: { $ref: "#/components/schemas/ProductDetail" },
        },
      },
      ProductCreateBody: {
        type: "object",
        required: [
          "sellerId",
          "categoryId",
          "title",
          "description",
          "price",
          "condition",
          "inventory",
        ],
        properties: {
          sellerId: { type: "string", format: "uuid" },
          categoryId: { type: "string", format: "uuid" },
          title: { type: "string", minLength: 3, maxLength: 120 },
          description: { type: "string", minLength: 10, maxLength: 5000 },
          price: {
            type: "string",
            pattern: "^\\d+(\\.\\d{1,2})?$",
            example: "19.99",
          },
          condition: { $ref: "#/components/schemas/ProductCondition" },
          inventory: { type: "integer", minimum: 0 },
          status: {
            type: "string",
            enum: ["active", "inactive", "removed"],
            default: "active",
          },
        },
      },
      ProductPatchBody: {
        type: "object",
        required: ["sellerId"],
        description: "Include at least one field besides sellerId.",
        properties: {
          sellerId: { type: "string", format: "uuid" },
          categoryId: { type: "string", format: "uuid" },
          title: { type: "string", minLength: 3, maxLength: 120 },
          description: { type: "string", minLength: 10, maxLength: 5000 },
          price: { type: "string", pattern: "^\\d+(\\.\\d{1,2})?$" },
          condition: { $ref: "#/components/schemas/ProductCondition" },
          inventory: { type: "integer", minimum: 0 },
          status: { $ref: "#/components/schemas/ProductStatus" },
        },
      },
      ProductDeleteBody: {
        type: "object",
        required: ["sellerId"],
        properties: {
          sellerId: { type: "string", format: "uuid" },
        },
      },
      ProductImage: {
        type: "object",
        required: [
          "id",
          "productId",
          "url",
          "sortOrder",
          "isMain",
          "createdAt",
        ],
        properties: {
          id: { type: "string", format: "uuid" },
          productId: { type: "string", format: "uuid" },
          url: { type: "string" },
          sortOrder: { type: "integer" },
          isMain: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      ProductImageListResponse: {
        type: "object",
        required: ["data"],
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/ProductImage" },
          },
        },
      },
      ProductImageResponse: {
        type: "object",
        required: ["data"],
        properties: {
          data: { $ref: "#/components/schemas/ProductImage" },
        },
      },
      ProductImageCreateBody: {
        type: "object",
        required: ["sellerId", "url"],
        properties: {
          sellerId: { type: "string", format: "uuid" },
          url: {
            type: "string",
            format: "uri",
            maxLength: 2048,
          },
          sortOrder: { type: "integer", minimum: 0, default: 0 },
          isMain: { type: "boolean", default: false },
        },
      },
      ProductImagePatchBody: {
        type: "object",
        required: ["sellerId"],
        description:
          "Provide at least one of `url`, `sortOrder`, `isMain` (enforced by the API).",
        properties: {
          sellerId: { type: "string", format: "uuid" },
          url: {
            type: "string",
            format: "uri",
            maxLength: 2048,
          },
          sortOrder: { type: "integer", minimum: 0 },
          isMain: { type: "boolean" },
        },
      },
      ConversationParticipantRef: {
        type: "object",
        required: ["userId"],
        properties: {
          userId: { type: "string", format: "uuid" },
        },
      },
      Conversation: {
        type: "object",
        required: ["id", "productId", "createdAt", "participants"],
        properties: {
          id: { type: "string", format: "uuid" },
          productId: { type: "string", format: "uuid" },
          createdAt: { type: "string", format: "date-time" },
          participants: {
            type: "array",
            items: { $ref: "#/components/schemas/ConversationParticipantRef" },
          },
        },
      },
      ConversationResponse: {
        type: "object",
        required: ["data"],
        properties: {
          data: { $ref: "#/components/schemas/Conversation" },
        },
      },
      ConversationListResponse: {
        type: "object",
        required: ["data", "meta"],
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Conversation" },
          },
          meta: { $ref: "#/components/schemas/PaginationMeta" },
        },
      },
      ConversationCreateBody: {
        type: "object",
        required: ["productId", "buyerId"],
        properties: {
          productId: { type: "string", format: "uuid" },
          buyerId: { type: "string", format: "uuid" },
        },
      },
      ConversationDeleteBody: {
        type: "object",
        required: ["userId"],
        properties: {
          userId: { type: "string", format: "uuid" },
        },
      },
      ConversationParticipant: {
        type: "object",
        required: ["conversationId", "userId", "createdAt"],
        properties: {
          conversationId: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      ConversationParticipantResponse: {
        type: "object",
        required: ["data"],
        properties: {
          data: { $ref: "#/components/schemas/ConversationParticipant" },
        },
      },
      ConversationParticipantListResponse: {
        type: "object",
        required: ["data"],
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/ConversationParticipant" },
          },
        },
      },
      ConversationParticipantCreateBody: {
        type: "object",
        required: ["actorUserId", "userId"],
        description:
          "`actorUserId` is the requester identity used for authorization until JWT/session auth is wired. `userId` is the participant to add.",
        properties: {
          actorUserId: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid" },
        },
      },
      ConversationParticipantDeleteBody: {
        type: "object",
        required: ["actorUserId"],
        description:
          "`actorUserId` is the requester identity used for authorization until JWT/session auth is wired.",
        properties: {
          actorUserId: { type: "string", format: "uuid" },
        },
      },
      Message: {
        type: "object",
        required: [
          "id",
          "conversationId",
          "senderId",
          "content",
          "sentAt",
          "isRead",
        ],
        properties: {
          id: { type: "string", format: "uuid" },
          conversationId: { type: "string", format: "uuid" },
          senderId: { type: "string", format: "uuid" },
          content: { type: "string" },
          sentAt: { type: "string", format: "date-time" },
          isRead: { type: "boolean" },
        },
      },
      MessageResponse: {
        type: "object",
        required: ["data"],
        properties: {
          data: { $ref: "#/components/schemas/Message" },
        },
      },
      MessageListResponse: {
        type: "object",
        required: ["data", "meta"],
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Message" },
          },
          meta: { $ref: "#/components/schemas/PaginationMeta" },
        },
      },
      MessageCreateBody: {
        type: "object",
        required: ["senderId", "content"],
        properties: {
          senderId: { type: "string", format: "uuid" },
          content: { type: "string", minLength: 1, maxLength: 20000 },
        },
      },
      MessagePatchBody: {
        type: "object",
        required: ["isRead"],
        description:
          "Optional `userId`: when present, that user must be a conversation participant (interim auth). When omitted, only the conversation must exist.",
        properties: {
          userId: { type: "string", format: "uuid" },
          isRead: { type: "boolean" },
        },
      },
      MessageDeleteBody: {
        type: "object",
        required: ["userId"],
        description:
          "Must match the message `senderId`; only that user may delete the row.",
        properties: {
          userId: { type: "string", format: "uuid" },
        },
      },
    },
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "Obtain with `POST /auth/login` on this API (`data.token`). Example: `Authorization: Bearer eyJhbG…`. The Next.js login at port 3000 does not expose the token in JSON.",
      },
    },
  },
} as const;
