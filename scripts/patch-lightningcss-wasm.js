// Ensure Lightning CSS WASM pkg is available where @tailwindcss/node expects it.
// Copies node_modules/lightningcss-wasm/pkg → node_modules/lightningcss/pkg if missing.
const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  for (const entry of fs.readdirSync(src)) {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  const lightningcssDir = path.join(process.cwd(), 'node_modules', 'lightningcss');
  const wasmDir = path.join(process.cwd(), 'node_modules', 'lightningcss-wasm');
  const targetPkg = path.join(lightningcssDir, 'pkg');
  const sourcePkg = path.join(wasmDir, 'pkg');

  if (!fs.existsSync(lightningcssDir) || !fs.existsSync(wasmDir)) {
    process.exit(0);
  }

  if (!fs.existsSync(targetPkg) && fs.existsSync(sourcePkg)) {
    copyDir(sourcePkg, targetPkg);
    console.log('Patched lightningcss to include WASM pkg folder');
  }
} catch (err) {
  // Best-effort; don't fail install
}


