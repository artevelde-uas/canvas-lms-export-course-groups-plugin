import { router, dom, api } from '@artevelde-uas/canvas-lms-app';
import { writeFile as writeWorkbookToFile } from 'xlsx';
import { utils as WorkbookUtils } from 'xlsx';
import { normalizeWorksheetName } from './util.js';

import __ from './i18n';


export default function ({
    userHeader = ['id', 'name', 'short_name', 'sortable_name', 'login_id'],
    userMapper = user => {
        for (const key of Object.keys(user)) {
            if (!userHeader.includes(key)) delete user[key];
        }

        return user;
    }
} = {}) {
    /**
     * Gets the group category with nested groups and users
     *
     * @param   {number} groupCategoryId - The ID of the group category
     * @returns {object} The group category object
     */
    async function getGroupCategory(groupCategoryId) {
        // Fetch the group category and its groups
        const [groupCategory, groups] = await Promise.all([
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

    router.onRoute('courses.users.groups', async function () {
        const tabs = await dom.onElementReady('#group_categories_tabs');

        // Handle clicks on the actions button
        tabs.addEventListener('mousedown', event => {
            const button = event.target.closest('.group-category-actions a.al-trigger');

            if (button === null) return;

            const menu = button.nextElementSibling;
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
                const tabAnchor = tabs.querySelector('ul.ui-tabs-nav > li.ui-tabs-active > a.ui-tabs-anchor.group-category-tab-link');
                const groupCategoryId = tabAnchor.href.match(/tab-(\d+)$/)[1];

                // Add a click handler to the new menu item
                exportLink = menu.lastElementChild;
                exportLink.addEventListener('click', async () => {
                    const groupCategory = await getGroupCategory(groupCategoryId);

                    // Create a new workbook
                    const workbook = WorkbookUtils.book_new();
                    const fileName = `${groupCategory.name}.xlsx`;
                    const overviewWorksheet = WorkbookUtils.aoa_to_sheet([[...userHeader, __('group_name')]]);
                    let overviewData = [];

                    // Add the overview sheet to the workbook
                    WorkbookUtils.book_append_sheet(workbook, overviewWorksheet, __('overview'));

                    // Add a worksheet for each group and add the users
                    for (const group of groupCategory.groups) {
                        const groupName = normalizeWorksheetName(group.name);
                        const groupData = group.users.map(userMapper);
                        const groupWorksheet = WorkbookUtils.json_to_sheet(groupData, { header: userHeader });

                        // Add the worksheet to the workbook
                        WorkbookUtils.book_append_sheet(workbook, groupWorksheet, groupName);

                        // Add the group data to the overview
                        overviewData = overviewData.concat(groupData.map(user => (user[__('group_name')] = group.name, user)));
                    }

                    // Add the users to the overview page
                    WorkbookUtils.sheet_add_json(overviewWorksheet, overviewData, { skipHeader: true, origin: 1 });

                    // Write the workbook to a file and download it
                    writeWorkbookToFile(workbook, fileName);
                });
            }
        });
    });

    return {
        ...require('../package.json'),
        title: __('package.title'),
        description: __('package.description')
    };
}
