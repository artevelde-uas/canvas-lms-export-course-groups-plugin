import { router, dom, api, messages } from '@artevelde-uas/canvas-lms-app';
import { writeFile as writeWorkbookToFile } from 'xlsx';
import { utils as WorkbookUtils } from 'xlsx';
import { getNormalizedWorksheetNames, keyValueArraysToMap } from './util.js';

import t from './i18n';


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
            api.get(`/group_categories/${groupCategoryId}/groups`)
        ]);

        // Fetch the users from all the groups
        groupCategory.groups = await Promise.all(groups.map(async group => {
            group.users = await api.get(`/groups/${group.id}/users`);

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

            if (exportLink !== null) return;

            // Append the menu item to the actions menu
            menu.insertAdjacentHTML('beforeend', `
                <li class="ui-menu-item" role="presentation">
                    <a href="#" class="icon-export export-category ui-corner-all" id="ui-id-8" tabindex="-1" role="menuitem">
                        ${t('export_as_excel')}
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
                const groupNames = groupCategory.groups.map(group => group.name);
                const normalizedGroupNames = getNormalizedWorksheetNames(groupNames);
                const groupNamesMap = keyValueArraysToMap(groupCategory.groups, normalizedGroupNames);
                
                try {
                    // Create a new workbook
                    const workbook = WorkbookUtils.book_new();
                    const fileName = `${groupCategory.name}.xlsx`;
                    const overviewWorksheet = WorkbookUtils.aoa_to_sheet([[...userHeader, t('group_name')]]);
                    let overviewData = [];

                    // Add the overview sheet to the workbook
                    WorkbookUtils.book_append_sheet(workbook, overviewWorksheet, t('overview'));

                    // Add a worksheet for each group and add the users
                    for (const group of groupCategory.groups) {
                        const groupName = groupNamesMap.get(group);
                        const groupData = group.users.map(userMapper);
                        const groupWorksheet = WorkbookUtils.json_to_sheet(groupData, { header: userHeader });

                        // Add the worksheet to the workbook
                        WorkbookUtils.book_append_sheet(workbook, groupWorksheet, groupName);

                        // Add the group data to the overview
                        overviewData = overviewData.concat(groupData.map(user => (user[t('group_name')] = group.name, user)));
                    }

                    // Add the users to the overview page
                    WorkbookUtils.sheet_add_json(overviewWorksheet, overviewData, { skipHeader: true, origin: 1 });

                    // Write the workbook to a file and download it
                    writeWorkbookToFile(workbook, fileName);
                } catch (err) {
                    messages.addFlashMessage(err.message, { type: 'error' });
                }
            });
        });
    });

    return {
        ...require('../package.json'),
        title: t('package.title'),
        description: t('package.description')
    };
}
