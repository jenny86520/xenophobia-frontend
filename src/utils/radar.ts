/**
 * Geometry for the veto radar: one axis per map, starting straight up and going clockwise, on a
 * square drawing of `size` with the centre in the middle. Pure presentation: the values come from
 * the backend; this only places them.
 */

export type Point = { x: number; y: number };

export const RADAR_RINGS = 4;

/** Where axis `index` of `count` points at `ratio` (0 = centre, 1 = outer ring). */
export function radarPoint(index: number, count: number, ratio: number, size: number): Point {
  const radius = size / 2;
  const angle = -Math.PI / 2 + (2 * Math.PI * index) / count;
  return {
    x: round(radius + Math.cos(angle) * radius * ratio),
    y: round(radius + Math.sin(angle) * radius * ratio),
  };
}

/** The largest value shown, never below 1, so an all-zero radar stays at the centre. */
export function radarScale(values: number[]): number {
  return Math.max(1, ...values);
}

/** The polygon of one team: each axis at value ÷ scale. */
export function radarPolygon(values: number[], scale: number, size: number): Point[] {
  return values.map((value, i) => radarPoint(i, values.length, Math.min(value, scale) / scale, size));
}

/** The background rings (outer first), each a polygon through every axis. */
export function radarRings(count: number, size: number): Point[][] {
  return Array.from({ length: RADAR_RINGS }, (_, ring) =>
    Array.from({ length: count }, (__, i) => radarPoint(i, count, (RADAR_RINGS - ring) / RADAR_RINGS, size)),
  );
}

/** An SVG `points` attribute. */
export function toPoints(points: Point[]): string {
  return points.map((p) => `${p.x},${p.y}`).join(" ");
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
