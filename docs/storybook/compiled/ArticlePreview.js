/* GENERATED from @codecavepro/brand/components/common/ArticlePreview.vue by tools/build-storybook.mjs — do not edit. */

// ../packages/brand/dist/src/components/common/ArticlePreview.vue
import { defineComponent as _defineComponent } from "vue";
import { createCommentVNode as _createCommentVNode, createElementVNode as _createElementVNode, unref as _unref, toDisplayString as _toDisplayString, resolveDynamicComponent as _resolveDynamicComponent, normalizeClass as _normalizeClass, withCtx as _withCtx, openBlock as _openBlock, createBlock as _createBlock, Fragment as _Fragment, createElementBlock as _createElementBlock } from "vue";

// ../packages/brand/dist/src/helpers/date-formatter.ts
var formattedDate = (locale, date) => {
  if (!locale || !date) return "";
  const newDate = new Date(date);
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(newDate);
};

// ../packages/brand/dist/src/components/common/ArticlePreview.vue
var _hoisted_1 = { class: "flex flex-col sm:flex-row gap-5 sm:gap-8 h-fit" };
var _hoisted_2 = ["src", "alt"];
var _hoisted_3 = { class: "space-y-2 sm:space-y-3" };
var _hoisted_4 = ["datetime"];
var _hoisted_5 = { class: "font-bold text-lg md:text-xl text-heading" };
var _hoisted_6 = { class: "text-sm flex flex-col justify-between h-full" };
var _hoisted_7 = { class: "text-body-secondary-lighter" };
var _hoisted_8 = { class: "text-xs sm:text-sm text-body-secondary mt-6 sm:mt-7" };
var __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "ArticlePreview",
  props: {
    article: { type: Object, required: true },
    className: { type: String, required: false },
    resolveImage: { type: Function, required: false },
    basePath: { type: String, required: false }
  },
  setup(__props) {
    const props = __props;
    const imageUrl = (url) => props.resolveImage?.(url) ?? url;
    return (_ctx, _cache) => {
      return _openBlock(), _createElementBlock(
        _Fragment,
        null,
        [
          _createCommentVNode(" A draft with no slug has nowhere to go, and `slug` is typed `string |\n       null` precisely because a CMS leaves it null until publish. Interpolated\n       unguarded this built `/insights/null/` -- a card that looked entirely\n       normal and linked to a 404. Without a destination it is not a link. "),
          (_openBlock(), _createBlock(_resolveDynamicComponent(__props.article.slug ? "a" : "div"), {
            href: __props.article.slug ? `${__props.basePath ?? ""}${__props.article.slug}/` : void 0,
            class: _normalizeClass(`mx-1 lg:mx-2 w-full h-full self-start sm:self-auto p-6 flex flex-col gap-5 sm:gap-8
      rounded-[2.25rem] bg-surface-secondary hover:bg-surface-secondary transition-colors cursor-pointer border-surface-tertiary border
      ${__props.className ?? ""}`)
          }, {
            default: _withCtx(() => [
              _createElementVNode("div", _hoisted_1, [
                _createElementVNode("img", {
                  loading: "lazy",
                  class: "sm:w-[132px] sm:h-[132px] rounded-xl object-cover",
                  src: imageUrl(__props.article.cover.url),
                  alt: __props.article.cover.alternativeText ?? "",
                  width: 100,
                  height: 100
                }, null, 8, _hoisted_2),
                _createElementVNode("div", _hoisted_3, [
                  _createElementVNode("time", {
                    class: "text-body-secondary text-xs sm:text-sm",
                    datetime: __props.article.date?.toString()
                  }, _toDisplayString(_unref(formattedDate)(__props.article.locale, __props.article.date)), 9, _hoisted_4),
                  _createElementVNode(
                    "h3",
                    _hoisted_5,
                    _toDisplayString(__props.article.title),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              _createElementVNode("div", _hoisted_6, [
                _createElementVNode(
                  "p",
                  _hoisted_7,
                  _toDisplayString(__props.article.excerpt),
                  1
                  /* TEXT */
                ),
                _createElementVNode(
                  "p",
                  _hoisted_8,
                  " Reading time: " + _toDisplayString(__props.article.readingtime) + " m. ",
                  1
                  /* TEXT */
                )
              ])
            ]),
            _: 1
            /* STABLE */
          }, 8, ["href", "class"]))
        ],
        2112
        /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
      );
    };
  }
});
__sfc__.__file = "authored/common/ArticlePreview.vue";
var ArticlePreview_default = __sfc__;
export {
  ArticlePreview_default as default
};
