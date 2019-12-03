export function downloadFile(file) {
    var url = URL.createObjectURL(file);
    var anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = '';
    anchor.click();
    URL.revokeObjectURL(file);
}
