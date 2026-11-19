/** @jest-environment node */
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * Server Actions are bound in server components and handed to client components ready to use.
 * Binding one inside a "use client" module made the no-JavaScript submission hang in `next dev`
 * (the response never arrives; the render loop finally kills the dev server with
 * `RangeError: Map maximum size exceeded`), so this test refuses that pattern anywhere.
 */
const SRC = join(__dirname, "..");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

/** The names a module imports from any `@/app/**\/actions` module. */
function importedActionNames(source: string): string[] {
  const names: string[] = [];
  for (const match of source.matchAll(/import\s*\{([^}]*)\}\s*from\s*["']@\/app\/[^"']*actions["']/g)) {
    for (const part of match[1].split(",")) {
      const name = part
        .trim()
        .split(/\s+as\s+/)
        .pop();
      if (name && !name.startsWith("type ")) names.push(name);
    }
  }
  return names;
}

/** Client modules that call `.bind(` on an imported Server Action, with the action names. */
function clientBindings(files: string[]): string[] {
  return files.flatMap((file) => {
    const source = readFileSync(file, "utf8");
    if (!/^\s*["']use client["']/.test(source)) return [];
    const bound = importedActionNames(source).filter((name) => source.includes(`${name}.bind(`));
    return bound.length > 0 ? [`${relative(SRC, file).replaceAll("\\", "/")}: ${bound.join(", ")}`] : [];
  });
}

describe("Server Action binding", () => {
  it("never binds a Server Action inside a client component", () => {
    expect(clientBindings(sourceFiles(SRC))).toEqual([]);
  });
});
