/**
 * Utility to ensure any uploaded Social Share (OG) image is automatically
 * formatted to exact 1200 x 630 dimensions (1.91:1 ratio) with clean Scottish styling
 * before uploading to Firebase Storage.
 */
export async function formatOgImageToStandardDimensions(file: File): Promise<File> {
  return new Promise((resolve) => {
    // If not an image, return original
    if (!file.type.startsWith('image/')) {
      return resolve(file);
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        const targetW = 1200;
        const targetH = 630;

        // If image is already exactly 1200x630, keep as is
        if (img.width === targetW && img.height === targetH) {
          return resolve(file);
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return resolve(file);
        }

        // 1. Draw luxury Scottish Highland navy gradient background
        const grad = ctx.createLinearGradient(0, 0, 0, targetH);
        grad.addColorStop(0, '#0A1526');
        grad.addColorStop(0.5, '#0E1E38');
        grad.addColorStop(1, '#162C4E');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, targetW, targetH);

        // 2. Outer gold border frame
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 4;
        ctx.strokeRect(16, 16, targetW - 32, targetH - 32);

        ctx.strokeStyle = '#8C6D23';
        ctx.lineWidth = 1;
        ctx.strokeRect(22, 22, targetW - 44, targetH - 44);

        // 3. Scale and draw the uploaded image
        // If image is wider ratio than 1.91:1, fit by width/height
        const aspect = img.width / img.height;
        let drawW: number;
        let drawH: number;
        let drawX: number;
        let drawY: number;

        if (aspect >= 1.5 && aspect <= 2.2) {
          // Standard landscape banner - cover the inner area
          const innerW = targetW - 64;
          const innerH = targetH - 64;
          const innerAspect = innerW / innerH;
          
          if (aspect > innerAspect) {
            drawH = innerH;
            drawW = img.width * (innerH / img.height);
          } else {
            drawW = innerW;
            drawH = img.height * (innerW / img.width);
          }
          drawX = (targetW - drawW) / 2;
          drawY = (targetH - drawH) / 2;
          ctx.drawImage(img, drawX, drawY, drawW, drawH);
        } else {
          // Square or portrait photo - fit photo neatly with rounded frame
          const maxDim = 500;
          let photoW: number;
          let photoH: number;
          if (img.width > img.height) {
            photoW = maxDim;
            photoH = img.height * (maxDim / img.width);
          } else {
            photoH = maxDim;
            photoW = img.width * (maxDim / img.height);
          }
          drawX = (targetW - photoW) / 2;
          drawY = (targetH - photoH) / 2;

          ctx.save();
          ctx.shadowColor = 'rgba(0,0,0,0.6)';
          ctx.shadowBlur = 24;
          ctx.shadowOffsetY = 8;
          ctx.drawImage(img, drawX, drawY, photoW, photoH);
          ctx.restore();

          // Border around photo
          ctx.strokeStyle = '#E5C158';
          ctx.lineWidth = 3;
          ctx.strokeRect(drawX, drawY, photoW, photoH);
        }

        // Convert canvas to File
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const formattedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, "") + "_1200x630.jpg",
                { type: 'image/jpeg' }
              );
              resolve(formattedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.92
        );
      };

      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };

    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
