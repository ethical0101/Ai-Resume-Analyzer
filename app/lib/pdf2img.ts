export interface PdfConversionResult {
    imageUrl: string;
    file: File | null;
    error?: string;
}

let pdfjsLib: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

// Try to resolve a proper worker URL for PDF.js across environments (Vite/dev/prod/subpaths)
let resolvedWorkerSrc: string | null = null;

async function resolveWorkerSrc(): Promise<string> {
    if (resolvedWorkerSrc) return resolvedWorkerSrc;

    // 1) Try to use bundled worker via Vite '?url' import if available
    try {
        // @ts-ignore - Vite asset import
        const workerUrl: string = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
        if (typeof workerUrl === "string" && workerUrl.length > 0) {
            resolvedWorkerSrc = workerUrl;
            return resolvedWorkerSrc;
        }
    } catch {}

    // 2) Fall back to public asset at root (works if app served at domain root)
    const rootPath = "/pdf.worker.min.mjs";
    try {
        // Attempt a HEAD request to check availability (in browser only)
        if (typeof fetch !== "undefined") {
            const res = await fetch(rootPath, { method: "HEAD" });
            if (res.ok) {
                resolvedWorkerSrc = rootPath;
                return resolvedWorkerSrc;
            }
        }
    } catch {}

    // 3) Final fallback to CDN (pinned version to avoid breaking changes)
    resolvedWorkerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.6.82/pdf.worker.min.mjs";
    return resolvedWorkerSrc;
}

async function loadPdfJs(): Promise<any> {
    if (pdfjsLib) return pdfjsLib;
    if (loadPromise) return loadPromise;

    isLoading = true;
    // Use legacy/build to maximize compatibility across bundlers
    loadPromise = import("pdfjs-dist/legacy/build/pdf.mjs").then(async (lib) => {
        const workerSrc = await resolveWorkerSrc();
        lib.GlobalWorkerOptions.workerSrc = workerSrc;
        pdfjsLib = lib;
        isLoading = false;
        return lib;
    });

    return loadPromise;
}

export async function convertPdfToImage(
    file: File
): Promise<PdfConversionResult> {
    try {
        if (typeof window === "undefined" || typeof document === "undefined") {
            return {
                imageUrl: "",
                file: null,
                error: "PDF to image conversion must run in the browser."
            };
        }
        const lib = await loadPdfJs();

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);

        const viewport = page.getViewport({ scale: 4 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (context) {
            context.imageSmoothingEnabled = true;
            context.imageSmoothingQuality = "high";
        }

        await page.render({ canvasContext: context!, viewport }).promise;

        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        // Create a File from the blob with the same name as the pdf
                        const originalName = file.name.replace(/\.pdf$/i, "");
                        const imageFile = new File([blob], `${originalName}.png`, {
                            type: "image/png",
                        });

                        resolve({
                            imageUrl: URL.createObjectURL(blob),
                            file: imageFile,
                        });
                    } else {
                        resolve({
                            imageUrl: "",
                            file: null,
                            error: "Failed to create image blob",
                        });
                    }
                },
                "image/png",
                1.0
            ); // Set quality to maximum (1.0)
        });
    } catch (err) {
        return {
            imageUrl: "",
            file: null,
            error: `Failed to convert PDF: ${err}`,
        };
    }
}