/* Every value here is a COMPLETE url, trailing slash included, because
 * build.format is Astro's default 'directory' — /workflow is emitted as
 * workflow/index.html and only /workflow/ is the address of that file.
 * Written without the slash, all 716 internal links on the site were a 308
 * to the same page with one added; nothing complained because Astro's
 * trailingSlash default is 'ignore'. astro.config.mjs now sets 'always', so
 * dev 404s a slash-less route instead of quietly serving it.
 *
 * Consequence for callers: a path is a PREFIX you append to, never a
 * segment you join with a slash. Write `${paths.insights}${slug}/`, not
 * `${paths.insights}/${slug}` — the latter now yields //. scripts/check-links.mjs
 * fails the build on either mistake. */
const services = '/services'

export const paths = {
    home: '/',

    devops: `${services}/devops/`,
    autodesk: `${services}/autodesk/`,
    hubspot: `${services}/hubspot/`,
    ecommerce: `${services}/ecommerce/`,
    automation: `${services}/automation/`,
    arVr: `${services}/ar-vr/`,

    workflow: '/workflow/',
    projects: '/projects/',
    insights: '/insights/',
    contactUs: '/#contact-us',
    cookiePolicy: '/cookie-policy/',
    privacyPolicy: '/privacy-policy/',

    testimonials: '/#testimonials',
    strongPoints: '/workflow/#our-strong-point',
    toolsAndTechnologies: '/workflow/#tools-and-technologies'
}

export const websiteUrl = 'https://www.codecave.it'

/* Give an internal href the trailing slash the route table already carries.
 *
 * Links in CMS prose do not come from the table above — an editor writes
 * them, and the privacy policy links the cookie policy as a bare
 * https://www.codecave.it/cookie-policy, one 308 on a page nobody rebuilds.
 * Normalising at render time is the only fix that survives the next edit.
 *
 * Deliberately narrow: internal only, and only where the last segment has no
 * dot, so a linked .pdf keeps its own address. A #fragment or ?query is put
 * back after the slash, since /workflow#x and /workflow/#x are different
 * requests for the same reason. */
export const internalHref = (href: string): string => {
    if (!href) return href

    const rest = href.startsWith(websiteUrl)
        ? href.slice(websiteUrl.length)
        : href.startsWith('/') && !href.startsWith('//')
            ? href
            : null
    if (rest === null) return href

    const [path, tail = ''] = [rest.split(/[#?]/)[0], rest.slice(rest.split(/[#?]/)[0].length)]
    if (!path || path.endsWith('/') || path.split('/').pop()!.includes('.')) return href

    return href.slice(0, href.length - rest.length) + path + '/' + tail
}
