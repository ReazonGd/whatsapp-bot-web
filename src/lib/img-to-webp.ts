// imageConverter.ts
import sharp from "sharp";
// import { promises as fs } from "fs";
// import path from "path";

interface ConversionOptions {
  quality?: number; // 1-100, default 80
  lossless?: boolean; // true for lossless compression
  effort?: number; // 0-6, default 4 (compression effort)
  width?: number; // resize width
  height?: number; // resize height
  fit?: "cover" | "contain" | "fill" | "inside" | "outside"; // resize fit method
}

interface ConversionResult {
  success: boolean;
  buffer?: Buffer;
  base64?: string;
  size?: number;
  width?: number;
  height?: number;
  format?: string;
  error?: string;
}

const defaultOptions: ConversionOptions = {
  quality: 80,
  lossless: false,
  effort: 4,
};

/**
 * Convert image buffer to WebP
 */
export async function convertBufferToWebP(inputBuffer: Buffer, options: ConversionOptions = {}): Promise<ConversionResult> {
  try {
    const mergedOptions = { ...defaultOptions, ...options };

    // Validate input buffer
    if (!Buffer.isBuffer(inputBuffer) || inputBuffer.length === 0) {
      throw new Error("Invalid input buffer");
    }

    let sharpInstance = sharp(inputBuffer);

    // Get original image metadata
    // const metadata = await sharpInstance.metadata();

    // Apply resize if specified
    if (mergedOptions.width || mergedOptions.height) {
      sharpInstance = sharpInstance.resize({
        width: mergedOptions.width,
        height: mergedOptions.height,
        fit: mergedOptions.fit || "cover",
        background: "#00000000",
        withoutEnlargement: true,
      });
    }

    // Convert to WebP
    const webpOptions: any = {
      effort: mergedOptions.effort,
    };

    if (mergedOptions.lossless) {
      webpOptions.lossless = true;
    } else {
      webpOptions.quality = mergedOptions.quality;
    }

    const outputBuffer = await sharpInstance.webp(webpOptions).toBuffer();

    // Get output metadata
    const outputMetadata = await sharp(outputBuffer).metadata();

    return {
      success: true,
      buffer: outputBuffer,
      size: outputBuffer.length,
      width: outputMetadata.width,
      height: outputMetadata.height,
      format: "webp",
    };
  } catch (error) {
    console.error("Error converting buffer to WebP:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// /**
//  * Convert base64 image to WebP
//  */
// export async function convertBase64ToWebP(base64Input: string, options: ConversionOptions = {}): Promise<ConversionResult> {
//   try {
//     // Remove data URL prefix if present
//     const base64Clean = base64Input.replace(/^data:image\/[a-z]+;base64,/, "");

//     // Convert base64 to buffer
//     const inputBuffer = Buffer.from(base64Clean, "base64");

//     // Use buffer conversion method
//     const result = await convertBufferToWebP(inputBuffer, options);

//     if (result.success && result.buffer) {
//       // Add base64 output
//       result.base64 = result.buffer.toString("base64");
//     }

//     return result;
//   } catch (error) {
//     console.error("Error converting base64 to WebP:", error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "Unknown error",
//     };
//   }
// }

// /**
//  * Convert base64 to WebP and return as data URL
//  */
// export async function convertBase64ToWebPDataURL(base64Input: string, options: ConversionOptions = {}): Promise<string | null> {
//   try {
//     const result = await convertBase64ToWebP(base64Input, options);

//     if (result.success && result.base64) {
//       return `data:image/webp;base64,${result.base64}`;
//     }

//     return null;
//   } catch (error) {
//     console.error("Error converting to WebP data URL:", error);
//     return null;
//   }
// }

// /**
//  * Convert image file to WebP
//  */
// export async function convertFileToWebP(inputPath: string, outputPath?: string, options: ConversionOptions = {}): Promise<ConversionResult> {
//   try {
//     // Read input file
//     const inputBuffer = await fs.readFile(inputPath);

//     // Convert to WebP
//     const result = await convertBufferToWebP(inputBuffer, options);

//     if (result.success && result.buffer) {
//       // Save to file if output path provided
//       if (outputPath) {
//         await fs.writeFile(outputPath, result.buffer);
//       } else {
//         // Generate output path
//         const parsedPath = path.parse(inputPath);
//         const autoOutputPath = path.join(parsedPath.dir, `${parsedPath.name}.webp`);
//         await fs.writeFile(autoOutputPath, result.buffer);
//         console.log(`File saved to: ${autoOutputPath}`);
//       }
//     }

//     return result;
//   } catch (error) {
//     console.error("Error converting file to WebP:", error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "Unknown error",
//     };
//   }
// }

// /**
//  * Convert URL image to WebP
//  */
// export async function convertUrlToWebP(imageUrl: string, options: ConversionOptions = {}): Promise<ConversionResult> {
//   try {
//     const response = await fetch(imageUrl);

//     if (!response.ok) {
//       throw new Error(`Failed to fetch image: ${response.statusText}`);
//     }

//     const arrayBuffer = await response.arrayBuffer();
//     const inputBuffer = Buffer.from(arrayBuffer);

//     const result = await convertBufferToWebP(inputBuffer, options);

//     if (result.success && result.buffer) {
//       result.base64 = result.buffer.toString("base64");
//     }

//     return result;
//   } catch (error) {
//     console.error("Error converting URL to WebP:", error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "Unknown error",
//     };
//   }
// }

// /**
//  * Batch convert multiple images
//  */
// export async function convertBatchToWebP(
//   inputs: Array<{
//     buffer?: Buffer;
//     base64?: string;
//     filePath?: string;
//     url?: string;
//     name?: string;
//   }>,
//   options: ConversionOptions = {}
// ): Promise<Array<ConversionResult & { name?: string }>> {
//   const results: Array<ConversionResult & { name?: string }> = [];

//   for (let i = 0; i < inputs.length; i++) {
//     const input = inputs[i];

//     try {
//       let result: ConversionResult;

//       if (input.buffer) {
//         result = await convertBufferToWebP(input.buffer, options);
//       } else if (input.base64) {
//         result = await convertBase64ToWebP(input.base64, options);
//       } else if (input.filePath) {
//         result = await convertFileToWebP(input.filePath, undefined, options);
//       } else if (input.url) {
//         result = await convertUrlToWebP(input.url, options);
//       } else {
//         result = {
//           success: false,
//           error: "No valid input provided",
//         };
//       }

//       results.push({
//         ...result,
//         name: input.name || `image_${i + 1}`,
//       });
//     } catch (error) {
//       results.push({
//         success: false,
//         error: error instanceof Error ? error.message : "Unknown error",
//         name: input.name || `image_${i + 1}`,
//       });
//     }
//   }

//   return results;
// }

// /**
//  * Validate if input is a valid image
//  */
// export async function validateImage(input: Buffer | string): Promise<boolean> {
//   try {
//     let buffer: Buffer;

//     if (typeof input === "string") {
//       // Assume it's base64
//       const base64Clean = input.replace(/^data:image\/[a-z]+;base64,/, "");
//       buffer = Buffer.from(base64Clean, "base64");
//     } else {
//       buffer = input;
//     }

//     const metadata = await sharp(buffer).metadata();
//     return !!(metadata.width && metadata.height && metadata.format);
//   } catch (error) {
//     return false;
//   }
// }

// /**
//  * Get image information
//  */
// export async function getImageInfo(input: Buffer | string): Promise<any> {
//   try {
//     let buffer: Buffer;

//     if (typeof input === "string") {
//       const base64Clean = input.replace(/^data:image\/[a-z]+;base64,/, "");
//       buffer = Buffer.from(base64Clean, "base64");
//     } else {
//       buffer = input;
//     }

//     const metadata = await sharp(buffer).metadata();

//     return {
//       width: metadata.width,
//       height: metadata.height,
//       format: metadata.format,
//       size: buffer.length,
//       channels: metadata.channels,
//       density: metadata.density,
//       hasAlpha: metadata.hasAlpha,
//       isAnimated: metadata.pages && metadata.pages > 1,
//     };
//   } catch (error) {
//     console.error("Error getting image info:", error);
//     return null;
//   }
// }

// /**
//  * Compress image to specific file size (approximate)
//  */
// export async function compressToSize(input: Buffer | string, maxSizeKB: number, options: ConversionOptions = {}): Promise<ConversionResult> {
//   try {
//     let buffer: Buffer;

//     if (typeof input === "string") {
//       const base64Clean = input.replace(/^data:image\/[a-z]+;base64,/, "");
//       buffer = Buffer.from(base64Clean, "base64");
//     } else {
//       buffer = input;
//     }

//     const maxSizeBytes = maxSizeKB * 1024;
//     let quality = options.quality || 80;
//     let result: ConversionResult = { success: false };

//     // Try different quality levels to reach target size
//     for (let attempt = 0; attempt < 10; attempt++) {
//       result = await convertBufferToWebP(buffer, { ...options, quality });

//       if (!result.success || !result.buffer) {
//         throw new Error("Conversion failed");
//       }

//       if (result.size! <= maxSizeBytes || quality <= 10) {
//         break;
//       }

//       // Reduce quality for next attempt
//       quality = Math.max(10, quality - 10);
//     }

//     return result;
//   } catch (error) {
//     console.error("Error compressing to size:", error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "Unknown error",
//     };
//   }
// }

// /**
//  * Get supported input formats
//  */
// export function getSupportedFormats(): string[] {
//   return ["jpeg", "jpg", "png", "gif", "bmp", "tiff", "webp", "svg"];
// }

// /**
//  * Simple wrapper for quick conversion
//  */
// export async function toWebP(input: Buffer | string, quality: number = 80): Promise<Buffer | null> {
//   try {
//     let result: ConversionResult;

//     if (Buffer.isBuffer(input)) {
//       result = await convertBufferToWebP(input, { quality });
//     } else {
//       result = await convertBase64ToWebP(input, { quality });
//     }

//     return result.success ? result.buffer || null : null;
//   } catch (error) {
//     console.error("Error in toWebP:", error);
//     return null;
//   }
// }

// /**
//  * Quick base64 to base64 WebP conversion
//  */
// export async function base64ToWebP(base64Input: string, quality: number = 80): Promise<string | null> {
//   try {
//     const result = await convertBase64ToWebP(base64Input, { quality });
//     return result.success ? result.base64 || null : null;
//   } catch (error) {
//     console.error("Error in base64ToWebP:", error);
//     return null;
//   }
// }
