import { downloadFile } from "./util";


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
        addReadyListener('#group_categories_tabs', tabs => {
            tabs.addEventListener('mousedown', event => {
                var button = event.target.closest('.group-category-actions a.al-trigger');

                if (button === null) return;

                let menu = button.nextElementSibling;
                let exportLink = menu.querySelector('a.export-category');
                let tabAnchor = tabs.querySelector('ul.ui-tabs-nav > li.ui-tabs-active > a.ui-tabs-anchor.group-category-tab-link');
                let groupCategoryId = tabAnchor.href.match(/tab-(\d+)$/)[1];
                if (exportLink === null) {
                    menu.insertAdjacentHTML('beforeend', `
                        <li class="ui-menu-item" role="presentation">
                            <a href="#" class="icon-export export-category ui-corner-all" id="ui-id-8" tabindex="-1" role="menuitem">
                                Export as CSV
                            </a>
                        </li>
                    `);

                    exportLink = menu.lastElementChild;
                    exportLink.addEventListener('click', event => {
                        getGroupCategory(groupCategoryId).then(groupCategory => {
                            var data = JSON.stringify(groupCategory, null, 2);
                            var fileName = `${groupCategory.name}.json`;

                            downloadFile(data, fileName);
                        });
                    });
                }
            });
        });
    });

}
