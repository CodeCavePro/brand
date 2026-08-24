import { paths } from "@helpers/paths.ts";

export interface Link {
    name: string
    href: string
}

export const services: Link[] = [
    {name: 'AR & VR', href: paths.arVr},
    {name: 'Cloud services', href: paths.devops},
    {name: 'DevOps', href: paths.devops},
    {name: 'E-commerce', href: paths.ecommerce},
    {name: 'Web development', href: paths.ecommerce},
    {name: 'UX\\UI design', href: paths.ecommerce},
    {name: 'QA & testing', href: paths.ecommerce},
    {name: 'Automation & AI', href: paths.automation},
    {name: 'Autodesk plugins', href: paths.autodesk},
    {name: 'Legacy modernization', href: paths.ecommerce},
    {name: 'Data migration', href: paths.hubspot}, 
    {name: 'HubSpot', href: paths.hubspot},
]

export const industries: Link[] = [
    {name: 'eCommerce', href: '/'},
    {name: 'Logistics', href: '/'},
    {name: 'Healthcare', href: '/'},
    {name: 'Manufacturing', href: '/'},
    {name: 'Education', href: '/'},
    {name: 'Finance', href: '/'},
]

export const other: Link[] = [
    {name: 'Our projects', href: paths.projects},
    {name: 'Feedback', href: paths.testimonials},
    {name: 'How we work', href: paths.workflow},
    {name: 'Our strong points', href: paths.strongPoints},
    {name: 'Our tech stack', href: paths.toolsAndTechnologies},
    {name: 'All Insights', href: paths.insights},
    {name: 'F.A.Q.', href: '/#questions'}, 
]

export const reviews: Link[] = [
    {name: 'Trustpilot', href: 'https://www.trustpilot.com/review/codecave.pro'},
    {name: 'Glassdoor', href: 'https://www.glassdoor.com/Reviews/Employee-Review-CodeCave-E8324784-RVW95188942.htm'},
    {name: 'Clutch', href: 'https://clutch.co/profile/codecave-0-1'},
    {name: 'G2', href: 'https://www.g2.com/products/codecave/expertises'},
]

export const legal: Link[] = [
    {name: 'Cookie policy', href: paths.cookiePolicy},
    {name: 'Privacy policy', href: paths.privacyPolicy},
]
