import { paths } from "@helpers/paths.ts";
import type { Component } from "vue";
import CartIcon from "@codecavepro/brand/assets/icons/cart-icon.vue";
import CloudIcon from "@codecavepro/brand/assets/icons/cloud-icon.vue";
import DatabaseIcon from "@codecavepro/brand/assets/icons/database-icon.vue";
import LightningIcon from "@codecavepro/brand/assets/icons/lightning-icon.vue";
import PanoramaIcon from "@codecavepro/brand/assets/icons/panorama-icon.vue";
import WidgetIcon from "@codecavepro/brand/assets/icons/widget-icon.vue";

interface Submenu {
    icon: Component
    name: string
    description: string
    link: string
}

interface Menu {
    name: string
    link?: string
    submenuTitle?: string
    submenu?: Submenu[]
    /* The drawer calls two of these something else -- it has the room, and a
       phone gets one shot at the label. These used to be `item.name ===
       'Workflow'` and `item.name === 'Contact us'` branches inside
       mobile-menu.vue, which made the component's markup depend on the exact
       wording of this file. */
    mobileTitle?: string
    /* Renders as the drawer's one solid button rather than a ghost link. */
    emphasis?: boolean
}

export const menu: Menu[] = [
    {
        name: 'Services',
        submenuTitle: 'Services',
        submenu: [
            {icon: CloudIcon, name: 'Cloud & DevOps', description: 'Optimize costs. Protect your Data', link: paths.devops},
            {icon: CartIcon, name: 'eCommerce', description: 'Maximize revenue, dominate Markets', link: paths.ecommerce},
            {icon: WidgetIcon, name: 'Autodesk plugins', description: '10x efficiency with custom Plugins', link: paths.autodesk},
            {icon: LightningIcon, name: 'Automation & AI', description: 'Leverage virtual Workforce', link: paths.automation},
            {icon: DatabaseIcon, name: 'HubSpot', description: 'Aggregate data from all your Tools', link: paths.hubspot},
            {icon: PanoramaIcon, name: 'AR & VR', description: 'Stunning visualisations for your business', link: paths.arVr},
        ]
    },
    {name: 'Workflow', link: paths.workflow, mobileTitle: 'About us | Workflow'},
    {name: 'Projects', link: paths.projects},
    {name: 'Insights', link: paths.insights},
    {name: 'Contact us', link: paths.contactUs, mobileTitle: 'Get a free consultation', emphasis: true},
]
