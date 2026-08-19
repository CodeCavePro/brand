import { strapiUrl } from "../lib/strapi"

export const getImageUrl = (url: string) => {
    return `${strapiUrl}/${url}`
}
