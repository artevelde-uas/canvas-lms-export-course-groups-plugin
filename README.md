# Canvas LMS Export Course Groups Plug-in

[![](https://img.shields.io/npm/v/@artevelde-uas/canvas-lms-export-course-groups-plugin.svg)](https://www.npmjs.com/package/@artevelde-uas/canvas-lms-export-course-groups-plugin)
[![](https://img.shields.io/github/license/artevelde-uas/canvas-lms-export-course-groups-plugin.svg)](https://spdx.org/licenses/MIT)
[![](https://img.shields.io/npm/dt/@artevelde-uas/canvas-lms-export-course-groups-plugin.svg)](https://www.npmjs.com/package/@artevelde-uas/canvas-lms-export-course-groups-plugin)

Plugin for the [Canvas LMS theme app](https://github.com/artevelde-uas/canvas-lms-app) that adds a menu item to export
course groups as Excel.

## Installation

Using NPM:

    npm install @artevelde-uas/canvas-lms-export-course-groups-plugin

Using Yarn:

    yarn add @artevelde-uas/canvas-lms-export-course-groups-plugin

## Usage

Just import the plug-in and add it to the Canvas app:

```javascript
import canvas from '@artevelde-uas/canvas-lms-app';
import exportCourseGroupsPlugin from '@artevelde-uas/canvas-lms-export-course-groups-plugin';

canvas.addPlugin(exportCourseGroupsPlugin);

canvas.run();
```
