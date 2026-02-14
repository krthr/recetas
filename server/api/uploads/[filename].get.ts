export default defineEventHandler(async (event) => {
  const filename = getRouterParam(event, "filename");

  if (!filename) {
    throw createError({ statusCode: 400, statusMessage: "Nombre de archivo requerido" });
  }

  if (filename.includes("..") || filename.includes("/")) {
    throw createError({ statusCode: 400, statusMessage: "Nombre de archivo inválido" });
  }

  const storage = useStorage("uploads");
  const file = await storage.getItemRaw(filename);

  if (!file) {
    throw createError({ statusCode: 404, statusMessage: "Archivo no encontrado" });
  }

  const ext = filename.split(".").pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
  };

  setResponseHeader(
    event,
    "Content-Type",
    mimeTypes[ext || ""] || "application/octet-stream"
  );
  setResponseHeader(
    event,
    "Cache-Control",
    "public, max-age=31536000, immutable"
  );

  return file;
});
