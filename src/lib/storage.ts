import { storage, isFirebaseConfigured } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Compresses an image file in browser to maximum 1200px width/height for fast field sync
 */
export async function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const elem = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        elem.width = width;
        elem.height = height;
        const ctx = elem.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(elem.toDataURL('image/jpeg', 0.82));
        } else {
          resolve(img.src);
        }
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Uploads a hazard survey photo to Firebase Storage if available, else returns Base64 data URL
 */
export async function uploadHazardPhoto(file: File, hazardId: string): Promise<string> {
  const base64Data = await compressImageFile(file);

  if (isFirebaseConfigured && storage) {
    try {
      const storageRef = ref(storage, `hazard-photos/${hazardId}-${Date.now()}.jpg`);
      // Convert base64 data to blob
      const res = await fetch(base64Data);
      const blob = await res.blob();
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (err) {
      console.warn('Firebase storage upload failed, storing base64 locally', err);
    }
  }

  return base64Data;
}
