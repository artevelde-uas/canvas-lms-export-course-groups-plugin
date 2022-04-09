function normalizeWorksheetName(name) {
    return name
        // Replace square brackets with normal ones
        .replace(/\[/g, '(')
        .replace(/\]/g, ')')
        // Replace slashes with dashes
        .replace(/\//g, '-')
        // Replace other forbidden characters with underscores
        .replace(/[\\\?\*]+/g, '_');
}

function getCommonPrefix(str1, str2) {
    let length = 0;

    if (str1 === str2) return str1;

    while (str1.at(length) === str2.at(length)) length++;

    return str1.slice(0, length);
}

function capString(str, len) {
    if (str.length <= len) return str;

    return str.slice(0, (len - 1)) + '…';
}

export function getNormalizedWorksheetNames(names) {
    // Normalize the group names so they are valid worksheet names
    const normalizedNames = names.map(normalizeWorksheetName);

    // Get common prefix
    const commonPrefix = normalizedNames.reduce(getCommonPrefix);

    return normalizedNames.map(name => {
        // Calculate available lengths
        const availablePrefixLength = Math.min(31, 31 - Math.min(21, (name.length - commonPrefix.length)));
        const availableSuffixLength = Math.min(31, 31 - Math.min(10, commonPrefix.length));

        // Cap strings at maximum available length
        const prefix = capString(commonPrefix, availablePrefixLength);
        const suffix = capString(name.slice(commonPrefix.length), availableSuffixLength);

        return prefix.concat(suffix);
    });
}

export function keyValueArraysToMap(keys, values) {
    if (keys.length !== values.length) {
        throw new Error('Arrays must be of same length');
    }

    const map = new Map();

    for (let i = 0, l = keys.length; i < l; i++) {
        if (map.has(keys[i])) {
            throw new Error('Array keys must be unique');
        }

        map.set(keys[i], values[i]);
    }

    return map;
}
