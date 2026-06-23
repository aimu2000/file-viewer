export type GeometryKernelFormat = 'step' | 'iges' | 'ifc' | '3dm' | 'brep';

export type GeometryKernelFamily = 'cad-brep' | 'bim-ifc' | 'rhino-3dm';

export type GeometryKernelOutput = 'three-object' | 'mesh' | 'fragments';

export type GeometryKernelConfidence = 'none' | 'low' | 'medium' | 'high';

export type GeometryKernelLocale = 'zh-CN' | 'en-US';

export interface GeometryKernelCapability {
  readonly renderer: string;
  readonly packageName: string;
  readonly wasm: true;
  readonly output: readonly GeometryKernelOutput[];
  readonly note: string;
  readonly url: string;
}

export interface GeometryKernelRoute {
  readonly format: GeometryKernelFormat;
  readonly aliases: readonly string[];
  readonly label: string;
  readonly family: GeometryKernelFamily;
  readonly recommended: readonly GeometryKernelCapability[];
  readonly serverConversionTargets: readonly string[];
  readonly licenseNotes: readonly string[];
}

export interface GeometryKernelInspection {
  readonly format?: GeometryKernelFormat;
  readonly route?: GeometryKernelRoute;
  readonly confidence: GeometryKernelConfidence;
  readonly byteLength: number;
  readonly signature?: string;
  readonly warnings: readonly string[];
}

const textDecoder = typeof TextDecoder === 'function'
  ? new TextDecoder('utf-8', { fatal: false })
  : undefined;

const normalizeToken = (value?: string) => {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^\./, '')
    .replace(/^model\//, '')
    .replace(/^application\//, '')
    .replace(/^x-/, '');
};

export const geometryKernelRoutes: readonly GeometryKernelRoute[] = [
  {
    format: 'step',
    aliases: ['step', 'stp', 'p21', 'iso-10303-21'],
    label: 'STEP / ISO 10303',
    family: 'cad-brep',
    recommended: [
      {
        renderer: 'OpenCascade / OCCT import',
        packageName: 'occt-import-js',
        wasm: true,
        output: ['three-object', 'mesh'],
        note: 'Imports STEP into mesh/JSON data in the browser; suitable as the first full preview path.',
        url: 'https://github.com/kovacsv/occt-import-js',
      },
      {
        renderer: 'OpenCascade.js',
        packageName: 'opencascade.js',
        wasm: true,
        output: ['three-object', 'mesh'],
        note: 'Full OpenCascade geometry kernel port for richer CAD workflows.',
        url: 'https://ocjs.org/',
      },
    ],
    serverConversionTargets: ['glb', 'gltf', 'stl', 'obj'],
    licenseNotes: ['OCCT-based packages can have LGPL or custom distribution requirements; keep them opt-in.'],
  },
  {
    format: 'iges',
    aliases: ['iges', 'igs'],
    label: 'IGES',
    family: 'cad-brep',
    recommended: [
      {
        renderer: 'OpenCascade / OCCT import',
        packageName: 'occt-import-js',
        wasm: true,
        output: ['three-object', 'mesh'],
        note: 'Uses OCCT importers for IGES/BREP geometry and keeps the heavy runtime behind a dedicated package.',
        url: 'https://github.com/kovacsv/occt-import-js',
      },
    ],
    serverConversionTargets: ['glb', 'gltf', 'stl', 'obj'],
    licenseNotes: ['Treat CAD kernel licensing separately from the lightweight viewer core.'],
  },
  {
    format: 'brep',
    aliases: ['brep'],
    label: 'BREP',
    family: 'cad-brep',
    recommended: [
      {
        renderer: 'OpenCascade / OCCT import',
        packageName: 'occt-import-js',
        wasm: true,
        output: ['three-object', 'mesh'],
        note: 'BREP is closest to the native OCCT topology model and should share the STEP/IGES engine.',
        url: 'https://github.com/kovacsv/occt-import-js',
      },
    ],
    serverConversionTargets: ['glb', 'gltf', 'stl', 'obj'],
    licenseNotes: ['Keep OCCT WASM as an explicit renderer dependency.'],
  },
  {
    format: 'ifc',
    aliases: ['ifc', 'ifczip', 'ifcxml'],
    label: 'IFC / BuildingSMART',
    family: 'bim-ifc',
    recommended: [
      {
        renderer: 'That Open web-ifc',
        packageName: 'web-ifc',
        wasm: true,
        output: ['fragments', 'mesh'],
        note: 'Reads IFC at native speed in the browser and can be paired with Fragments for large BIM models.',
        url: 'https://github.com/thatopen/engine_web-ifc',
      },
    ],
    serverConversionTargets: ['glb', 'gltf', 'fragments'],
    licenseNotes: ['Large IFC models often need preprocessing, fragments, worker isolation, and property paging.'],
  },
  {
    format: '3dm',
    aliases: ['3dm', 'rhino'],
    label: 'Rhino 3DM / OpenNURBS',
    family: 'rhino-3dm',
    recommended: [
      {
        renderer: 'McNeel rhino3dm.js',
        packageName: 'rhino3dm',
        wasm: true,
        output: ['three-object', 'mesh'],
        note: 'Official OpenNURBS WASM binding; Three.js provides Rhino3dmLoader on top of it.',
        url: 'https://github.com/mcneel/rhino3dm',
      },
    ],
    serverConversionTargets: ['glb', 'gltf', 'obj'],
    licenseNotes: ['Ship rhino3dm.wasm only in the dedicated 3DM renderer path.'],
  },
];

const routeByAlias = new Map<string, GeometryKernelRoute>();
geometryKernelRoutes.forEach(route => {
  route.aliases.forEach(alias => routeByAlias.set(alias, route));
});

export const normalizeGeometryKernelFormat = (type?: string): GeometryKernelFormat | undefined => {
  return routeByAlias.get(normalizeToken(type))?.format;
};

export const getGeometryKernelRoute = (type?: string): GeometryKernelRoute | undefined => {
  return routeByAlias.get(normalizeToken(type));
};

export const isGeometryKernelFormat = (type?: string) => {
  return Boolean(getGeometryKernelRoute(type));
};

const toBytes = (input: ArrayBuffer | Uint8Array) => {
  return input instanceof Uint8Array ? input : new Uint8Array(input);
};

const decodePrefix = (bytes: Uint8Array, maxLength = 8192) => {
  const slice = bytes.slice(0, Math.min(bytes.byteLength, maxLength));
  if (textDecoder) {
    return textDecoder.decode(slice);
  }
  let text = '';
  for (let index = 0; index < slice.length; index += 1) {
    text += String.fromCharCode(slice[index]);
  }
  return text;
};

const createInspection = (
  bytes: Uint8Array,
  format: GeometryKernelFormat | undefined,
  confidence: GeometryKernelConfidence,
  signature?: string,
  warnings: string[] = []
): GeometryKernelInspection => {
  const route = format ? getGeometryKernelRoute(format) : undefined;
  return {
    format,
    route,
    confidence,
    byteLength: bytes.byteLength,
    signature,
    warnings,
  };
};

export const inspectGeometryKernelFile = (
  input: ArrayBuffer | Uint8Array,
  type?: string
): GeometryKernelInspection => {
  const bytes = toBytes(input);
  const explicitFormat = normalizeGeometryKernelFormat(type);
  const prefix = decodePrefix(bytes);
  const normalizedPrefix = prefix.toUpperCase();
  const warnings: string[] = [];

  if (bytes.byteLength === 0) {
    return createInspection(bytes, explicitFormat, explicitFormat ? 'low' : 'none', undefined, ['Empty file.']);
  }

  if (
    /FILE_SCHEMA\s*\(\s*\(\s*'IFC/i.test(prefix) ||
    (normalizedPrefix.includes('IFC') && normalizedPrefix.includes('FILE_SCHEMA'))
  ) {
    return createInspection(bytes, 'ifc', 'high', 'IFC-SPF', warnings);
  }

  if (/ISO-10303-21|HEADER;\s*FILE_DESCRIPTION|DATA;\s*#\d+=/i.test(prefix)) {
    return createInspection(bytes, 'step', 'high', 'ISO-10303-21', warnings);
  }

  if (/3D GEOMETRY FILE FORMAT|OPENNURBS/i.test(prefix)) {
    return createInspection(bytes, '3dm', 'high', 'OpenNURBS 3DM', warnings);
  }

  if (/DBRep_DrawableShape|CASCADE Topology V|BREP/i.test(prefix)) {
    return createInspection(bytes, 'brep', 'medium', 'OpenCascade BREP', warnings);
  }

  const hasIgesStartSection = /^.{0,72}S\s*\d+/m.test(prefix);
  const hasIgesGlobalSection = /^.{0,72}G\s*\d+/m.test(prefix);
  if (hasIgesStartSection || hasIgesGlobalSection || /S\s+1\s*\n.{0,72}G\s+1/i.test(prefix)) {
    return createInspection(bytes, 'iges', hasIgesStartSection && hasIgesGlobalSection ? 'high' : 'medium', 'IGES section marker', warnings);
  }

  if (explicitFormat) {
    warnings.push('File signature was not fully recognized; using the provided extension or MIME hint.');
    return createInspection(bytes, explicitFormat, 'low', undefined, warnings);
  }

  return createInspection(bytes, undefined, 'none', undefined, ['No supported geometry kernel signature was detected.']);
};

export const formatGeometryKernelNotice = (
  type?: string,
  locale: GeometryKernelLocale = 'zh-CN'
) => {
  const route = getGeometryKernelRoute(type);
  const formatLabel = route?.label || String(type || 'Engineering model').toUpperCase();
  const engines = route?.recommended.map(item => item.packageName).join(' / ') || 'OpenCascade / web-ifc / rhino3dm';
  const targets = route?.serverConversionTargets.join(' / ') || 'GLB / GLTF';

  if (locale === 'en-US') {
    return `${formatLabel} requires a dedicated WebAssembly geometry kernel (${engines}) for full browser preview. Flyfish Viewer keeps these heavy runtimes outside core and the default 3D renderer install path; use the dedicated geometry engine route or convert the model to ${targets} in a private pipeline.`;
  }

  return `${formatLabel} 需要独立 WebAssembly 几何内核（${engines}）才能完整浏览器预览。Flyfish Viewer 不会把这类重型运行时塞进 core 或默认 3D renderer 安装路径；请通过独立几何内核路线接入，或在私有转换链路输出 ${targets} 后预览。`;
};
