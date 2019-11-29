
export default function (app) {
    app.addRouteListener('courses.users.groups', function (params) {
        app.api.get(`/courses/${params.courseId}/groups`).then(result => {
            var blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
            var url = window.URL.createObjectURL(blob);
            var anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = 'test.json';
            anchor.click();
        });
    });
}
