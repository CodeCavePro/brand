import { paths } from "../../helpers/paths.ts";
import type { Component } from "vue";
import CloudIcon from "../../assets/icons/cloud-icon.vue";
import CartIcon from "../../assets/icons/cart-icon.vue";
import WidgetIcon from "../../assets/icons/widget-icon.vue";
import LightningIcon from "../../assets/icons/lightning-icon.vue";
import DatabaseIcon from "../../assets/icons/database-icon.vue";
import PanoramaIcon from "../../assets/icons/panorama-icon.vue";

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
}

export const menu: Menu[] = [
    {
        name: 'Services',
        submenuTitle: 'Services',
        submenu: [
            {icon: CloudIcon, name: 'Cloud & DevOps', description: 'Optimize costs. Protect your Data', link: paths.devops},
            {icon: CartIcon, name: 'E-Commerce', description: 'Maximize revenue, dominate Markets', link: paths.ecommerce},
            {icon: WidgetIcon, name: 'Autodesk plugins', description: '10x efficiency with custom Plugins', link: paths.autodesk},
            {icon: LightningIcon, name: 'Automation & AI', description: 'Leverage virtual Workforce', link: paths.automation},
            {icon: DatabaseIcon, name: 'HubSpot', description: 'Aggregate data from all your Tools', link: paths.hubspot},
            {icon: PanoramaIcon, name: 'AR & VR', description: 'Stunning visualisations for your business', link: paths.arVr},
        ]
    },
    {name: 'Workflow', link: paths.workflow},
    {name: 'Projects', link: paths.projects},
    {name: 'Insights', link: paths.insights},
    {name: 'Contact us', link: paths.contactUs},
]
