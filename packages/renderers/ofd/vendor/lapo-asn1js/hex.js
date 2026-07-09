var Hex = {},
    decoder, // populated on first usage
    haveU8 = (typeof Uint8Array == 'function');

/**
 * Decodes an hexadecimal value.
 * @param {string|Array|Uint8Array} a - a string representing hexadecimal data, or an array representation of its charcodes
 */
Hex.decode = function(a) {
    var isString = (typeof a == 'string');
    var i;
    if (decoder === undefined) {
        var hex = "0123456789ABCDEF",
            ignore = " \f\n\r\t\u00A0\u2028\u2029";
        decoder = [];
        for (i = 0; i < 16; ++i)
            decoder[hex.charCodeAt(i)] = i;
        hex = hex.toLowerCase();
        for (i = 10; i < 16; ++i)
            decoder[hex.charCodeAt(i)] = i;
        for (i = 0; i < ignore.length; ++i)
            decoder[ignore.charCodeAt(i)] = -1;
    }
    var out = haveU8 ? new Uint8Array(a.length >> 1) : [],
        bits = 0,
        char_count = 0,
        len = 0;
    for (i = 0; i < a.length; ++i) {
        var c = isString ? a.charCodeAt(i) : a[i];
        c = decoder[c];
        if (c == -1)
            continue;
        if (c === undefined)
            throw 'Illegal character at offset ' + i;
        bits |= c;
        if (++char_count >= 2) {
            out[len++] = bits;
            bits = 0;
            char_count = 0;
        } else {
            bits <<= 4;
        }
    }
    if (char_count)
        throw "Hex encoding incomplete: 4 bits missing";
    if (haveU8 && out.length > len) // in case it was originally longer because of ignored characters
        out = out.subarray(0, len);
    return out;
};

export default Hex;
