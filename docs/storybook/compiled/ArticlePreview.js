/* GENERATED from source_examples/common/ArticlePreview.vue by tools/build-storybook.mjs — do not edit. */

// source_examples/common/ArticlePreview.vue
import { defineComponent as _defineComponent } from "vue";
import { unref as _unref, createElementVNode as _createElementVNode, toDisplayString as _toDisplayString, normalizeClass as _normalizeClass, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue";

// source_examples/helpers/date-formatter.ts
var formattedDate = (locale, date) => {
  if (!locale || !date) return "";
  const newDate = new Date(date);
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(newDate);
};

// source_examples/lib/strapi.ts
var strapiUrl = "https://strapi.azure.codecave.network";

// source_examples/helpers/image-url.ts
var getImageUrl = (url) => {
  return `${strapiUrl}/${url}`;
};

// source_examples/helpers/paths.ts
var services = "/services";
var paths = {
  home: "/",
  devops: `${services}/devops`,
  autodesk: `${services}/autodesk`,
  hubspot: `${services}/hubspot`,
  ecommerce: `${services}/ecommerce`,
  automation: `${services}/automation`,
  arVr: `${services}/ar-vr`,
  workflow: "/workflow",
  projects: "/projects",
  insights: "/insights",
  contactUs: "/#contact-us",
  cookiePolicy: "/cookie-policy",
  privacyPolicy: "/privacy-policy",
  testimonials: "/#testimonials",
  strongPoints: "/workflow/#our-strong-point",
  toolsAndTechnologies: "/workflow/#tools-and-technologies"
};

// source_examples/common/ArticlePreview.vue
var _hoisted_1 = ["href"];
var _hoisted_2 = { class: "flex flex-col sm:flex-row gap-5 sm:gap-8 h-fit" };
var _hoisted_3 = ["src", "alt"];
var _hoisted_4 = { class: "space-y-2 sm:space-y-3" };
var _hoisted_5 = ["datetime"];
var _hoisted_6 = { class: "font-bold text-lg md:text-xl text-heading" };
var _hoisted_7 = { class: "text-sm flex flex-col justify-between h-full" };
var _hoisted_8 = { class: "text-body-secondary-lighter" };
var _hoisted_9 = { class: "text-xs sm:text-sm text-body-secondary mt-6 sm:mt-7" };
var __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "ArticlePreview",
  props: {
    article: { type: null, required: true },
    className: { type: String, required: false }
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return _openBlock(), _createElementBlock("a", {
        href: `${_unref(paths).insights}/${__props.article.slug}`,
        class: _normalizeClass(`mx-1 lg:mx-2 w-full h-full self-start sm:self-auto p-6 flex flex-col gap-5 sm:gap-8
      rounded-[2.25rem] bg-surface-secondary hover:bg-surface-secondary transition-colors cursor-pointer border-surface-tertiary border
      ${__props.className ?? ""}`)
      }, [
        _createElementVNode("div", _hoisted_2, [
          _createElementVNode("img", {
            loading: "lazy",
            class: "sm:w-[132px] sm:h-[132px] rounded-xl object-cover",
            src: _unref(getImageUrl)(__props.article.cover.url),
            alt: __props.article.cover.name,
            width: 100,
            height: 100
          }, null, 8, _hoisted_3),
          _createElementVNode("div", _hoisted_4, [
            _createElementVNode("time", {
              class: "text-body-secondary text-xs sm:text-sm",
              datetime: __props.article.date?.toString()
            }, _toDisplayString(_unref(formattedDate)(__props.article.locale, __props.article.date)), 9, _hoisted_5),
            _createElementVNode(
              "h2",
              _hoisted_6,
              _toDisplayString(__props.article.title),
              1
              /* TEXT */
            )
          ])
        ]),
        _createElementVNode("div", _hoisted_7, [
          _createElementVNode(
            "p",
            _hoisted_8,
            _toDisplayString(__props.article.excerpt),
            1
            /* TEXT */
          ),
          _createElementVNode(
            "p",
            _hoisted_9,
            " Reading time: " + _toDisplayString(__props.article.readingtime) + " m. ",
            1
            /* TEXT */
          )
        ])
      ], 10, _hoisted_1);
    };
  }
});
__sfc__.__file = "source_examples/common/ArticlePreview.vue";
var ArticlePreview_default = __sfc__;
export {
  ArticlePreview_default as default
};
