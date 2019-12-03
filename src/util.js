export function downloadFile(data, fileName) {
    var file = new File([data], encodeURIComponent(fileName), { type: 'application/json' });
    var url = URL.createObjectURL(file);
    var anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = '';
    anchor.click();
    URL.revokeObjectURL(file);
}
