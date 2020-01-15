export function normalizeWorksheetName(name) {
    // Strip forbidden characters
    name = name.replace(/[\\\/\?\*\[\]]+/g, '_');

    // Limit name to 31 characters
    name = name.replace(/^(.{30}).{2,}/, '$1…');

    return name;
}
