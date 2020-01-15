export function normalizeWorksheetName(name) {
    // Replace square brackets with normal ones
    name = name.replace(/\[/g, '(').replace(/\]/g, ')');

    // Replace slashes with dashes
    name = name.replace(/\//g, '-');

    // Replace other forbidden characters with underscores
    name = name.replace(/[\\\?\*]+/g, '_');

    // Limit name to 31 characters
    name = name.replace(/^(.{30}).{2,}/, '$1…');

    return name;
}
