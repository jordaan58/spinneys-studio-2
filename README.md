# Spinneys Studio 2.0 — Foundation release

Modular, dependency-free mobile-first web app. No build tools, no CDN and no service worker (deliberate: prevents stale code during iteration). Compatible with GitHub Pages when hosted over HTTPS.

## Deploy
Upload the **contents** of this folder to the root of a GitHub Pages repository (index.html, manifest.webmanifest, src/, assets/). In repository Settings > Pages choose Deploy from branch, main, /(root). Open the HTTPS URL in Chrome on the phone. Replacing the previous single-file v25 app requires uploading the new src/ and assets/ directories too.

## Modules
- `src/config.js`: packaging templates, required angles, barcode normalization.
- `src/storage.js`: IndexedDB persistence for photos and draft session.
- `src/scanner.js`: isolated optional native BarcodeDetector camera scanner; unsupported browsers use manual entry. Does not interact with photography camera.
- `src/export.js`: per-angle JPEG downloads and JSON manifest.
- `src/app.js`: workflow and UI state.
- `src/styles.css`: branded mobile UI.

## Implemented
Barcode manual entry and normalization; optional BarcodeDetector scanner (only where supported); packaging templates; native device camera/photo selection; individual angle retakes; photo reuse across angles; required angle N/A; manual dimensions; draft autosave in IndexedDB; review; per-angle downloads and manifest; reset; installable web manifest.

## Not implemented / important limitations
Automatic barcode scanning is **not guaranteed** on Galaxy S23 Chrome; BarcodeDetector availability varies. No external ZXing dependency is bundled. Barcode scan reliability is not verified on device. Native camera capture is via `<input type=file capture=environment>` (browser/device dependent), not an embedded live camera preview. No AR/LiDAR, offline service-worker cache, secure login, SharePoint sync, cloud backups, batch ZIP export or role access. Browser IndexedDB may be cleared, particularly in Incognito; use normal Chrome for persistence. Downloading many files may require allowing multiple downloads. Avoid confidential company data on public GitHub Pages.

## Acceptance checks
1. On HTTPS, enter 000212345678901 -> normalized product code 21234 (after leading-zero removal, 12-digit scale label rule).
2. Select packaging and confirm checklist changes.
3. Capture Front and Back using phone camera, retake Front, and confirm Back remains.
4. Reuse Front for another angle and confirm both export as separate filenames.
5. Mark a required angle N/A and confirm review reflects it.
6. Reload in normal Chrome and verify saved draft/photos.
7. Download photos and verify names; reset and verify session cleared.
8. Optional scanner: if BarcodeDetector supported, confirm recognition; if not, manual entry works.
