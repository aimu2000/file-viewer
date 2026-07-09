/*
 * ofd.js - A Javascript class for reading and rendering ofd files
 * <https://github.com/DLTech21/ofd.js>
 *
 * Copyright (c) 2020. DLTech21 All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 * Display-only SES signature parser for File Viewer:
 * extracts seal picture bytes for preview, skips crypto verification
 * so ASN.1/国密校验不会进入预览主路径。
 */

import Hex from '@lapo/asn1js/hex.js';
import Base64 from '@lapo/asn1js/base64.js';
import ASN1 from '@lapo/asn1js';

const reHex = /^\s*(?:[0-9A-Fa-f][0-9A-Fa-f]\s*)+$/;

const unwrapDefault = (mod) => (mod && typeof mod === 'object' && 'default' in mod ? mod.default : mod);

const HexApi = unwrapDefault(Hex);
const Base64Api = unwrapDefault(Base64);
const ASN1Api = unwrapDefault(ASN1);

export const parseSesSignature = async function (zip, name, getEntry) {
    const entry = typeof getEntry === 'function' ? getEntry(zip, name) : zip.files[name];
    if (!entry) {
        return {};
    }
    try {
        const bytes = await entry.async('base64');
        return decodeText(bytes);
    } catch (e) {
        console.warn('[ofd] parseSesSignature failed', name, e);
        return {};
    }
};

const decodeText = function (val) {
    try {
        const der = reHex.test(val) ? HexApi.decode(val) : Base64Api.unarmor(val);
        return decode(der);
    } catch (e) {
        console.warn('[ofd] decode SES signature text failed', e);
        return {};
    }
};

const decode = function (der, offset) {
    offset = offset || 0;
    try {
        const SES_Signature = decodeSES_Signature(der, offset);
        const picture = SES_Signature?.toSign?.eseal?.esealInfo?.picture;
        if (!picture?.data?.byte?.length) {
            return {};
        }
        const type = (picture.type?.str || picture.type || '').toString().toLowerCase();
        return {
            ofdArray: picture.data.byte,
            type,
            // 预览只保留轻量元数据，避免把 DER/证书二进制塞进 DOM data-*。
            SES_Signature: {
                realVersion: SES_Signature.realVersion,
                displayOnly: true,
                pictureType: type,
                pictureWidth: picture.width,
                pictureHeight: picture.height,
                sealName: SES_Signature.toSign?.eseal?.esealInfo?.property?.name,
            },
            verifyRet: true,
        };
    } catch (e) {
        console.warn('[ofd] decode SES signature failed', e);
        return {};
    }
};

const decodeUTCTime = function (str) {
    str = String(str || '').replace('Unrecognized time: ', '');
    str = str.replace('Z', '');
    str = str.substr(0, 1) < '5' ? '20' + str : '19' + str;
    return str;
};

const parseStringUTF = function (node) {
    if (!node) {
        return '';
    }
    return node.stream.parseStringUTF(node.stream.pos + node.header, node.stream.pos + node.header + node.length);
};

const parseInteger = function (node) {
    if (!node) {
        return undefined;
    }
    return node.stream.parseInteger(node.stream.pos + node.header, node.stream.pos + node.header + node.length);
};

const parseOctetBytes = function (node) {
    if (!node) {
        return new Uint8Array(0);
    }
    return node.stream.enc.subarray(node.stream.pos + node.header, node.stream.pos + node.header + node.length);
};

const parseTimeNode = function (node, utc) {
    if (!node) {
        return '';
    }
    const raw = node.stream.parseTime(node.stream.pos + node.header, node.stream.pos + node.header + node.length, utc);
    return decodeUTCTime(raw);
};

const decodeSES_Signature = function (der, offset) {
    offset = offset || 0;
    const asn1 = ASN1Api.decode(der, offset);
    let SES_Signature;
    try {
        // V1
        const createDate = parseTimeNode(asn1.sub[0]?.sub[1]?.sub[0]?.sub[2]?.sub[3]);
        const validStart = parseTimeNode(asn1.sub[0]?.sub[1]?.sub[0]?.sub[2]?.sub[4]);
        const validEnd = parseTimeNode(asn1.sub[0]?.sub[1]?.sub[0]?.sub[2]?.sub[5]);
        const pictureNode = asn1.sub[0]?.sub[1]?.sub[0]?.sub[3];
        SES_Signature = {
            realVersion: 1,
            toSign: {
                eseal: {
                    esealInfo: {
                        property: {
                            name: parseStringUTF(asn1.sub[0]?.sub[1]?.sub[0]?.sub[2]?.sub[1]),
                            createDate,
                            validStart,
                            validEnd,
                        },
                        picture: {
                            type: parseStringUTF(pictureNode?.sub[0]),
                            data: { byte: parseOctetBytes(pictureNode?.sub[1]) },
                            width: parseInteger(pictureNode?.sub[2]),
                            height: parseInteger(pictureNode?.sub[3]),
                        },
                    },
                },
            },
        };
    } catch (e) {
        try {
            // V4
            const pictureNode = asn1.sub[0]?.sub[1]?.sub[0]?.sub[3];
            SES_Signature = {
                realVersion: 4,
                toSign: {
                    eseal: {
                        esealInfo: {
                            property: {
                                name: parseStringUTF(asn1.sub[0]?.sub[1]?.sub[0]?.sub[2]?.sub[1]),
                                createDate: asn1.sub[0]?.sub[1]?.sub[0]?.sub[2]?.sub[4]?.stream.parseTime(
                                    asn1.sub[0].sub[1].sub[0].sub[2].sub[4].stream.pos + asn1.sub[0].sub[1].sub[0].sub[2].sub[4].header,
                                    asn1.sub[0].sub[1].sub[0].sub[2].sub[4].stream.pos + asn1.sub[0].sub[1].sub[0].sub[2].sub[4].header + asn1.sub[0].sub[1].sub[0].sub[2].sub[4].length
                                ),
                                validStart: asn1.sub[0]?.sub[1]?.sub[0]?.sub[2]?.sub[5]?.stream.parseTime(
                                    asn1.sub[0].sub[1].sub[0].sub[2].sub[5].stream.pos + asn1.sub[0].sub[1].sub[0].sub[2].sub[5].header,
                                    asn1.sub[0].sub[1].sub[0].sub[2].sub[5].stream.pos + asn1.sub[0].sub[1].sub[0].sub[2].sub[5].header + asn1.sub[0].sub[1].sub[0].sub[2].sub[5].length
                                ),
                                validEnd: asn1.sub[0]?.sub[1]?.sub[0]?.sub[2]?.sub[6]?.stream.parseTime(
                                    asn1.sub[0].sub[1].sub[0].sub[2].sub[6].stream.pos + asn1.sub[0].sub[1].sub[0].sub[2].sub[6].header,
                                    asn1.sub[0].sub[1].sub[0].sub[2].sub[6].stream.pos + asn1.sub[0].sub[1].sub[0].sub[2].sub[6].header + asn1.sub[0].sub[1].sub[0].sub[2].sub[6].length
                                ),
                            },
                            picture: {
                                type: parseStringUTF(pictureNode?.sub[0]),
                                data: { byte: parseOctetBytes(pictureNode?.sub[1]) },
                                width: parseInteger(pictureNode?.sub[2]),
                                height: parseInteger(pictureNode?.sub[3]),
                            },
                        },
                    },
                },
            };
        } catch (inner) {
            console.warn('[ofd] unsupported SES signature structure', inner);
            SES_Signature = {};
        }
    }
    return SES_Signature;
};
