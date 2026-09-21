import type { Point } from "./dsa";

export interface Place {
  id: string;
  name: string;
  area: string;
  point: Point;
}

/** City map of known pickup / drop points (grid coordinates feed the real DSA). */
export const PLACES: Place[] = [
  { id: "central", name: "Central Station", area: "City Centre", point: { x: 2, y: 3 } },
  { id: "airport", name: "International Airport", area: "North Ring", point: { x: 18, y: 4 } },
  { id: "techpark", name: "Tech Park Phase 2", area: "IT Corridor", point: { x: 10, y: 8 } },
  { id: "mall", name: "Grand City Mall", area: "MG Road", point: { x: 7, y: 12 } },
  { id: "hospital", name: "Apollo Hospital", area: "East Avenue", point: { x: 14, y: 11 } },
  { id: "university", name: "University Campus", area: "Knowledge Park", point: { x: 4, y: 15 } },
  { id: "stadium", name: "City Stadium", area: "Sports Complex", point: { x: 16, y: 17 } },
  { id: "beach", name: "Marina Beach Road", area: "Sea Front", point: { x: 20, y: 9 } },
  { id: "market", name: "Old Town Market", area: "Heritage Zone", point: { x: 6, y: 5 } },
  { id: "busstand", name: "Inter-City Bus Stand", area: "West Gate", point: { x: 12, y: 2 } },
];

export const PLACE_BY_ID: Record<string, Place> = PLACES.reduce(
  (acc, p) => {
    acc[p.id] = p;
    return acc;
  },
  {} as Record<string, Place>,
);

export function placeLabel(p: Place) {
  return `${p.name} · ${p.area}`;
}
