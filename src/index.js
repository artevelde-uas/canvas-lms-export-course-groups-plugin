import xlsx from 'xlsx';
import { downloadFile } from "./util";

import translations from './i18n.json';


function generateGroupCategoryCSV(groupCategory) {
    var rows = [];

    rows.push('Group,User');

    for (let group of groupCategory.groups) {
        for (let user of group.users) {
            var row = [group.name, user.name].join(',');

            rows.push(row);
        }
    }

    return rows.join('\n');
}


export default function ({ router, addReadyListener, api, i18n: { translate: __, setTranslations } }) {
    setTranslations(translations);

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

    router.addListener('courses.users.groups', function () {
        addReadyListener('#group_categories_tabs', tabs => {
            tabs.addEventListener('mousedown', event => {
                var button = event.target.closest('.group-category-actions a.al-trigger');

                if (button === null) return;

                let menu = button.nextElementSibling;
                let exportLink = menu.querySelector('a.export-category');

                if (exportLink === null) {
                    menu.insertAdjacentHTML('beforeend', `
                        <li class="ui-menu-item" role="presentation">
                            <a href="#" class="icon-export export-category ui-corner-all" id="ui-id-8" tabindex="-1" role="menuitem">
                                ${__('export_as_csv')}
                            </a>
                        </li>
                    `);

                    let tabAnchor = tabs.querySelector('ul.ui-tabs-nav > li.ui-tabs-active > a.ui-tabs-anchor.group-category-tab-link');
                    let groupCategoryId = tabAnchor.href.match(/tab-(\d+)$/)[1];

                    exportLink = menu.lastElementChild;
                    exportLink.addEventListener('click', () => {
                        getGroupCategory(groupCategoryId).then(groupCategory => {
                            var workBook = xlsx.utils.book_new();
                            var fileName = `${groupCategory.name}.xlsx`;

                            for (let group of groupCategory.groups) {
                                let data = group.users.map(user => [user.name]);
                                let workSheet = xlsx.utils.aoa_to_sheet(data);
                                let sheetName = group.name;

                                // Add worksheet to workbook
                                xlsx.utils.book_append_sheet(workBook, workSheet, sheetName);
                            }

                            // Write workbook to file
                            xlsx.writeFile(workBook, fileName);
                        });
                    });
                }
            });
        });
    });

}
