export const ORCAD_CFB_MAGIC = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1] as const;

const MAX_SAMPLE_BYTES = 4096;
const MAX_HEX_BYTES = 192;

export const isOrcadCompoundFile = (bytes: Uint8Array) => {
  return ORCAD_CFB_MAGIC.every((value, index) => bytes[index] === value);
};

export const cleanupOrcadText = (text: string) => {
  return text
    .replace(/\u0000/g, '')
    .replace(/[^\S\r\n]+/g, ' ')
    .replace(/\r\n/g, '\n')
    .trim();
};

export const looksLikeOrcadText = (bytes: Uint8Array) => {
  if (!bytes.length) {
    return false;
  }
  const sample = bytes.slice(0, Math.min(bytes.length, MAX_SAMPLE_BYTES));
  let printable = 0;
  let zeroBytes = 0;
  for (const byte of sample) {
    if (byte === 0) {
      zeroBytes += 1;
    }
    if (byte === 9 || byte === 10 || byte === 13 || (byte >= 32 && byte <= 126) || byte >= 0x80) {
      printable += 1;
    }
  }
  return printable / sample.length > 0.82 || zeroBytes / sample.length > 0.25;
};

export const decodeOrcadSample = (bytes: Uint8Array) => {
  const sample = bytes.slice(0, Math.min(bytes.length, MAX_SAMPLE_BYTES));
  if (!sample.length) {
    return '';
  }

  try {
    let zeroOdd = 0;
    let zeroEven = 0;
    for (let index = 0; index < sample.length; index += 1) {
      if (sample[index] !== 0) {
        continue;
      }
      if (index % 2 === 0) {
        zeroEven += 1;
      } else {
        zeroOdd += 1;
      }
    }

    const decoder = zeroOdd > sample.length / 5 && zeroOdd > zeroEven * 2
      ? new TextDecoder('utf-16le', { fatal: false })
      : new TextDecoder('utf-8', { fatal: false });
    return cleanupOrcadText(decoder.decode(sample));
  } catch {
    return '';
  }
};

export const createOrcadHexPreview = (bytes: Uint8Array) => {
  const sample = bytes.slice(0, Math.min(bytes.length, MAX_HEX_BYTES));
  const lines: string[] = [];
  for (let offset = 0; offset < sample.length; offset += 16) {
    const row = sample.slice(offset, offset + 16);
    const hex = Array.from(row).map(byte => byte.toString(16).padStart(2, '0')).join(' ');
    const ascii = Array.from(row)
      .map(byte => byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.')
      .join('');
    lines.push(`${offset.toString(16).padStart(8, '0')}  ${hex.padEnd(47)}  ${ascii}`);
  }
  return lines.join('\n');
};

export const extractOrcadAsciiStrings = (bytes: Uint8Array) => {
  const result: string[] = [];
  let current = '';
  for (const byte of bytes) {
    if (byte >= 32 && byte <= 126) {
      current += String.fromCharCode(byte);
      continue;
    }
    if (current.length >= 4) {
      result.push(current);
    }
    current = '';
  }
  if (current.length >= 4) {
    result.push(current);
  }
  return result;
};

export const extractOrcadUtf16Strings = (bytes: Uint8Array) => {
  const result: string[] = [];
  let current = '';
  for (let index = 0; index + 1 < bytes.length; index += 2) {
    const low = bytes[index];
    const high = bytes[index + 1];
    if (high === 0 && low >= 32 && low <= 126) {
      current += String.fromCharCode(low);
      continue;
    }
    if (current.length >= 4) {
      result.push(current);
    }
    current = '';
  }
  if (current.length >= 4) {
    result.push(current);
  }
  return result;
};

export const collectOrcadStrings = (chunks: Uint8Array[], maxStrings = 180) => {
  const seen = new Set<string>();
  const result: string[] = [];
  chunks.forEach(chunk => {
    const candidates = [...extractOrcadAsciiStrings(chunk), ...extractOrcadUtf16Strings(chunk)];
    candidates.forEach(item => {
      const cleaned = cleanupOrcadText(item);
      if (!cleaned || cleaned.length < 4 || seen.has(cleaned) || result.length >= maxStrings) {
        return;
      }
      seen.add(cleaned);
      result.push(cleaned);
    });
  });
  return result;
};
