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
      "Express REST API (`apps/api`). **Swagger UI:** open `GET /docs` under the API base (e.g. `http://localhost:3001/api/docs`). **Raw spec:** `GET /docs/openapi.json`. JSON errors use `ApiErrorEnvelope` (`error.code`, `error.message`, optional `error.details`). **operationId** is stable for generated clients. Covers health, products & images, conversations & participants, orders, **roles**, **users**, **user_roles** (nested under `/users/{userId}/roles`), and **auth/login** (JWT issuance). **Browser HttpOnly sessions** are handled by the Next.js app (`apps/web`): it proxies `POST /auth/login` to this API, stores the JWT in cookie `mp_session`, and clears it via **`POST` or `GET` `/api/auth/logout` on the web origin** (not an Express route).",
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
        "`POST /auth/login` issues an HS256 JWT (`data.token`, `data.expiresIn`). Claims include `sub`/`userId`, `username`, `institutionalEmail`, `roles`, `role`. **`GET /auth/login`** returns `405` with `Allow: POST` (avoids `route_not_found` for probes). **Next.js BFF** (`apps/web`): same credentials to the web app’s `POST /api/auth/login` set HttpOnly `mp_session`; end session with **`POST` or `GET`** `/api/auth/logout` on the **web** host (cookie clear + optional redirect to `/login`).",
    },
    {
      name: "Products",
      description: "Product catalog CRUD & search",
    },
    {
      name: "Product images",
      description:
        "Gallery URLs per product (`sellerId` in body enforced until auth is wired)",
    },
    {
      name: "Uploads",
      description:
        "`POST /uploads` stores one image on disk (`UPLOAD_DIR`) and returns a public URL (`PUBLIC_UPLOAD_URL_BASE`). Pair with `POST /products/{productId}/images` to attach to a listing.",
    },
    {
      name: "Conversations",
      description:
        "Buyer/seller threads for a product (`userId`/`buyerId` in query/body until auth is wired)",
    },
    {
      name: "Orders",
      description:
        "Orders and line items. **Interim identity:** `buyerId` is optional on all order and order-item routes (query or JSON body). When provided it must match the order’s buyer (`403` otherwise). Replace with JWT/session auth when available.",
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
          "Multipart `multipart/form-data`: field **`file`** (image), field **`sellerId`** (UUID, must exist in `users`). Returns **`data.url`** suitable for `POST /products/{productId}/images` body. Files are stored under `UPLOAD_DIR` and served at `GET /uploads/{filename}` on the API host (`PUBLIC_UPLOAD_URL_BASE`). Max size 5 MiB; JPEG, PNG, WebP, GIF only.",
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
            description: "Paged list (`description` omitted on each row)",
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
        responses: {
          "200": {
            description: "Product with description",
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
          "Pending orders only; `unitPrice` snapshot is unchanged. Optional body `buyerId`; when set must match the order buyer.",
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
                  "Stable machine code. Examples: `validation_failed`, `not_found`, `route_not_found`, `method_not_allowed`, `forbidden`, `invalid_credentials`, `user_inactive`, `auth_misconfigured`, `buyer_not_found`, `seller_not_found`, `category_not_found`, `product_not_found`, `product_removed`, `product_not_available`, `image_not_found`, `order_not_found`, `order_item_not_found`, `order_not_pending`, `insufficient_inventory`, `invalid_order_transition`, `cancelled_only_from_pending`, `conversation_not_found`, `participant_not_found`, `invalid_participants`, `min_participants_required`, `role_not_found`, `role_name_conflict`, `user_not_found`, `user_email_conflict`, `user_in_use`, `user_role_exists`, `user_role_not_found`, `database_unreachable`, … Prisma: `P2002`, `P2003`, `P2015`, `P2025` when surfaced. `database_unavailable`, `internal_error`.",
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
          "One catalog line on an order. The database enforces at most one row per (`orderId`,`productId`); adding the same product again merges quantity on that row (see `POST /orders/{orderId}/items`).",
        required: [
          "id",
          "orderId",
          "productId",
          "sellerId",
          "quantity",
          "unitPrice",
          "subtotal",
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
          createdAt: { type: "string", format: "date-time" },
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
          "`quantity` is required (≥ 1). Optional `buyerId`; when provided it must match the parent order’s buyer.",
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
          "List row (no `description`). `mainImageUrl` is the primary gallery image (`isMain` preferred, else first by `sortOrder`).",
        required: [
          "id",
          "sellerId",
          "categoryId",
          "title",
          "price",
          "condition",
          "inventory",
          "status",
          "createdAt",
          "updatedAt",
          "mainImageUrl",
        ],
        properties: {
          id: { type: "string", format: "uuid" },
          sellerId: { type: "string", format: "uuid" },
          categoryId: { type: "string", format: "uuid" },
          title: { type: "string" },
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
        },
      },
      ProductDetail: {
        type: "object",
        description: "Full product",
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
    },
  },
} as const;
