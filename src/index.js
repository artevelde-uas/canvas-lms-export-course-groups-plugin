import { writeFile as writeWorkbookToFile } from 'xlsx';
import { utils as WorkbookUtils } from 'xlsx';

import translations from './i18n.json';


export default function ({
    router,
    addReadyListener,
    api,
    i18n: {
        translate: __,
        setTranslations
    }
}, {
    userHeader = ['id', 'name', 'short_name', 'sortable_name', 'login_id'],
    userMapper = user => {
        for (let key of Object.keys(user)) {
            if (!userHeader.includes(key)) delete user[key];
        }

        return user;
    }
}) {
    setTranslations(translations);

    /**
     * Gets the group category with nested groups and users
     *
     * @param   {number} groupCategoryId - The ID of the group category
     * @returns {object} The group category object
     */
    async function getGroupCategory(groupCategoryId) {
        // Fetch the group category and its groups
        var [groupCategory, groups] = await Promise.all([
            api.get(`/group_categories/${groupCategoryId}`),
            api.get(`/group_categories/${groupCategoryId}/groups`, { per_page: 100 })
        ]);

        // Fetch the users from all the groups
        groupCategory.groups = await Promise.all(groups.map(async group => {
            group.users = await api.get(`/groups/${group.id}/users`, { per_page: 100 });

            return group;
        }));

        return groupCategory;
    }

    router.addListener('courses.users.groups', function () {
        addReadyListener('#group_categories_tabs', tabs => {

            // Handle clicks on the actions button
            tabs.addEventListener('mousedown', event => {
                var button = event.target.closest('.group-category-actions a.al-trigger');

                if (button === null) return;

                let menu = button.nextElementSibling;
                let exportLink = menu.querySelector('a.export-category');

                if (exportLink === null) {
                    // Append the menu item to the actions menu
                    menu.insertAdjacentHTML('beforeend', `
                        <li class="ui-menu-item" role="presentation">
                            <a href="#" class="icon-export export-category ui-corner-all" id="ui-id-8" tabindex="-1" role="menuitem">
                                ${__('export_as_excel')}
                            </a>
                        </li>
                    `);

                    // Get the active tab's group category ID
                    let tabAnchor = tabs.querySelector('ul.ui-tabs-nav > li.ui-tabs-active > a.ui-tabs-anchor.group-category-tab-link');
                    let groupCategoryId = tabAnchor.href.match(/tab-(\d+)$/)[1];

                    // Add a click handler to the new menu item
                    exportLink = menu.lastElementChild;
                    exportLink.addEventListener('click', () => {
                        getGroupCategory(groupCategoryId).then(groupCategory => {
                            // Create a new workbook
                            var workbook = WorkbookUtils.book_new();
                            var fileName = `${groupCategory.name}.xlsx`;

                            // Add a worksheet for each group and add the users
                            for (let group of groupCategory.groups) {
                                let data = group.users.map(userMapper);
                                let workSheet = WorkbookUtils.json_to_sheet(data, { header: userHeader });
                                let sheetName = group.name;

                                // Add the worksheet to the workbook
                                WorkbookUtils.book_append_sheet(workbook, workSheet, sheetName);
                            }

                            // Write the workbook to a file and download it
                            writeWorkbookToFile(workbook, fileName);
                        });
                    });
                }
            });

        });
    });

}
