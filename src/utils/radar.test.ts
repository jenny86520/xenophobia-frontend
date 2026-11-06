import { RADAR_RINGS, radarPoint, radarPolygon, radarRings, radarScale, toPoints } from "./radar";

describe("radarPoint", () => {
  it("starts straight up and goes clockwise", () => {
    expect(radarPoint(0, 4, 1, 200)).toEqual({ x: 100, y: 0 });
    expect(radarPoint(1, 4, 1, 200)).toEqual({ x: 200, y: 100 });
    expect(radarPoint(2, 4, 1, 200)).toEqual({ x: 100, y: 200 });
  });

  it("puts a zero at the centre", () => {
    expect(radarPoint(3, 7, 0, 200)).toEqual({ x: 100, y: 100 });
  });
});

describe("radarPolygon", () => {
  it("keeps every axis at the centre when nobody has won", () => {
    const values = [0, 0, 0];
    expect(radarScale(values)).toBe(1);
    expect(radarPolygon(values, radarScale(values), 100)).toEqual([
      { x: 50, y: 50 },
      { x: 50, y: 50 },
      { x: 50, y: 50 },
    ]);
  });

  it("puts the largest value on the outer ring and the rest in proportion", () => {
    const values = [4, 2, 0, 0];
    const [first, second] = radarPolygon(values, radarScale(values), 200);
    expect(first).toEqual({ x: 100, y: 0 });
    expect(second).toEqual({ x: 150, y: 100 });
  });
});

describe("radarRings", () => {
  it("draws the rings from the outside in", () => {
    const rings = radarRings(4, 200);
    expect(rings).toHaveLength(RADAR_RINGS);
    expect(rings[0][0]).toEqual({ x: 100, y: 0 });
    expect(rings[RADAR_RINGS - 1][0]).toEqual({ x: 100, y: 75 });
  });
});

it("writes SVG points", () => {
  expect(toPoints([{ x: 1, y: 2 }, { x: 3.5, y: 4 }])).toBe("1,2 3.5,4");
});
