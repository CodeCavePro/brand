<script setup lang="ts">
import { computed, ref, onMounted, nextTick } from 'vue';
import Shevron from '@assets/icons/shevron.vue';
import { type MenuItem } from '../lib/menus/menuTypes.ts';

interface Props {
  section?: string;
  current?: string;
  subMenu: Record<string, MenuItem[]>;
}

const props = defineProps<Props>();

const openItem = ref<string | null>(null);

const itemRefs = new Map<string, HTMLElement>();

const submenuStyle = ref({
  left: '0px',
  width: '200px'
});

const items = computed<MenuItem[]>(() => {
  return props.section ? props.subMenu[props.section] ?? [] : [];
});

const activeSubmenu = computed(() => {
  const item = items.value.find(i => i.name === openItem.value);
  return item?.subMenu ?? [];
});

function setItemRef(name: string, el: Element | null) {
  if (el instanceof HTMLElement) {
    itemRefs.set(name, el);
  } else {
    itemRefs.delete(name);
  }
}

function updateSubmenuPosition(itemName: string) {
  if (window.innerWidth < 768) {
    submenuStyle.value = {
      left: '0px',
      width: '100vw'
    };
    return;
  }

  const el = itemRefs.get(itemName);
  const nav = document.querySelector('.ds-subnav');

  if (!el || !nav) {
    return;
  }

  const elRect = el.getBoundingClientRect();
  const navRect = nav.getBoundingClientRect();

  submenuStyle.value = {
    left: `${elRect.left + elRect.width / 2 - navRect.left}px`,
    width: `${elRect.width}px`
  };
}

function openSubmenu(item: MenuItem) {
  if (!item.subMenu?.length) {
    return;
  }

  if (openItem.value === item.name) {
    openItem.value = null;
    return;
  }

  updateSubmenuPosition(item.name);
  openItem.value = item.name;
}
function closeSubmenu(event?: Event) {
  event?.stopPropagation();
  openItem.value = null;
}
async function initSubmenu() {
  await nextTick();

  const activeItem = items.value.find(
    item => item.name === props.current && item.subMenu?.length
  );

  if (!activeItem) {
    openItem.value = null;
    return;
  }

  updateSubmenuPosition(activeItem.name);
  openItem.value = activeItem.name;
}

onMounted(async () => {
  await initSubmenu();
});

</script>

<template>
  <nav v-if="items.length" class="ds-subnav" aria-label="Section">
    <div class="ds-subnav-inner" :class="{ 'is-submenu-open': openItem }">
      <ul>
        <li v-for="item in items" :key="item.name" :ref="el => setItemRef(item.name, el)">
          <div class="ds-subnav-item" @click="item.subMenu?.length ? openSubmenu(item) : closeSubmenu()">
            <component :is="item.href ? 'a' : 'span'" class="ds-subnav-link" :href="item.href" :aria-current="item.name === current ? 'page' : undefined">
              {{ item.label }}
            </component>

            <span v-if="item.subMenu?.length" class="ds-subnav-toggle" aria-hidden="true">
              <Shevron class="ds-subnav-chevron" :class="{ 'is-open': openItem === item.name }" />
            </span>
          </div>
        </li>
      </ul>
    </div>

    <Transition name="submenu">
      <div class="ds-submenu-overlay" :class="{ 'is-open': activeSubmenu.length }" :style="submenuStyle">
        <ul class="ds-submenu-list">
          <li v-for="(subItem, index) in activeSubmenu" :key="subItem.name" class="ds-submenu-item" :style="{ '--delay': `${index * 80}ms` }">
            <a :href="subItem.href" @click="closeSubmenu" class="ds-submenu-link">
              {{ subItem.label }}
            </a>
          </li>
        </ul>
      </div>
    </Transition>
  </nav>
</template>

<style>
.ds-subnav {
  position: relative;
  border-bottom: 1px solid var(--color-surface-quaternary);
  background: var(--color-surface-primary-transparent);
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
}

.ds-subnav-inner {
  box-sizing: border-box;
  max-width: var(--max-width-desktop);
  margin: 0 auto;

  overflow-x: auto;
  overflow-y: hidden;
}

.ds-subnav-inner.is-submenu-open {
  overflow: hidden;
}

@media (min-width: 768px) {
  .ds-subnav-inner {
    padding-left: var(--gutter-md);
    padding-right: var(--gutter-md);
  }
}

@media (min-width: 1280px) {
  .ds-subnav-inner {
    padding-left: var(--gutter-xl);
    padding-right: var(--gutter-xl);
  }
}

.ds-subnav ul {
  display: flex;
  align-items: center;
  justify-content: center;

  margin: 0;
  padding: 0;

  list-style: none;

  width: max-content;
  min-width: 100%;
  flex-wrap: nowrap;
}

.ds-subnav li {
  margin: 0;
  flex-shrink: 0;
}

.ds-subnav-item {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.ds-subnav-link {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: var(--control-height);
  padding: 0.5rem 1.5rem;
  border-radius: var(--radius-pill);
  color: var(--color-body-primary);
  font-family: var(--font-sans);
  font-size: var(--text-body);
  font-weight: var(--font-weight-bold);
  line-height: var(--leading-body);
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition: color var(--transition-colors);
}

.ds-subnav-link:hover,
.ds-subnav-link:active,
.ds-subnav-link[aria-current='page'] {
  color: var(--color-hovered);
}

.ds-subnav-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  margin-left: -0.75rem;
  padding: 0;

  border: 0;
  background: transparent;
  pointer-events: none;
}

.ds-subnav-chevron {
  width: 1rem;
  height: 1rem;

  color: var(--color-heading);
  pointer-events: none;

  transition:
    transform 0.25s ease,
    color 0.25s ease;

}

.ds-subnav-item:hover .ds-subnav-chevron {
  color: var(--color-hovered);
}

.ds-subnav-chevron.is-open {
  transform: rotate(180deg);
}

.ds-submenu-overlay {
  position: absolute;
  top: calc(100% + 1px);
  transform: translateX(-50%);
  z-index: 100;

  min-width: max-content;

  visibility: hidden;
  opacity: 0;
  pointer-events: none;

  background: var(--color-surface-primary);

  border: 1px solid var(--color-surface-quaternary);
  border-top: 0;
  border-radius: 0 0 1rem 1rem;
}

.ds-submenu-overlay.is-open {
  visibility: visible;
  opacity: 1;
  pointer-events: auto;
}

.ds-submenu-list {
  display: flex;
  flex-direction: column;

  margin: 0;
  padding: 0.5rem 0;

  min-width: 200px;
  max-width: 280px;

  list-style: none;
}

.ds-submenu-item {
  margin: 0;
  padding: 0;
}

.ds-submenu-link {
  box-sizing: border-box;
  --delay: 0ms;
  display: block;

  padding: 0.5rem 1.5rem;

  color: var(--color-body-primary);

  font-family: var(--font-sans);
  font-size: var(--text-body);
  font-weight: var(--font-weight-bold);
  line-height: var(--leading-body);

  text-align: center;
  text-decoration: none;

  opacity: 0;
  transform: translateY(8px);

  animation: submenuTextIn 300ms ease forwards;
  animation-delay: var(--delay);

  transition: color var(--transition-colors);
}

.ds-submenu-link:hover {
  color: var(--color-hovered);
}

@keyframes submenuTextIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 767px) {
  .ds-submenu-overlay {
    left: 0 !important;
    width: 100vw !important;
    transform: none;
  }

  .ds-submenu-list {
    width: 100%;
    max-width: none;
  }
}
</style>