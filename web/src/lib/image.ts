export const PHOTO_SIZE = 160;

/** Lê um arquivo de imagem, recorta para um quadrado e retorna um data URL JPEG. */
export function resizePhoto(file: File, size: number = PHOTO_SIZE): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Arquivo inválido"));
      return;
    }

    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const image = new Image();
      image.onerror = reject;
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = size;
        canvas.height = size;

        const side = Math.min(image.width, image.height);
        const sourceX = (image.width - side) / 2;
        const sourceY = (image.height - side) / 2;
        context?.drawImage(image, sourceX, sourceY, side, side, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
