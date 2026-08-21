import { strapiUrl } from "../lib/strapi"

/* Callers pass both "uploads/x.png" and "/uploads/x.png". Joining naively
 * produced "…codecave.network//uploads/x.png" for the second form -- which
 * servers tolerate but crawlers treat as a different URL from the single-slash
 * one, so an og:image and the same image on the page deduplicate as two. */
export const getImageUrl = (url: string) => {
    return `${strapiUrl}/${url.replace(/^\/+/, "")}`
}
