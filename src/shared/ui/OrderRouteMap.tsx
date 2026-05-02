import { ExternalLink, MapPin, Navigation } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import { fromLonLat } from "ol/proj";
import { Circle, Fill, Stroke, Style } from "ol/style";
import { boundingExtent } from "ol/extent";
import "ol/ol.css";
import {
  buildOpenStreetMapDirectionsUrl,
  buildOpenStreetMapSearchUrl,
  geocodeAddress,
} from "../lib/geocoding";
import { Button } from "./Button";

type LatLngPoint = {
  lat: number;
  lng: number;
};

type OrderRouteMapProps = {
  address: string;
  mode?: "customer" | "courier";
};

const destinationStyle = new Style({
  image: new Circle({
    radius: 8,
    fill: new Fill({ color: "rgb(37 99 235)" }),
    stroke: new Stroke({ color: "white", width: 3 }),
  }),
});

const currentPositionStyle = new Style({
  image: new Circle({
    radius: 7,
    fill: new Fill({ color: "rgb(22 163 74)" }),
    stroke: new Stroke({ color: "white", width: 3 }),
  }),
});

const routeStyle = new Style({
  stroke: new Stroke({
    color: "rgb(37 99 235)",
    width: 4,
    lineDash: [10, 10],
  }),
});

export function OrderRouteMap({
  address,
  mode = "customer",
}: OrderRouteMapProps) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const [destination, setDestination] = useState<
    (LatLngPoint & { label: string }) | null
  >(null);
  const [currentPosition, setCurrentPosition] = useState<LatLngPoint | null>(
    null,
  );
  const [isGeocoding, setIsGeocoding] = useState(true);
  const [geocodeError, setGeocodeError] = useState("");
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    setIsGeocoding(true);
    setGeocodeError("");
    setDestination(null);

    void geocodeAddress(address, controller.signal)
      .then((point) => {
        if (!point) {
          setGeocodeError("Не удалось определить координаты по адресу.");
          return;
        }

        setDestination(point);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setGeocodeError("Не удалось загрузить карту по этому адресу.");
      })
      .finally(() => {
        setIsGeocoding(false);
      });

    return () => controller.abort();
  }, [address]);

  useEffect(() => {
    if (mode !== "courier" || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationError("");
      },
      () => {
        setLocationError(
          "Геолокация недоступна, поэтому показываем только адрес клиента.",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  }, [mode]);

  useEffect(() => {
    const mapTarget = mapElementRef.current;
    if (!mapTarget || !destination) return;

    const features: Feature[] = [];
    const destinationCoordinates = fromLonLat([destination.lng, destination.lat]);
    const destinationFeature = new Feature({
      geometry: new Point(destinationCoordinates),
    });
    destinationFeature.setStyle(destinationStyle);
    features.push(destinationFeature);

    let extent = boundingExtent([destinationCoordinates]);

    if (currentPosition) {
      const currentCoordinates = fromLonLat([
        currentPosition.lng,
        currentPosition.lat,
      ]);

      const currentPositionFeature = new Feature({
        geometry: new Point(currentCoordinates),
      });
      currentPositionFeature.setStyle(currentPositionStyle);
      features.push(currentPositionFeature);

      const routeFeature = new Feature({
        geometry: new LineString([currentCoordinates, destinationCoordinates]),
      });
      routeFeature.setStyle(routeStyle);
      features.push(routeFeature);

      extent = boundingExtent([currentCoordinates, destinationCoordinates]);
    }

    const vectorLayer = new VectorLayer({
      source: new VectorSource({
        features,
      }),
    });

    const nextMap = new Map({
      target: mapTarget,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vectorLayer,
      ],
      view: new View({
        center: destinationCoordinates,
        zoom: currentPosition ? 11 : 14,
      }),
      controls: [],
    });

    nextMap.getView().fit(extent, {
      padding: [32, 32, 32, 32],
      maxZoom: currentPosition ? 12 : 16,
      duration: 250,
    });

    mapRef.current = nextMap;

    return () => {
      nextMap.setTarget(undefined);
      mapRef.current = null;
    };
  }, [currentPosition, destination]);

  const externalUrl = destination
    ? buildOpenStreetMapDirectionsUrl(destination, currentPosition)
    : buildOpenStreetMapSearchUrl(address);

  return (
    <div className="mt-4 overflow-hidden rounded-[1.75rem] border border-custom-border bg-custom-surface-soft">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-custom-border px-4 py-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-custom-text">
            {mode === "courier" ? <Navigation size={16} /> : <MapPin size={16} />}
            {mode === "courier" ? "Маршрут до клиента" : "Точка доставки"}
          </div>
          <div className="mt-1 text-xs text-custom-text-muted">
            {mode === "courier"
              ? "Показываем адрес клиента и прямую линию от вашей текущей позиции, если геолокация доступна."
              : "Показываем место доставки на карте по адресу заказа."}
          </div>
        </div>

        <a href={externalUrl} target="_blank" rel="noreferrer">
          <Button type="button" variant="ghost" className="gap-2">
            <ExternalLink size={16} />
            Открыть в карте
          </Button>
        </a>
      </div>

      <div className="px-4 py-3">
        <div className="mb-3 text-xs text-custom-text-subtle">{address}</div>

        {locationError ? (
          <div className="mb-3 rounded-2xl border border-custom-warning/20 bg-custom-warning-soft px-3 py-2 text-xs text-custom-warning">
            {locationError}
          </div>
        ) : null}

        {isGeocoding ? (
          <div className="rounded-2xl border border-custom-border bg-custom-surface px-4 py-12 text-center text-sm text-custom-text-muted">
            Определяем координаты адреса...
          </div>
        ) : geocodeError ? (
          <div className="rounded-2xl border border-custom-danger/20 bg-custom-danger-soft px-4 py-4 text-sm text-custom-danger">
            {geocodeError}
          </div>
        ) : destination ? (
          <div
            ref={mapElementRef}
            className="order-route-map rounded-2xl border border-custom-border"
          />
        ) : null}
      </div>
    </div>
  );
}
