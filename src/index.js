
function paramsHashHack(params) {
    var hashMatch = window.location.hash.match(/^#tab-(\d+)/);

    if (hashMatch !== null) {
        params.groupCategoryId = hashMatch[1];
    }

    return params;
}

export default function ({ router, addReadyListener, api }) {

    async function getGroupCategory(groupCategoryId) {
        var [groupCategory, groups] = await Promise.all([
            api.get(`/group_categories/${groupCategoryId}`),
            api.get(`/group_categories/${groupCategoryId}/groups`)
        ]);

        groupCategory.groups = await Promise.all(groups.map(async group => {
            group.users = await api.get(`/groups/${group.id}/users`);

            return group;
        }));

        return groupCategory;
    }

    router.addListener('courses.users.groups', function (params) {
        // Hack to get group id from hash
        params = paramsHashHack(params);

        getGroupCategory(params.groupCategoryId).then(groupCategory => {
            var data = [JSON.stringify(groupCategory, null, 2)];
            var fileName = encodeURIComponent(`${groupCategory.name}.json`);
            var file = new File(data, fileName, { type: 'application/json' });
            var url = URL.createObjectURL(file);
            var anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = '';
            anchor.click();
            URL.revokeObjectURL(file);
        });
    });

}
