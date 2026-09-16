CREATE TABLE "contactos" (
	"id" uuid PRIMARY KEY NOT NULL,
	"id_empresa" text NOT NULL,
	"nombre" text NOT NULL,
	"telefono" text NOT NULL,
	"telefono_normalizado" text NOT NULL,
	"creado_en" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "contactos_empresa_id" UNIQUE("id_empresa","id"),
	CONSTRAINT "contactos_empresa_telefono" UNIQUE("id_empresa","telefono_normalizado"),
	CONSTRAINT "contactos_uuid_v7" CHECK (substring("contactos"."id"::text, 15, 1) = '7' AND substring("contactos"."id"::text, 20, 1) IN ('8','9','a','b'))
);
--> statement-breakpoint
ALTER TABLE "contactos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "canales_whatsapp" (
	"id" uuid PRIMARY KEY NOT NULL,
	"id_empresa" text NOT NULL,
	"nombre" text NOT NULL,
	"telefono" text NOT NULL,
	"creado_en" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "canales_whatsapp_empresa_id" UNIQUE("id_empresa","id"),
	CONSTRAINT "canales_whatsapp_empresa_telefono" UNIQUE("id_empresa","telefono"),
	CONSTRAINT "canales_whatsapp_uuid_v7" CHECK (substring("canales_whatsapp"."id"::text, 15, 1) = '7' AND substring("canales_whatsapp"."id"::text, 20, 1) IN ('8','9','a','b'))
);
--> statement-breakpoint
ALTER TABLE "canales_whatsapp" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "conversaciones" (
	"id" uuid PRIMARY KEY NOT NULL,
	"id_empresa" text NOT NULL,
	"id_contacto" uuid NOT NULL,
	"id_canal" uuid NOT NULL,
	"resumen_ultimo_mensaje" varchar(500),
	"ultima_actividad" timestamp (3) with time zone NOT NULL,
	"creado_en" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "conversaciones_empresa_contacto_canal" UNIQUE("id_empresa","id_contacto","id_canal"),
	CONSTRAINT "conversaciones_uuid_v7" CHECK (substring("conversaciones"."id"::text, 15, 1) = '7' AND substring("conversaciones"."id"::text, 20, 1) IN ('8','9','a','b'))
);
--> statement-breakpoint
ALTER TABLE "conversaciones" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "contactos" ADD CONSTRAINT "contactos_id_empresa_organization_id_fk" FOREIGN KEY ("id_empresa") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "canales_whatsapp" ADD CONSTRAINT "canales_whatsapp_id_empresa_organization_id_fk" FOREIGN KEY ("id_empresa") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversaciones" ADD CONSTRAINT "conversaciones_id_empresa_organization_id_fk" FOREIGN KEY ("id_empresa") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversaciones" ADD CONSTRAINT "conversaciones_id_empresa_id_contacto_contactos_id_empresa_id_fk" FOREIGN KEY ("id_empresa","id_contacto") REFERENCES "public"."contactos"("id_empresa","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversaciones" ADD CONSTRAINT "conversaciones_id_empresa_id_canal_canales_whatsapp_id_empresa_id_fk" FOREIGN KEY ("id_empresa","id_canal") REFERENCES "public"."canales_whatsapp"("id_empresa","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "conversaciones_actividad" ON "conversaciones" USING btree ("id_empresa","ultima_actividad" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE POLICY "contactos_empresa" ON "contactos" AS PERMISSIVE FOR ALL TO public USING ("contactos"."id_empresa" = current_setting('hilo.id_empresa', true)) WITH CHECK ("contactos"."id_empresa" = current_setting('hilo.id_empresa', true));--> statement-breakpoint
CREATE POLICY "canales_whatsapp_empresa" ON "canales_whatsapp" AS PERMISSIVE FOR ALL TO public USING ("canales_whatsapp"."id_empresa" = current_setting('hilo.id_empresa', true)) WITH CHECK ("canales_whatsapp"."id_empresa" = current_setting('hilo.id_empresa', true));--> statement-breakpoint
CREATE POLICY "conversaciones_empresa" ON "conversaciones" AS PERMISSIVE FOR ALL TO public USING ("conversaciones"."id_empresa" = current_setting('hilo.id_empresa', true)) WITH CHECK ("conversaciones"."id_empresa" = current_setting('hilo.id_empresa', true));