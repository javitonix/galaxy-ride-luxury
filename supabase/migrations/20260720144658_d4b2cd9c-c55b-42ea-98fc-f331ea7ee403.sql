CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.fleet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  brand TEXT,
  unit_number TEXT,
  passenger_capacity INTEGER,
  description TEXT,
  amenities TEXT[] NOT NULL DEFAULT '{}',
  specs JSONB NOT NULL DEFAULT '{}'::jsonb,
  hero_image_url TEXT,
  gallery_urls TEXT[] NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.fleet TO anon;
GRANT SELECT ON public.fleet TO authenticated;
GRANT ALL ON public.fleet TO service_role;
ALTER TABLE public.fleet ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fleet is publicly readable" ON public.fleet FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  alt_text TEXT,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_items TO anon;
GRANT SELECT ON public.gallery_items TO authenticated;
GRANT ALL ON public.gallery_items TO service_role;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gallery is publicly readable" ON public.gallery_items FOR SELECT TO anon, authenticated USING (is_published = true);

CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_role TEXT,
  quote TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5,
  avatar_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon;
GRANT SELECT ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Testimonials are publicly readable" ON public.testimonials FOR SELECT TO anon, authenticated USING (is_published = true);

CREATE TABLE public.office_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  email TEXT,
  phone_numbers TEXT[] NOT NULL DEFAULT '{}',
  whatsapp_number TEXT,
  map_label TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.office_locations TO anon;
GRANT SELECT ON public.office_locations TO authenticated;
GRANT ALL ON public.office_locations TO service_role;
ALTER TABLE public.office_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Office locations are publicly readable" ON public.office_locations FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.contact_information (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL UNIQUE,
  email TEXT,
  website_url TEXT,
  primary_phone TEXT,
  secondary_phone TEXT,
  support_copy TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.contact_information TO anon;
GRANT SELECT ON public.contact_information TO authenticated;
GRANT ALL ON public.contact_information TO service_role;
ALTER TABLE public.contact_information ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Contact information is publicly readable" ON public.contact_information FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.social_media_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  url TEXT,
  handle TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.social_media_links TO anon;
GRANT SELECT ON public.social_media_links TO authenticated;
GRANT ALL ON public.social_media_links TO service_role;
ALTER TABLE public.social_media_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Social links are publicly readable" ON public.social_media_links FOR SELECT TO anon, authenticated USING (true);

CREATE TRIGGER set_fleet_updated_at BEFORE UPDATE ON public.fleet FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_gallery_items_updated_at BEFORE UPDATE ON public.gallery_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_testimonials_updated_at BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_office_locations_updated_at BEFORE UPDATE ON public.office_locations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_contact_information_updated_at BEFORE UPDATE ON public.contact_information FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_social_media_links_updated_at BEFORE UPDATE ON public.social_media_links FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.fleet (code, name, brand, unit_number, passenger_capacity, description, amenities, specs, sort_order, is_featured)
VALUES
  ('irizar-i8-17', 'IRIZAR i8 17', 'Irizar', '17', 53, 'Autobús premium para grupos grandes con interior ejecutivo y distribución pensada para recorridos turísticos de alto confort.', ARRAY['Seguro de viajero','2 puertas de acceso','7 pantallas','WC','Asiento guía','Aire acondicionado','Calefacción','Nevera','Cafetera','Asientos reclinables','Salidas de emergencia','Piso tipo duela','2 ventilas superiores'], jsonb_build_object('doors', 2, 'screens', 7, 'wc', true, 'guideSeat', true), 1, true),
  ('irizar-i8-16', 'IRIZAR i8 16', 'Irizar', '16', 53, 'Unidad ejecutiva de lujo para traslados turísticos con atmósfera silenciosa, servicio cómodo y acabados premium.', ARRAY['Seguro de viajero','2 puertas de acceso','7 pantallas','WC','Asiento guía','Aire acondicionado','Calefacción','Nevera','Cafetera','Asientos reclinables','Salidas de emergencia','Piso tipo duela','2 ventilas superiores'], jsonb_build_object('doors', 2, 'screens', 7, 'wc', true, 'guideSeat', true), 2, true),
  ('volvo-15', 'VOLVO 15', 'Volvo', '15', 62, 'Doble piso de gran capacidad para grupos numerosos, ideal para experiencias de viaje premium con entretenimiento a bordo.', ARRAY['Seguro de viajero','Planta alta 54 asientos','Planta baja 12 asientos','Letrero exterior digital','1 puerta de acceso','Entrada USB','64 pantallas LCD táctil','Acceso a películas','Videojuegos','Aire acondicionado','Calefacción','Nevera','Cafetera','Asientos cómodos reclinables','Salida de emergencia','Piso antiderrapante','WC planta alta y baja','Conectores para celular','Asiento de guía'], jsonb_build_object('upperDeckSeats', 54, 'lowerDeckSeats', 12, 'usb', true, 'screens', 64, 'doubleDeck', true), 3, true),
  ('bus-star-14', 'BUS STAR 14', 'Bus Star', '14', 64, 'La unidad de mayor capacidad de la flotilla, diseñada para operaciones turísticas que exigen presencia, espacio y confort.', ARRAY['Seguro de viajero','Planta alta 46 asientos','Planta baja 18 asientos','Letrero exterior digital','1 puerta de acceso','Entrada USB','64 pantallas LCD táctil','Acceso a películas','Videojuegos','Aire acondicionado','Calefacción','Nevera','Cafetera','Asientos cómodos reclinables','Salida de emergencia','Piso antiderrapante','WC planta alta y baja','Conectores para celular','Asiento de guía'], jsonb_build_object('upperDeckSeats', 46, 'lowerDeckSeats', 18, 'usb', true, 'screens', 64, 'doubleDeck', true), 4, true),
  ('busscar-13', 'BUSSCAR 13', 'Busscar', '13', 59, 'Unidad doble piso con enfoque turístico, equipada para trayectos largos con amenidades pensadas para una experiencia distinguida.', ARRAY['Seguro de viajero','Planta alta 46 asientos','Planta baja 13 asientos','Letrero exterior digital','1 puerta de acceso','CD/USB','2 WC','59 pantallas LCD táctil','Acceso a películas','Videojuegos','Libros','Aire acondicionado','Calefacción','Cafetera','Asientos cómodos reclinables','Salida de emergencia','Piso antiderrapante','Conectores para celular','Asiento de guía','3 ventilas superiores'], jsonb_build_object('upperDeckSeats', 46, 'lowerDeckSeats', 13, 'screens', 59, 'doubleDeck', true, 'wcCount', 2), 5, true),
  ('irizar-i8-12', 'IRIZAR i8 12', 'Irizar', '12', 53, 'Autobús ejecutivo con presencia contemporánea, cómodo para rutas nacionales y grupos que priorizan seguridad y estilo.', ARRAY['Seguro de viajero','Letrero exterior digital','Conectores para celular','2 puertas de acceso','WC','Asiento guía','CD/USB','52 pantallas LCD','Aire acondicionado','Calefacción','Nevera','Cafetera','Asientos reclinables','Ventanas inastillables','8 salidas de emergencia','Piso tipo duela','2 ventilas superiores','Portabultos tipo avión'], jsonb_build_object('doors', 2, 'screens', 52, 'usb', true, 'emergencyExits', 8), 6, false),
  ('irizar-i6-11', 'IRIZAR i6 11', 'Irizar', '11', 49, 'Unidad versátil para grupos medianos, con equipamiento ejecutivo y detalles de confort para viajes turísticos y corporativos.', ARRAY['Seguro de viajero','Letrero exterior digital','2 puertas de acceso','WC','Asiento guía','CD','49 conectores 110v','2 USB por mancuerna','5 pantallas HD','Aire acondicionado','Asientos reclinables','Calefacción','Nevera','Cafetera','Porta vaso individual','Salidas de emergencia','Piso tipo duela','2 ventilas superiores','Portabultos tipo avión'], jsonb_build_object('doors', 2, 'screens', 5, 'power110v', true, 'usbDualPerSeatPair', true), 7, false),
  ('volvo-campione-dd-10', 'VOLVO CAMPIONE DD 10', 'Volvo', '10', 58, 'Doble piso premium con ambiente sofisticado y equipamiento pensado para recorridos de larga duración con máximo confort.', ARRAY['Seguro de viajero','Planta alta 46 asientos','Planta baja 12 asientos','Letrero exterior digital','2 puertas de acceso','58 pantallas LCD táctil','Acceso a películas','Videojuegos','Aire acondicionado','Calefacción','Cafetera','Asientos cómodos reclinables','Salida de emergencia','Piso antiderrapante','2 ventilas superiores','WC','Asiento de guía','Descansa pies planta baja','Cargadores asiento 10v'], jsonb_build_object('upperDeckSeats', 46, 'lowerDeckSeats', 12, 'screens', 58, 'doubleDeck', true, 'seatChargers', true), 8, false),
  ('volvo-campione-dd-09', 'VOLVO CAMPIONE DD 09', 'Volvo', '09', 58, 'Unidad doble piso enfocada en viajes premium, con amenidades completas y soluciones de entretenimiento para grupos turísticos.', ARRAY['Seguro de viajero','Planta alta 46 asientos','Planta baja 12 asientos','Letrero exterior digital','2 puertas de acceso','CD','58 pantallas LCD táctil','Acceso a películas','Videojuegos','Libros','Aire acondicionado','Calefacción','Cafetera','Asientos cómodos reclinables','Salida de emergencia','Piso antiderrapante','2 ventilas superiores','2 WC','Asiento de guía','Descansa pies planta baja'], jsonb_build_object('upperDeckSeats', 46, 'lowerDeckSeats', 12, 'screens', 58, 'doubleDeck', true, 'wcCount', 2), 9, false),
  ('man-08', 'MAN 08', 'MAN', '08', 56, 'Doble piso funcional y confortable para grupos grandes, con amenidades esenciales para traslados turísticos confiables.', ARRAY['Seguro de viajero','Planta alta 46 asientos','Planta baja 10 asientos','Descansa pies','2 puertas de acceso','Aire acondicionado','Calefacción','Cafetera','Salidas de emergencia','WC','Piso antiderrapante','Asiento guía','3 pantallas LCD planta alta','1 pantalla planta baja'], jsonb_build_object('upperDeckSeats', 46, 'lowerDeckSeats', 10, 'screensUpper', 3, 'screensLower', 1, 'doubleDeck', true), 10, false)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.office_locations (name, city, address, email, phone_numbers, whatsapp_number, map_label, sort_order)
VALUES
  ('Querétaro', 'Querétaro', 'Calle Hidalgo #189 C, Col. Niños Héroes, Querétaro, Querétaro', 'turismogalaxyqro@gmail.com', ARRAY['4611007274','4612109869','4426429990'], '4611007274', 'Oficinas Querétaro', 1),
  ('Celaya', 'Celaya', 'Av. Irrigación No. 137 Local #2, Col. Emiliano Zapata, Celaya, Guanajuato', 'turismocontreras@hotmail.com', ARRAY['4616131436','4612109868','4611985878','4611401157'], '4616131436', 'Oficinas Celaya', 2),
  ('Tarimoro', 'Tarimoro', 'Calle Ocampo #1B Planta Alta, Col. Centro, Tarimoro, Guanajuato', 'sutt-urbanoyturistico@hotmail.com', ARRAY['4666640730','4612816253','4661092559','4661108779','4775634536'], '4666640730', 'Oficinas Tarimoro', 3)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.contact_information (label, email, website_url, primary_phone, secondary_phone, support_copy)
VALUES
  ('Principal', 'turismogalaxyqro@gmail.com', 'https://www.turismogalaxy.com.mx', '4426429990', '4616131436', 'Atención personalizada para viajes turísticos premium, cotizaciones y seguimiento comercial.')
ON CONFLICT (label) DO NOTHING;

INSERT INTO public.social_media_links (platform, label, url, handle, sort_order)
VALUES
  ('facebook', 'Turismo Galaxy', NULL, 'Turismo Galaxy', 1),
  ('website', 'Sitio Web', 'https://www.turismogalaxy.com.mx', 'turismogalaxy.com.mx', 2)
ON CONFLICT (platform) DO NOTHING;