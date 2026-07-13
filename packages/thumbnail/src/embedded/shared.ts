export const MAX_EMBEDDED_THUMBNAIL_BYTES = 20 * 1024 * 1024;

const copyToArrayBuffer = (bytes: Uint8Array) => {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
};
const abortError = (signal: AbortSignal) => (
  signal.reason instanceof Error
    ? signal.reason
    : new DOMException('Thumbnail extraction was aborted.', 'AbortError')
);

export const throwIfAborted = (signal?: AbortSignal) => {
  if (signal?.aborted) {
    throw abortError(signal);
  }
};

export const raceWithAbort = <T>(
  operation: Promise<T>,
  signal?: AbortSignal,
  onAbort?: () => void
) => {
  if (!signal) {
    return operation;
  }
  throwIfAborted(signal);
  return new Promise<T>((resolve, reject) => {
    const abort = () => {
      onAbort?.();
      reject(abortError(signal));
    };
    signal.addEventListener('abort', abort, { once: true });
    operation.then(
      value => {
        signal.removeEventListener('abort', abort);
        resolve(value);
      },
      error => {
        signal.removeEventListener('abort', abort);
        reject(error);
      }
    );
  });
};

const mimeTypeFromBytes = (bytes: Uint8Array, path: string) => {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png';
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) return 'image/gif';
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) return 'image/webp';
  if (bytes[0] === 0x42 && bytes[1] === 0x4d) return 'image/bmp';

  const extension = path.split(/[?#]/, 1)[0]?.split('.').pop()?.toLowerCase();
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
  if (extension === 'png') return 'image/png';
  if (extension === 'gif') return 'image/gif';
  if (extension === 'webp') return 'image/webp';
  if (extension === 'bmp') return 'image/bmp';
  if (extension === 'svg' || extension === 'svgz') return 'image/svg+xml';
  return '';
};

export const toImageBlob = (bytes: Uint8Array, path: string) => {
  if (!bytes.byteLength || bytes.byteLength > MAX_EMBEDDED_THUMBNAIL_BYTES) {
    return null;
  }
  const type = mimeTypeFromBytes(bytes, path);
  return type ? new Blob([copyToArrayBuffer(bytes)], { type }) : null;
};
