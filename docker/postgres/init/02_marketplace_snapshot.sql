--
-- PostgreSQL database dump
--

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: notification_reference_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.notification_reference_type AS ENUM (
    'message',
    'order',
    'review',
    'product',
    'report'
);


--
-- Name: notification_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.notification_status AS ENUM (
    'unread',
    'read'
);


--
-- Name: order_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.order_status AS ENUM (
    'pending',
    'confirmed',
    'delivered',
    'cancelled'
);


--
-- Name: product_condition; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.product_condition AS ENUM (
    'new',
    'used'
);


--
-- Name: product_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.product_status AS ENUM (
    'draft',
    'active',
    'inactive',
    'sold',
    'removed'
);


--
-- Name: report_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.report_status AS ENUM (
    'pending',
    'reviewed',
    'dismissed',
    'action_taken'
);


--
-- Name: report_target_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.report_target_type AS ENUM (
    'product',
    'user',
    'message',
    'review'
);


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: conversation_participants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversation_participants (
    conversation_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    conversation_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    content text NOT NULL,
    sent_at timestamp with time zone DEFAULT now() NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    CONSTRAINT messages_content_check CHECK ((length(TRIM(BOTH FROM content)) > 0))
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    type character varying(80) NOT NULL,
    reference_type public.notification_reference_type,
    reference_id uuid,
    status public.notification_status DEFAULT 'unread'::public.notification_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    read_at timestamp with time zone
);


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    product_id uuid NOT NULL,
    seller_id uuid NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT order_items_quantity_check CHECK ((quantity >= 1)),
    CONSTRAINT order_items_subtotal_check CHECK ((subtotal >= (0)::numeric)),
    CONSTRAINT order_items_unit_price_check CHECK ((unit_price > (0)::numeric))
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    buyer_id uuid NOT NULL,
    status public.order_status DEFAULT 'pending'::public.order_status NOT NULL,
    total numeric(12,2) DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT orders_total_check CHECK ((total >= (0)::numeric))
);


--
-- Name: product_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    url text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    is_main boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT product_images_sort_order_check CHECK ((sort_order >= 0))
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    seller_id uuid NOT NULL,
    category_id uuid NOT NULL,
    title character varying(100) NOT NULL,
    description text NOT NULL,
    price numeric(12,2) NOT NULL,
    condition public.product_condition NOT NULL,
    inventory integer NOT NULL,
    status public.product_status DEFAULT 'active'::public.product_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT products_description_check CHECK ((length(TRIM(BOTH FROM description)) >= 10)),
    CONSTRAINT products_inventory_check CHECK ((inventory >= 0)),
    CONSTRAINT products_price_check CHECK (((price > (0)::numeric) AND (price <= (1000000000)::numeric))),
    CONSTRAINT products_title_check CHECK ((length(TRIM(BOTH FROM title)) >= 5))
);


--
-- Name: reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reporter_id uuid NOT NULL,
    target_type public.report_target_type NOT NULL,
    target_id uuid NOT NULL,
    reason character varying(120) NOT NULL,
    description text,
    status public.report_status DEFAULT 'pending'::public.report_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    reviewed_at timestamp with time zone,
    reviewed_by uuid
);


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reviewer_id uuid NOT NULL,
    reviewed_user_id uuid NOT NULL,
    order_item_id uuid NOT NULL,
    rating integer NOT NULL,
    comment text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_review_users_different CHECK ((reviewer_id <> reviewed_user_id)),
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(50) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    institutional_email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    name character varying(150) NOT NULL,
    career character varying(150),
    photo_url text,
    reputation numeric(3,2) DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT users_reputation_check CHECK (((reputation >= (0)::numeric) AND (reputation <= (5)::numeric)))
);


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, name, description, is_active, created_at) FROM stdin;
c3f897a9-fed1-4dea-a215-41ada5e7c760	Libros	Libros, textos académicos y material de estudio	t	2026-04-26 22:44:30.58-05
bc2c4f9c-9b46-4eed-bac6-0edcb240eeb8	Tecnología	Dispositivos electrónicos y accesorios	t	2026-04-26 22:44:30.58-05
f4354855-fc97-4041-98a8-d2ffeaa201ce	Ropa	Ropa y accesorios personales	t	2026-04-26 22:44:30.58-05
ab6d83c3-bbb8-4303-9644-2b0dea1bb8bb	Hogar	Artículos para hogar y residencia	t	2026-04-26 22:44:30.58-05
cf638c78-2c8d-43fd-827b-1e05acc03ee7	Deportes	Artículos deportivos y recreativos	t	2026-05-06 13:19:24.918-05
c1f24098-7ab0-4cfe-a865-ccd4391ad330	Otros	Productos no clasificados	t	2026-04-26 22:44:30.58-05
\.


--
-- Data for Name: conversation_participants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.conversation_participants (conversation_id, user_id, created_at) FROM stdin;
3a54a1ea-c6f8-4731-94ca-a33a42f6b43f	8ff50906-7d8b-41d7-ad51-198f912a4e46	2026-05-06 13:19:24.918-05
1a5c21f1-ed2b-46d9-8e5b-ec06dfc9c856	8ff50906-7d8b-41d7-ad51-198f912a4e46	2026-05-06 13:19:24.918-05
1a5c21f1-ed2b-46d9-8e5b-ec06dfc9c856	ae00d06c-d704-41e8-b1fe-417fdfaf534c	2026-05-06 13:19:24.918-05
3a54a1ea-c6f8-4731-94ca-a33a42f6b43f	168eccb6-ebf2-4c56-8fdc-39dbb7af1ae6	2026-05-06 22:39:01.35-05
\.


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.conversations (id, product_id, created_at) FROM stdin;
3a54a1ea-c6f8-4731-94ca-a33a42f6b43f	f283688e-c955-4eb0-a51d-1279967ecfcd	2026-05-06 13:19:24.918-05
1a5c21f1-ed2b-46d9-8e5b-ec06dfc9c856	f314c740-1565-4412-b411-467ca0e095c1	2026-05-06 13:19:24.918-05
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.messages (id, conversation_id, sender_id, content, sent_at, is_read) FROM stdin;
e8a51bf2-5dcb-4688-8396-258325624b26	3a54a1ea-c6f8-4731-94ca-a33a42f6b43f	8ff50906-7d8b-41d7-ad51-198f912a4e46	Hola Ana, ¿los audífonos tienen garantía?	2026-05-06 13:19:24.918-05	f
20ed2680-8de4-4518-9529-e078ca3b9a31	1a5c21f1-ed2b-46d9-8e5b-ec06dfc9c856	ae00d06c-d704-41e8-b1fe-417fdfaf534c	Buenas, me interesa la lámpara. ¿Sigue disponible?	2026-05-06 13:19:24.918-05	f
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, user_id, type, reference_type, reference_id, status, created_at, read_at) FROM stdin;
eb79db08-5663-47dc-9d32-05577965f52f	8ff50906-7d8b-41d7-ad51-198f912a4e46	new_message	message	20ed2680-8de4-4518-9529-e078ca3b9a31	unread	2026-05-06 13:19:24.918-05	\N
f8b2b9f0-c945-4b42-bd8c-9cfd6d0f1baa	5252b905-d33c-4f05-8c50-589f4ff4c7ac	new_message	message	e9ed5aaa-5c8a-4f03-8f2a-7f0890b0085b	read	2026-05-06 13:19:24.918-05	\N
825a87b3-fd63-428e-a768-c83fdaacb31d	5252b905-d33c-4f05-8c50-589f4ff4c7ac	order_created	order	f7fe5978-1f2b-47bc-8a9b-7a629efd97b0	read	2026-05-06 13:19:24.918-05	\N
93653d0a-ba18-4ae8-b8c6-58a4f2a8a843	5252b905-d33c-4f05-8c50-589f4ff4c7ac	new_review	review	bae76e44-771f-424b-bbaa-99cfe716bfbf	unread	2026-05-06 13:19:24.918-05	\N
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_items (id, order_id, product_id, seller_id, quantity, unit_price, subtotal, created_at) FROM stdin;
b3813fb4-62ee-4530-b316-44cfff265202	38e9f980-f01e-4abd-9e2b-6428b74a4dd3	f283688e-c955-4eb0-a51d-1279967ecfcd	5252b905-d33c-4f05-8c50-589f4ff4c7ac	1	120000.00	120000.00	2026-05-06 13:19:24.918-05
cfa5af92-1165-4224-b1c6-5ee4aeda4a96	f7fe5978-1f2b-47bc-8a9b-7a629efd97b0	b6050bb3-3d37-4f31-8680-b175de6fb21a	5252b905-d33c-4f05-8c50-589f4ff4c7ac	1	85000.00	85000.00	2026-05-06 13:19:24.918-05
fdbaea04-d44d-445e-ad92-128da1e35427	86fb153c-76a0-40e5-8c36-75dc3b0e3eac	a2f253f1-d4bf-4f49-9c2d-d2cc29207e67	ae00d06c-d704-41e8-b1fe-417fdfaf534c	1	95000.00	95000.00	2026-05-07 16:16:51.292-05
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, buyer_id, status, total, created_at, updated_at) FROM stdin;
f7fe5978-1f2b-47bc-8a9b-7a629efd97b0	5dc3cdf9-c24f-4975-9572-67e5055ec30d	delivered	85000.00	2026-05-06 13:19:24.918-05	2026-05-07 18:17:50.46028-05
38e9f980-f01e-4abd-9e2b-6428b74a4dd3	8ff50906-7d8b-41d7-ad51-198f912a4e46	confirmed	120000.00	2026-05-06 13:19:24.918-05	2026-05-07 18:17:50.46028-05
86fb153c-76a0-40e5-8c36-75dc3b0e3eac	5252b905-d33c-4f05-8c50-589f4ff4c7ac	cancelled	95000.00	2026-05-07 16:16:51.285-05	2026-05-07 18:17:50.46028-05
80b0b7e0-f39b-4a86-bd5a-ad244e064520	5252b905-d33c-4f05-8c50-589f4ff4c7ac	pending	0.00	2026-05-06 13:19:24.918-05	2026-05-07 18:17:50.46028-05
\.


--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_images (id, product_id, url, sort_order, is_main, created_at) FROM stdin;
7e02a86d-d78e-49d5-a64f-2e1184ae197f	b6050bb3-3d37-4f31-8680-b175de6fb21a	https://cdn.example.com/products/calculo-stewart-1.jpg	1	t	2026-05-06 13:19:24.918-05
a753a02e-3caf-40ea-b623-c8a8e4159350	b6050bb3-3d37-4f31-8680-b175de6fb21a	https://cdn.example.com/products/calculo-stewart-2.jpg	2	f	2026-05-06 13:19:24.918-05
9ebea348-33c3-414e-9034-3e7910d87025	a2f253f1-d4bf-4f49-9c2d-d2cc29207e67	https://cdn.example.com/products/chaqueta-1.jpg	1	t	2026-05-06 13:19:24.918-05
7c29058a-c0c7-49bd-b4a7-ba3e989830be	f314c740-1565-4412-b411-467ca0e095c1	https://cdn.example.com/products/lampara-1.jpg	1	t	2026-05-06 13:19:24.918-05
3f8f0dd5-7449-4945-980b-0209c8946a0d	f283688e-c955-4eb0-a51d-1279967ecfcd	https://cdn.example.com/products/audifonos-1.jpg	1	t	2026-05-06 13:19:24.918-05
baf4abf6-bc21-42e8-b82c-75b6af3adbf9	1494a8af-94bf-4cd8-b279-d5403fa94773	https://cdn.example.com/products/balon-1.jpg	1	t	2026-05-06 13:19:24.918-05
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, seller_id, category_id, title, description, price, condition, inventory, status, created_at, updated_at) FROM stdin;
f283688e-c955-4eb0-a51d-1279967ecfcd	5252b905-d33c-4f05-8c50-589f4ff4c7ac	bc2c4f9c-9b46-4eed-bac6-0edcb240eeb8	Audífonos inalámbricos	Audífonos bluetooth con estuche de carga, poco uso y buen sonido.	120000.00	used	2	active	2026-05-06 13:19:24.918-05	2026-05-07 18:17:50.46028-05
f314c740-1565-4412-b411-467ca0e095c1	8ff50906-7d8b-41d7-ad51-198f912a4e46	ab6d83c3-bbb8-4303-9644-2b0dea1bb8bb	Lámpara de escritorio LED	Lámpara blanca LED con tres niveles de intensidad y brazo ajustable.	60000.00	new	4	active	2026-05-06 13:19:24.918-05	2026-05-07 18:17:50.46028-05
1494a8af-94bf-4cd8-b279-d5403fa94773	ae00d06c-d704-41e8-b1fe-417fdfaf534c	cf638c78-2c8d-43fd-827b-1e05acc03ee7	Balón de fútbol profesional	Balón tamaño 5 en buen estado, usado pocas veces en cancha sintética.	70000.00	used	10	active	2026-05-06 13:19:24.918-05	2026-05-07 18:17:50.46028-05
b6050bb3-3d37-4f31-8680-b175de6fb21a	5252b905-d33c-4f05-8c50-589f4ff4c7ac	c3f897a9-fed1-4dea-a215-41ada5e7c760	Libro de Cálculo Stewart	Libro de cálculo usado en buen estado, ideal para primeros semestres.	85000.00	used	10	active	2026-05-06 13:19:24.918-05	2026-05-07 18:17:50.46028-05
fd953f15-5ee3-4e90-a540-19229a4348fa	8ff50906-7d8b-41d7-ad51-198f912a4e46	ab6d83c3-bbb8-4303-9644-2b0dea1bb8bb	Vintage desk lamp	Nice metal desk lamp, works well, minor wear.	39.99	used	10	active	2026-05-06 16:45:10.078-05	2026-05-07 18:17:50.46028-05
a2f253f1-d4bf-4f49-9c2d-d2cc29207e67	ae00d06c-d704-41e8-b1fe-417fdfaf534c	f4354855-fc97-4041-98a8-d2ffeaa201ce	Chaqueta Universidad de La Sabana	Chaqueta azul en excelente estado, talla M, ideal para clima frío.	95000.00	used	11	active	2026-05-06 13:19:24.918-05	2026-05-07 18:17:50.46028-05
\.


--
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reports (id, reporter_id, target_type, target_id, reason, description, status, created_at, reviewed_at, reviewed_by) FROM stdin;
2bea3dc8-a5d5-4ea5-91b0-f00ef4a93438	5dc3cdf9-c24f-4975-9572-67e5055ec30d	product	1494a8af-94bf-4cd8-b279-d5403fa94773	Contenido posiblemente inapropiado	El producto parece no corresponder con la descripción publicada.	pending	2026-05-06 13:19:24.918-05	\N	\N
2a3aaeb3-f712-42db-9668-81c1dd035638	8ff50906-7d8b-41d7-ad51-198f912a4e46	message	e9ed5aaa-5c8a-4f03-8f2a-7f0890b0085b	Mensaje sospechoso	El mensaje solicita datos personales por fuera de la plataforma.	reviewed	2026-05-06 13:19:24.918-05	\N	\N
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reviews (id, reviewer_id, reviewed_user_id, order_item_id, rating, comment, created_at) FROM stdin;
bae76e44-771f-424b-bbaa-99cfe716bfbf	5dc3cdf9-c24f-4975-9572-67e5055ec30d	5252b905-d33c-4f05-8c50-589f4ff4c7ac	cfa5af92-1165-4224-b1c6-5ee4aeda4a96	5	El libro estaba en muy buen estado y la entrega fue rápida.	2026-05-06 13:19:24.918-05
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (id, name, description, created_at) FROM stdin;
ad126ee8-2a5d-4d5e-a64b-af71dc38768f	buyer	Usuario comprador	2026-04-26 22:44:30.58-05
52a8fd35-ffd6-402a-8112-3f6637d4d1f7	seller	Usuario vendedor	2026-04-26 22:44:30.58-05
f1ce85fb-ed2e-435a-a006-87278c2a622e	admin	Usuario administrador	2026-04-26 22:44:30.58-05
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_roles (user_id, role_id, created_at) FROM stdin;
5252b905-d33c-4f05-8c50-589f4ff4c7ac	ad126ee8-2a5d-4d5e-a64b-af71dc38768f	2026-05-06 13:19:24.918-05
ae00d06c-d704-41e8-b1fe-417fdfaf534c	ad126ee8-2a5d-4d5e-a64b-af71dc38768f	2026-05-06 13:19:24.918-05
5dc3cdf9-c24f-4975-9572-67e5055ec30d	ad126ee8-2a5d-4d5e-a64b-af71dc38768f	2026-05-06 13:19:24.918-05
8ff50906-7d8b-41d7-ad51-198f912a4e46	ad126ee8-2a5d-4d5e-a64b-af71dc38768f	2026-05-06 13:19:24.918-05
5252b905-d33c-4f05-8c50-589f4ff4c7ac	52a8fd35-ffd6-402a-8112-3f6637d4d1f7	2026-05-06 13:19:24.918-05
ae00d06c-d704-41e8-b1fe-417fdfaf534c	52a8fd35-ffd6-402a-8112-3f6637d4d1f7	2026-05-06 13:19:24.918-05
8ff50906-7d8b-41d7-ad51-198f912a4e46	52a8fd35-ffd6-402a-8112-3f6637d4d1f7	2026-05-06 13:19:24.918-05
168eccb6-ebf2-4c56-8fdc-39dbb7af1ae6	f1ce85fb-ed2e-435a-a006-87278c2a622e	2026-05-06 13:19:24.918-05
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, institutional_email, password_hash, name, career, photo_url, reputation, is_active, created_at, updated_at) FROM stdin;
5252b905-d33c-4f05-8c50-589f4ff4c7ac	ana.gomez@unisabana.edu.co	$2b$12$exampleHashAna	Ana Gómez	Ingeniería Informática	https://cdn.example.com/users/ana-gomez.jpg	4.80	t	2026-05-06 13:19:24.918-05	2026-05-07 18:17:50.46028-05
ae00d06c-d704-41e8-b1fe-417fdfaf534c	juan.perez@unisabana.edu.co	$2b$12$exampleHashJuan	Juan Pérez	Administración de Empresas	https://cdn.example.com/users/juan-perez.jpg	4.50	t	2026-05-06 13:19:24.918-05	2026-05-07 18:17:50.46028-05
5dc3cdf9-c24f-4975-9572-67e5055ec30d	laura.rodriguez@unisabana.edu.co	$2b$12$exampleHashLaura	Laura Rodríguez	Comunicación Social	https://cdn.example.com/users/laura-rodriguez.jpg	0.00	t	2026-05-06 13:19:24.918-05	2026-05-07 18:17:50.46028-05
8ff50906-7d8b-41d7-ad51-198f912a4e46	carlos.martinez@unisabana.edu.co	$2b$12$exampleHashCarlos	Carlos Martínez	Derecho	https://cdn.example.com/users/carlos-martinez.jpg	4.20	t	2026-05-06 13:19:24.918-05	2026-05-07 18:17:50.46028-05
168eccb6-ebf2-4c56-8fdc-39dbb7af1ae6	admin.marketplace@unisabana.edu.co	$2b$12$exampleHashAdmin	Admin Marketplace	\N	https://cdn.example.com/users/admin-marketplace.jpg	0.00	t	2026-05-06 13:19:24.918-05	2026-05-07 18:17:50.46028-05
0a0b9dce-02c6-4e00-90d2-f43431c5ab18	seed.buyer@marketplace.local	seed-not-for-auth	Seed Buyer	\N	\N	0.00	t	2026-05-07 18:14:07.339-05	2026-05-07 18:17:50.46028-05
\.


--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: conversation_participants conversation_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_participants
    ADD CONSTRAINT conversation_participants_pkey PRIMARY KEY (conversation_id, user_id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- Name: users users_institutional_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_institutional_email_key UNIQUE (institutional_email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_messages_conversation_sent_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_conversation_sent_at ON public.messages USING btree (conversation_id, sent_at);


--
-- Name: idx_notifications_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_status ON public.notifications USING btree (user_id, status);


--
-- Name: idx_order_items_seller; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_items_seller ON public.order_items USING btree (seller_id);


--
-- Name: idx_orders_buyer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_buyer ON public.orders USING btree (buyer_id);


--
-- Name: idx_products_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_category ON public.products USING btree (category_id);


--
-- Name: idx_products_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_created_at ON public.products USING btree (created_at DESC);


--
-- Name: idx_products_seller; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_seller ON public.products USING btree (seller_id);


--
-- Name: idx_products_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_status ON public.products USING btree (status);


--
-- Name: idx_products_title_description_search; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_title_description_search ON public.products USING gin (to_tsvector('spanish'::regconfig, (((COALESCE(title, ''::character varying))::text || ' '::text) || COALESCE(description, ''::text))));


--
-- Name: idx_reports_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reports_status ON public.reports USING btree (status);


--
-- Name: idx_reports_target; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reports_target ON public.reports USING btree (target_type, target_id);


--
-- Name: idx_reviews_reviewed_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_reviewed_user ON public.reviews USING btree (reviewed_user_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (institutional_email);


--
-- Name: uq_order_items_order_product; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_order_items_order_product ON public.order_items USING btree (order_id, product_id);


--
-- Name: uq_product_images_main; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_product_images_main ON public.product_images USING btree (product_id) WHERE (is_main = true);


--
-- Name: uq_reports_pending_same_target; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_reports_pending_same_target ON public.reports USING btree (reporter_id, target_type, target_id) WHERE (status = 'pending'::public.report_status);


--
-- Name: uq_reviews_order_item; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_reviews_order_item ON public.reviews USING btree (order_item_id);


--
-- Name: orders trg_orders_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: products trg_products_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: users trg_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: conversation_participants conversation_participants_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_participants
    ADD CONSTRAINT conversation_participants_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: conversation_participants conversation_participants_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_participants
    ADD CONSTRAINT conversation_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: conversations conversations_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- Name: order_items order_items_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: orders orders_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: product_images product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE RESTRICT;


--
-- Name: products products_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: reports reports_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: reports reports_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: reviews reviews_order_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_order_item_id_fkey FOREIGN KEY (order_item_id) REFERENCES public.order_items(id) ON DELETE RESTRICT;


--
-- Name: reviews reviews_reviewed_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_reviewed_user_id_fkey FOREIGN KEY (reviewed_user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: reviews reviews_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

