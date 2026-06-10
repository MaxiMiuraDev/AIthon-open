import { loadPois, loadRutas, loadClima } from "../lib/data";

function validate(name: string, loader: () => unknown): boolean {
  try {
    const data = loader();
    const count = Array.isArray(data) ? ` (${(data as unknown[]).length} items)` : "";
    console.log(`  ✓ ${name}${count}`);
    return true;
  } catch (err) {
    console.error(`  ✗ ${name}: ${String(err)}`);
    return false;
  }
}

console.log("Validando data/*.json contra schemas Zod...\n");

const results = [
  validate("pois.json", loadPois),
  validate("rutas.json", loadRutas),
  validate("clima.json", loadClima),
];

const allPassed = results.every(Boolean);

console.log(allPassed ? "\nTodo OK." : "\nHay errores en los datos.");
process.exit(allPassed ? 0 : 1);
