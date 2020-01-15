export function normalizeWorksheetName(name) {
    return name.replace(/[\\\/\?\*\[\]]/g, '_');
}
