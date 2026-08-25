import { setProjectAnnotations } from '@storybook/vue3-vite';
import { beforeAll } from 'vitest';
import * as preview from './preview';

// Without this the run gets Storybook's defaults instead of this project's:
// no preview.css, so no tokens and no utilities, and every story renders
// unstyled. Assertions about behaviour would still pass, which is the trap --
// anything about appearance would fail for a reason that has nothing to do with
// the component.
const project = setProjectAnnotations([preview.default]);

beforeAll(project.beforeAll);
