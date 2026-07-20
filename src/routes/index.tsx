import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bus,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import heroImage from "@/assets/turismo-galaxy-hero.jpg";
import aboutImage from "@/assets/turismo-galaxy-about.jpg";
import fleetExteriorImage from "@/assets/fleet-exterior-premium.jpg";
import fleetInteriorImage from "@/assets/fleet-interior-premium.jpg";
import fleetSeatsImage from "@/assets/fleet-seats-premium.jpg";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getTurismoContent,
  type FleetRecord,
  type GalleryRecord,
  type OfficeLocationRecord,
  type TestimonialRecord,
  type TurismoContent,
} from "@/lib/turismo-content";

const quoteSchema = z.object({
  name: z.string().trim().min(2, "Ingresa tu nombre").max(100, "Nombre demasiado largo"),
  company: z.string().trim().min(2, "Ingresa tu empresa u organización").max(120, "Texto demasiado largo"),
  passengers: z
    .string()
    .trim()
    .min(1, "Indica el número de pasajeros")
    .refine((value) => Number(value) > 0, "Debe ser mayor a 0"),
  service: z.string().trim().min(2, "Selecciona el tipo de servicio").max(100, "Texto demasiado largo"),
  origin: z.string().trim().min(2, "Indica el origen").max(120, "Texto demasiado largo"),
  destination: z.string().trim().min(2, "Indica el destino").max(120, "Texto demasiado largo"),
  travelDate: z.string().trim().min(1, "Selecciona la fecha estimada"),
  locationId: z.string().trim().min(1, "Selecciona una oficina"),
  details: z.string().trim().min(10, "Comparte algunos detalles").max(1000, "Máximo 1000 caracteres"),
});

type QuoteFormValues = z.infer<typeof quoteSchema>;

const fallbackTestimonials = [
  {
    id: "fallback-1",
    customer_name: "Coordinación Ejecutiva Regional",
    customer_role: "Transporte corporativo",
    quote:
      "Turismo Galaxy resolvió una operación compleja con puntualidad impecable, unidades impecables y atención constante durante todo el trayecto.",
    rating: 5,
  },
  {
    id: "fallback-2",
    customer_name: "Comité de Eventos Premium",
    customer_role: "Logística de grupos",
    quote:
      "La experiencia a bordo y la seguridad operativa elevaron por completo la percepción de nuestro evento. El servicio se sintió realmente ejecutivo.",
    rating: 5,
  },
  {
    id: "fallback-3",
    customer_name: "Operación Turística del Bajío",
    customer_role: "Viajes programados",
    quote:
      "Con Turismo Galaxy tenemos una respuesta rápida, flota consistente y flexibilidad para grupos grandes sin perder el nivel premium.",
    rating: 5,
  },
] satisfies Array<Pick<TestimonialRecord, "id" | "customer_name" | "customer_role" | "quote" | "rating">>;

function RouteErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="glass-panel-strong w-full max-w-xl rounded-[8px] p-8 text-center md:p-10">
        <p className="text-sm uppercase tracking-[0.22em] text-brand">Turismo Galaxy</p>
        <h1 className="font-display mt-4 text-4xl text-foreground">No pudimos cargar el sitio.</h1>
        <p className="mt-4 text-muted-foreground">{error.message || "Intenta nuevamente en unos momentos."}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            Intentar de nuevo
          </Button>
          <Button asChild variant="outline">
            <a href="#quote">Solicitar cotización</a>
          </Button>
        </div>
      </div>
    </main>
  );
}

function RouteNotFoundComponent() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="glass-panel-strong w-full max-w-xl rounded-[8px] p-8 text-center md:p-10">
        <p className="text-sm uppercase tracking-[0.22em] text-brand">404</p>
        <h1 className="font-display mt-4 text-4xl text-foreground">Ruta no disponible</h1>
        <p className="mt-4 text-muted-foreground">La experiencia de Turismo Galaxy se encuentra en la página principal.</p>
        <div className="mt-8">
          <Button asChild>
            <a href="/">Ir al inicio</a>
          </Button>
        </div>
      </div>
    </main>
  );
}

export const Route = createFileRoute("/")({
  loader: () => getTurismoContent(),
  component: Index,
  errorComponent: RouteErrorComponent,
  notFoundComponent: RouteNotFoundComponent,
});

function Index() {
  const content = Route.useLoaderData() as TurismoContent;
  const testimonials = content.testimonials.length > 0 ? content.testimonials : fallbackTestimonials;
  const fleet = content.fleet;
  const locations = content.locations;

  const fallbackGallery = useMemo(
    () =>
      createFallbackGallery(content.gallery).slice(0, 6),
    [content.gallery],
  );

  const { register, handleSubmit, watch, formState } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      name: "",
      company: "",
      passengers: "",
      service: "Traslado ejecutivo",
      origin: "",
      destination: "",
      travelDate: "",
      locationId: locations[0]?.id ?? "",
      details: "",
    },
  });

  const selectedLocation = locations.find((location) => location.id === watch("locationId")) ?? locations[0] ?? null;
  const totalCapacity = fleet.reduce((sum, item) => sum + (item.passenger_capacity ?? 0), 0);
  const featuredFleet = fleet.filter((item) => item.is_featured).length > 0 ? fleet.filter((item) => item.is_featured) : fleet.slice(0, 6);

  const onSubmit = (values: QuoteFormValues) => {
    if (!selectedLocation) {
      return;
    }

    const phone = normalizePhone(selectedLocation.whatsapp_number ?? selectedLocation.phone_numbers[0] ?? "");
    const message = [
      "Hola Turismo Galaxy, me gustaría solicitar una cotización.",
      "",
      `Nombre: ${values.name}`,
      `Empresa/Grupo: ${values.company}`,
      `Pasajeros: ${values.passengers}`,
      `Servicio: ${values.service}`,
      `Origen: ${values.origin}`,
      `Destino: ${values.destination}`,
      `Fecha estimada: ${values.travelDate}`,
      `Oficina elegida: ${selectedLocation.name}`,
      `Detalles: ${values.details}`,
    ].join("\n");

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="overflow-x-hidden">
      <section className="relative min-h-screen border-b border-line-soft">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Autobús ejecutivo de Turismo Galaxy en carretera al atardecer"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,color-mix(in_oklab,var(--background)_76%,transparent),color-mix(in_oklab,var(--background)_42%,transparent),color-mix(in_oklab,var(--background)_82%,transparent))]" />
          <div className="brand-shine absolute inset-0" />
          <div className="luxury-grid absolute inset-0 opacity-20" />
        </div>

        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 pb-8 pt-6 md:px-10">
          <header className="glass-panel flex items-center justify-between rounded-[8px] px-4 py-3 md:px-6">
            <div>
              <p className="font-display text-xl text-foreground md:text-2xl">Turismo Galaxy</p>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Luxury transportation</p>
            </div>
            <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
              <a href="#about" className="transition-colors hover:text-foreground">Nosotros</a>
              <a href="#fleet" className="transition-colors hover:text-foreground">Flota</a>
              <a href="#gallery" className="transition-colors hover:text-foreground">Galería</a>
              <a href="#quote" className="transition-colors hover:text-foreground">Cotización</a>
            </nav>
          </header>

          <div className="grid gap-10 pb-12 pt-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-center lg:gap-16 lg:pb-20">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-3xl"
            >
              <p className="text-sm uppercase tracking-[0.28em] text-brand">Más de 25 años de experiencia</p>
              <h1 className="font-display mt-6 text-5xl leading-none text-foreground md:text-7xl">
                Movilidad premium.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                Viajes que exigen excelencia, puntualidad y confort.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-[8px]">
                  <a href="#quote">
                    Solicitar cotización
                    <ArrowRight />
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg" className="glass-panel rounded-[8px] border-line-soft bg-surface/50">
                  <a href="#fleet">Explorar flota</a>
                </Button>
              </div>
            </motion.div>

            <motion.aside
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
              className="glass-panel-strong rounded-[8px] p-5 md:p-6"
            >
              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                {[
                  { label: "Unidades activas", value: `${fleet.length}+`, icon: Bus },
                  { label: "Capacidad acumulada", value: `${totalCapacity}+`, icon: Users },
                  { label: "Cobertura dedicada", value: `${locations.length} sedes`, icon: MapPin },
                ].map((item) => (
                  <div key={item.label} className="rounded-[8px] border border-line-soft bg-surface/55 p-4">
                    <item.icon className="h-5 w-5 text-brand" />
                    <p className="mt-6 text-3xl font-semibold text-foreground">{item.value}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="section-rule my-5" />
              <div className="space-y-3 text-sm text-muted-foreground">
                <p className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 text-brand" />Atención directa para grupos, turismo y logística ejecutiva.</p>
                <p className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-4 w-4 text-brand" />Operación confiable con enfoque en seguridad, imagen y experiencia a bordo.</p>
                <p className="flex items-start gap-3"><Sparkles className="mt-0.5 h-4 w-4 text-brand" />Preparado para integrar Highsfield AI en recomendaciones de unidades.</p>
              </div>
            </motion.aside>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {locations.slice(0, 3).map((location, index) => (
              <motion.article
                key={location.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.08 }}
                className="glass-panel rounded-[8px] p-4"
              >
                <p className="text-sm uppercase tracking-[0.2em] text-brand">{location.city}</p>
                <h2 className="mt-2 text-lg font-semibold text-foreground">{location.name}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{location.address}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-7xl px-6 py-24 md:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative"
          >
            <div className="glass-panel-strong absolute -left-4 -top-4 hidden rounded-[8px] px-4 py-3 lg:block">
              <p className="text-xs uppercase tracking-[0.24em] text-brand">Experiencia</p>
              <p className="mt-1 text-xl font-semibold text-foreground">Imagen ejecutiva en cada salida</p>
            </div>
            <img
              src={aboutImage}
              alt="Equipo profesional de Turismo Galaxy brindando atención ejecutiva"
              loading="lazy"
              className="h-[520px] w-full rounded-[8px] object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.08 }}
          >
            <p className="text-sm uppercase tracking-[0.28em] text-brand">Nosotros</p>
            <h2 className="font-display mt-5 text-4xl leading-tight text-foreground md:text-5xl">
              Hospitalidad, confiabilidad y presencia premium para cada itinerario.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">
              Somos una empresa de transporte turístico comprometida con la satisfacción del cliente, con un servicio personalizado y confiable que busca superar expectativas en cada trayecto.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {[
                {
                  title: "Misión",
                  text: "Entregar servicio personalizado de calidad con un equipo altamente competitivo.",
                },
                {
                  title: "Visión",
                  text: "Liderar el mercado turístico nacional con innovación, prestigio y altos estándares.",
                },
                {
                  title: "Valores",
                  text: "Respeto, honestidad, trabajo en equipo, liderazgo, responsabilidad y lealtad.",
                },
                {
                  title: "Cobertura",
                  text: "Operación regional lista para salidas corporativas, turísticas y de eventos especiales.",
                },
              ].map((item) => (
                <article key={item.title} className="glass-panel rounded-[8px] p-5">
                  <p className="text-sm uppercase tracking-[0.22em] text-brand">{item.title}</p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.text}</p>
                </article>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section id="fleet" className="border-y border-line-soft bg-surface/25">
        <div className="mx-auto max-w-7xl px-6 py-24 md:px-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.28em] text-brand">Premium fleet</p>
              <h2 className="font-display mt-5 text-4xl leading-tight text-foreground md:text-5xl">Unidades ejecutivas para grupos que buscan viajar con presencia.</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              Cada unidad puede actualizarse desde las colecciones de contenido para mantener la flota, galerías y detalles comerciales siempre al día.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featuredFleet.map((item, index) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: index * 0.06, ease: "easeOut" }}
                className="glass-panel group flex h-full flex-col overflow-hidden rounded-[8px]"
              >
                <img
                  src={resolveFleetCover(item, index)}
                  alt={`Unidad ${item.name} de Turismo Galaxy`}
                  loading="lazy"
                  className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-brand">{item.brand ?? "Turismo Galaxy"}</p>
                      <h3 className="mt-2 text-2xl font-semibold text-foreground">{item.name}</h3>
                    </div>
                    {item.passenger_capacity ? (
                      <div className="rounded-[8px] border border-line-soft px-3 py-2 text-right">
                        <p className="text-lg font-semibold text-foreground">{item.passenger_capacity}</p>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">pasajeros</p>
                      </div>
                    ) : null}
                  </div>

                  <p className="mt-4 flex-1 text-sm leading-6 text-muted-foreground">
                    {item.description ?? "Configuración ejecutiva para trayectos largos, eventos y operación turística premium."}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {(item.amenities.length > 0 ? item.amenities : ["A/C", "Asientos reclinables", "Audio y video"]).slice(0, 4).map((amenity) => (
                      <span key={amenity} className="rounded-[8px] border border-line-soft px-3 py-2 text-xs text-muted-foreground">
                        {amenity}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6">
                    <FleetDialog item={item} index={index} />
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="gallery" className="mx-auto max-w-7xl px-6 py-24 md:px-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.28em] text-brand">Gallery</p>
            <h2 className="font-display mt-5 text-4xl leading-tight text-foreground md:text-5xl">Una imagen de marca que también se siente durante el trayecto.</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            Esta galería funciona con una colección editable para actualizar campañas, interiores, unidades y escenas de servicio sin tocar código.
          </p>
        </div>

        <div className="mt-12 columns-1 gap-5 md:columns-2 xl:columns-3">
          {fallbackGallery.map((item, index) => (
            <motion.figure
              key={item.id ?? `${item.title}-${index}`}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.55, delay: index * 0.05, ease: "easeOut" }}
              className="glass-panel mb-5 break-inside-avoid overflow-hidden rounded-[8px]"
            >
              <img
                src={resolveGalleryImage(item, index)}
                alt={item.alt_text ?? item.title}
                loading="lazy"
                className="w-full object-cover"
              />
              <figcaption className="p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-brand">{item.category}</p>
                <p className="mt-2 text-sm text-foreground">{item.title}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </section>

      <section className="border-y border-line-soft bg-surface/25">
        <div className="mx-auto max-w-7xl px-6 py-24 md:px-10">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-brand">Why choose us</p>
              <h2 className="font-display mt-5 text-4xl leading-tight text-foreground md:text-5xl">La diferencia está en cómo se coordina, se presenta y se ejecuta cada salida.</h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {[
                {
                  icon: Clock3,
                  title: "Respuesta ejecutiva",
                  copy: "Planeación ágil, confirmaciones claras y seguimiento constante desde la primera solicitud.",
                },
                {
                  icon: ShieldCheck,
                  title: "Confiabilidad operativa",
                  copy: "Procesos enfocados en puntualidad, seguridad y continuidad para grupos y eventos sensibles.",
                },
                {
                  icon: Bus,
                  title: "Flota con presencia",
                  copy: "Configuraciones de lujo y unidades preparadas para una experiencia premium en carretera.",
                },
                {
                  icon: Sparkles,
                  title: "Preparado para IA",
                  copy: "Estructura lista para sumar un asistente que recomiende unidades según número de pasajeros y tipo de servicio.",
                },
              ].map((item) => (
                <article key={item.title} className="glass-panel rounded-[8px] p-5">
                  <item.icon className="h-5 w-5 text-brand" />
                  <h3 className="mt-6 text-xl font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 md:px-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.28em] text-brand">Testimonials</p>
            <h2 className="font-display mt-5 text-4xl leading-tight text-foreground md:text-5xl">Confianza construida a través de servicio consistente.</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            Los testimonios también están preparados como colección editable para actualizar prueba social y casos de uso reales.
          </p>
        </div>

        <div className="mt-12 pl-0 md:pl-12">
          <Carousel opts={{ loop: true }} className="mx-auto w-full max-w-5xl">
            <CarouselContent>
              {testimonials.map((item) => (
                <CarouselItem key={item.id} className="md:basis-1/1">
                  <article className="glass-panel-strong rounded-[8px] p-8 md:p-10">
                    <div className="flex gap-1">
                      {Array.from({ length: item.rating }).map((_, index) => (
                        <Star key={`${item.id}-${index}`} className="h-5 w-5 fill-highlight text-highlight" />
                      ))}
                    </div>
                    <p className="mt-6 text-2xl leading-10 text-foreground md:text-3xl">“{item.quote}”</p>
                    <div className="mt-8 flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-line-soft bg-surface text-lg font-semibold text-foreground">
                        {item.customer_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{item.customer_name}</p>
                        <p className="text-sm text-muted-foreground">{item.customer_role ?? "Cliente Turismo Galaxy"}</p>
                      </div>
                    </div>
                  </article>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="glass-panel left-0 border-line-soft bg-surface/75 text-foreground md:-left-12" />
            <CarouselNext className="glass-panel right-0 border-line-soft bg-surface/75 text-foreground md:-right-12" />
          </Carousel>
        </div>
      </section>

      <section id="quote" className="border-t border-line-soft bg-surface/25">
        <div className="mx-auto max-w-7xl px-6 py-24 md:px-10">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-start">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-brand">Interactive quote</p>
              <h2 className="font-display mt-5 text-4xl leading-tight text-foreground md:text-5xl">Cotiza por WhatsApp con la oficina más conveniente para tu operación.</h2>
              <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground">
                Completa los datos clave y abriremos el mensaje con la sede seleccionada para agilizar la atención comercial.
              </p>

              <div className="mt-8 space-y-4">
                {locations.map((location) => (
                  <article key={location.id} className="glass-panel rounded-[8px] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-brand">{location.city}</p>
                        <h3 className="mt-1 text-lg font-semibold text-foreground">{location.name}</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{location.address}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button asChild className="rounded-[8px]">
                          <a href={`https://wa.me/${normalizePhone(location.whatsapp_number ?? location.phone_numbers[0] ?? "")}`} target="_blank" rel="noreferrer">
                            <MessageCircle />
                            WhatsApp
                          </a>
                        </Button>
                        <Button asChild variant="outline" className="rounded-[8px] border-line-soft bg-surface/50">
                          <a href={`tel:${normalizeTel(location.phone_numbers[0] ?? "")}`}>
                            <Phone />
                            Llamar
                          </a>
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="glass-panel-strong rounded-[8px] p-6 md:p-8" data-highsfield-slot="unit-recommendation-ready">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-brand">Formulario</p>
                  <p className="mt-2 text-sm text-muted-foreground">Datos listos para enlazar un recomendador inteligente de unidades.</p>
                </div>
                <div className="rounded-[8px] border border-line-soft px-3 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Highsfield AI ready
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-1">
                  <label className="text-sm text-muted-foreground" htmlFor="name">Nombre</label>
                  <Input id="name" {...register("name")} className="h-11 rounded-[8px] border-line-soft bg-surface/55" />
                  {formState.errors.name ? <p className="text-xs text-destructive">{formState.errors.name.message}</p> : null}
                </div>

                <div className="space-y-2 md:col-span-1">
                  <label className="text-sm text-muted-foreground" htmlFor="company">Empresa o grupo</label>
                  <Input id="company" {...register("company")} className="h-11 rounded-[8px] border-line-soft bg-surface/55" />
                  {formState.errors.company ? <p className="text-xs text-destructive">{formState.errors.company.message}</p> : null}
                </div>

                <div className="space-y-2 md:col-span-1">
                  <label className="text-sm text-muted-foreground" htmlFor="passengers">Pasajeros</label>
                  <Input id="passengers" inputMode="numeric" {...register("passengers")} className="h-11 rounded-[8px] border-line-soft bg-surface/55" />
                  {formState.errors.passengers ? <p className="text-xs text-destructive">{formState.errors.passengers.message}</p> : null}
                </div>

                <div className="space-y-2 md:col-span-1">
                  <label className="text-sm text-muted-foreground" htmlFor="service">Servicio</label>
                  <Input id="service" {...register("service")} className="h-11 rounded-[8px] border-line-soft bg-surface/55" />
                  {formState.errors.service ? <p className="text-xs text-destructive">{formState.errors.service.message}</p> : null}
                </div>

                <div className="space-y-2 md:col-span-1">
                  <label className="text-sm text-muted-foreground" htmlFor="origin">Origen</label>
                  <Input id="origin" {...register("origin")} className="h-11 rounded-[8px] border-line-soft bg-surface/55" />
                  {formState.errors.origin ? <p className="text-xs text-destructive">{formState.errors.origin.message}</p> : null}
                </div>

                <div className="space-y-2 md:col-span-1">
                  <label className="text-sm text-muted-foreground" htmlFor="destination">Destino</label>
                  <Input id="destination" {...register("destination")} className="h-11 rounded-[8px] border-line-soft bg-surface/55" />
                  {formState.errors.destination ? <p className="text-xs text-destructive">{formState.errors.destination.message}</p> : null}
                </div>

                <div className="space-y-2 md:col-span-1">
                  <label className="text-sm text-muted-foreground" htmlFor="travelDate">Fecha estimada</label>
                  <Input id="travelDate" type="date" {...register("travelDate")} className="h-11 rounded-[8px] border-line-soft bg-surface/55" />
                  {formState.errors.travelDate ? <p className="text-xs text-destructive">{formState.errors.travelDate.message}</p> : null}
                </div>

                <div className="space-y-2 md:col-span-1">
                  <label className="text-sm text-muted-foreground" htmlFor="locationId">Oficina</label>
                  <select id="locationId" {...register("locationId")} className="h-11 w-full rounded-[8px] border border-line-soft bg-surface/55 px-3 text-sm text-foreground outline-none transition focus:ring-1 focus:ring-ring">
                    {locations.map((location) => (
                      <option key={location.id} value={location.id} className="bg-surface text-foreground">
                        {location.name}
                      </option>
                    ))}
                  </select>
                  {formState.errors.locationId ? <p className="text-xs text-destructive">{formState.errors.locationId.message}</p> : null}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm text-muted-foreground" htmlFor="details">Detalles del servicio</label>
                  <Textarea id="details" {...register("details")} className="min-h-36 rounded-[8px] border-line-soft bg-surface/55" />
                  {formState.errors.details ? <p className="text-xs text-destructive">{formState.errors.details.message}</p> : null}
                </div>

                <div className="glass-panel md:col-span-2 rounded-[8px] p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-brand">Resumen de contacto</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {selectedLocation
                      ? `Se enviará a ${selectedLocation.name} · ${selectedLocation.phone_numbers.join(" · ")}`
                      : "Selecciona una oficina para generar el mensaje."}
                  </p>
                </div>

                <div className="md:col-span-2 flex flex-wrap gap-3">
                  <Button type="submit" size="lg" className="rounded-[8px]">
                    <MessageCircle />
                    Enviar por WhatsApp
                  </Button>
                  <Button asChild type="button" variant="outline" size="lg" className="rounded-[8px] border-line-soft bg-surface/50">
                    <a href={`tel:${normalizeTel(content.contact?.primary_phone ?? locations[0]?.phone_numbers[0] ?? "")}`}>
                      <Phone />
                      Contacto directo
                    </a>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-7xl px-6 py-10 md:px-10">
        <div className="glass-panel flex flex-col gap-8 rounded-[8px] px-6 py-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-2xl text-foreground">Turismo Galaxy</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {content.contact?.support_copy ?? "Operación premium en transporte turístico y ejecutivo con atención personalizada para grupos, eventos y viajes corporativos."}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {locations.map((location) => (
              <div key={location.id}>
                <p className="text-sm font-semibold text-foreground">{location.city}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{location.phone_numbers.join(" · ")}</p>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}

function FleetDialog({ item, index }: { item: FleetRecord; index: number }) {
  const images = resolveFleetGallery(item, index);
  const specs = parseSpecs(item);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full rounded-[8px] border-line-soft bg-surface/50 justify-between">
          Ver unidad
          <ChevronRight />
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-panel-strong max-h-[90vh] max-w-5xl overflow-y-auto rounded-[8px] border-line-soft bg-surface px-0 py-0 text-foreground">
        <div className="grid lg:grid-cols-[minmax(0,1.12fr)_minmax(320px,0.88fr)]">
          <div className="grid gap-3 p-4 md:p-6">
            <img src={images[0]} alt={`Vista principal de ${item.name}`} className="h-[360px] w-full rounded-[8px] object-cover" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {images.slice(1).map((image, imageIndex) => (
                <img
                  key={`${item.id}-${imageIndex}`}
                  src={image}
                  alt={`Galería ${imageIndex + 2} de ${item.name}`}
                  loading="lazy"
                  className="h-32 w-full rounded-[8px] object-cover"
                />
              ))}
            </div>
          </div>

          <div className="border-t border-line-soft p-6 lg:border-l lg:border-t-0 md:p-8">
            <DialogHeader>
              <p className="text-sm uppercase tracking-[0.24em] text-brand">{item.brand ?? "Turismo Galaxy"}</p>
              <DialogTitle className="font-display mt-3 text-4xl text-foreground">{item.name}</DialogTitle>
              <DialogDescription className="mt-3 text-sm leading-6 text-muted-foreground">
                {item.description ?? "Configuración ejecutiva con enfoque en imagen, confort y desempeño en trayectos de media y larga distancia."}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="glass-panel rounded-[8px] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-brand">Capacidad</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{item.passenger_capacity ?? "N/D"}</p>
              </div>
              <div className="glass-panel rounded-[8px] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-brand">Unidad</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{item.unit_number ?? item.code}</p>
              </div>
            </div>

            <div className="mt-8">
              <p className="text-sm uppercase tracking-[0.22em] text-brand">Amenidades</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(item.amenities.length > 0 ? item.amenities : ["A/C", "Audio y video", "Iluminación ambiental", "Asientos reclinables"]).map((amenity) => (
                  <span key={amenity} className="rounded-[8px] border border-line-soft px-3 py-2 text-xs text-muted-foreground">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            {specs.length > 0 ? (
              <div className="mt-8">
                <p className="text-sm uppercase tracking-[0.22em] text-brand">Especificaciones</p>
                <div className="mt-4 grid gap-3">
                  {specs.map((spec) => (
                    <div key={spec.label} className="glass-panel flex items-center justify-between rounded-[8px] p-4 text-sm">
                      <span className="text-muted-foreground">{spec.label}</span>
                      <span className="font-medium text-foreground">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function createFallbackGallery(gallery: GalleryRecord[]) {
  if (gallery.length > 0) {
    return gallery;
  }

  return [
    { id: "gallery-1", title: "Presencia en carretera", category: "Exterior", alt_text: "Autobús premium en carretera", image_url: fleetExteriorImage },
    { id: "gallery-2", title: "Interior ejecutivo", category: "Interior", alt_text: "Interior premium de autobús", image_url: fleetInteriorImage },
    { id: "gallery-3", title: "Confort superior", category: "Asientos", alt_text: "Asientos ejecutivos del autobús", image_url: fleetSeatsImage },
    { id: "gallery-4", title: "Recepción y atención", category: "Servicio", alt_text: "Equipo de atención Turismo Galaxy", image_url: aboutImage },
    { id: "gallery-5", title: "Salidas corporativas", category: "Operación", alt_text: "Autobús para grupo corporativo", image_url: heroImage },
    { id: "gallery-6", title: "Imagen premium", category: "Marca", alt_text: "Unidad de lujo Turismo Galaxy", image_url: fleetExteriorImage },
  ] as GalleryRecord[];
}

function resolveGalleryImage(item: Pick<GalleryRecord, "image_url">, index: number) {
  const fallback = [fleetExteriorImage, fleetInteriorImage, fleetSeatsImage, aboutImage, heroImage];
  return item.image_url || fallback[index % fallback.length];
}

function resolveFleetCover(item: FleetRecord, index: number) {
  return item.hero_image_url || resolveFleetGallery(item, index)[0];
}

function resolveFleetGallery(item: FleetRecord, index: number) {
  const fallbackSets = [
    [fleetExteriorImage, fleetInteriorImage, fleetSeatsImage],
    [heroImage, fleetExteriorImage, fleetInteriorImage],
    [fleetSeatsImage, aboutImage, fleetExteriorImage],
  ];

  const seeded = [item.hero_image_url, ...(item.gallery_urls ?? [])].filter(Boolean) as string[];
  if (seeded.length >= 3) {
    return seeded.slice(0, 6);
  }

  return Array.from(new Set([...seeded, ...fallbackSets[index % fallbackSets.length]])).slice(0, 6);
}

function parseSpecs(item: FleetRecord) {
  if (!item.specs || typeof item.specs !== "object" || Array.isArray(item.specs)) {
    return [] as Array<{ label: string; value: string }>;
  }

  return Object.entries(item.specs)
    .filter(([, value]) => value !== null && value !== "")
    .slice(0, 6)
    .map(([label, value]) => ({ label: startCase(label), value: String(value) }));
}

function startCase(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) {
    return "52";
  }
  return digits.startsWith("52") ? digits : `52${digits}`;
}

function normalizeTel(value: string) {
  return value.replace(/\s+/g, "").replace(/[()\-]/g, "");
}
