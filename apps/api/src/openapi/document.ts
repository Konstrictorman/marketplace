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
      "Express REST API (`apps/api`). JSON errors share the `ApiErrorEnvelope` schema (`error.code` / `error.message` / optional `error.details`). Use **operationId** for generated clients.",
  },
  servers: [
    {
      url: "/api",
      description:
        "API base relative to host (e.g. `http://localhost:3001` + `/api`).",
    },
  ],
  tags: [
    { name: "Health", description: "Liveness & database connectivity" },
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
      name: "Conversations",
      description:
        "Buyer/seller threads for a product (`userId`/`buyerId` in query/body until auth is wired)",
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
                  "Examples: `validation_failed` (Zod/query/body/param checks), `seller_not_found`, `buyer_not_found`, `user_not_found`, `category_not_found`, `product_not_found`, `conversation_not_found`, `participant_not_found`, `image_not_found`, `forbidden` (ownership/participant mismatch), `invalid_participants` (buyer equals seller), `min_participants_required` (cannot leave fewer than 2 participants), `product_removed` (mutation on removed catalog row), `database_unreachable` (`GET /health/db`). Others may appear as the API grows.",
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
        description: "List row (no `description`)",
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
