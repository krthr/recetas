import { randomUUID } from "node:crypto";

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event);

  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, statusMessage: "No se subió ningún archivo" });
  }

  const file = formData.find((part) => part.name === "image");

  if (!file || !file.data || !file.type?.startsWith("image/")) {
    throw createError({
      statusCode: 400,
      statusMessage: "Se requiere un archivo de imagen válido",
    });
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Solo se permiten imágenes JPEG, PNG o WebP",
    });
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.data.length > maxSize) {
    throw createError({
      statusCode: 413,
      statusMessage: "El archivo es muy grande. Máximo 5MB.",
    });
  }

  const ext = file.filename?.split(".").pop() || "jpg";
  const filename = `${randomUUID()}.${ext}`;

  const storage = useStorage("uploads");
  await storage.setItemRaw(filename, file.data);

  return { filename, url: `/api/uploads/${filename}` };
});
