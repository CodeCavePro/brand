/* GENERATED from @codecavepro/brand/components/footer/link-group.vue by tools/build-storybook.mjs — do not edit. */

// ../packages/brand/dist/src/footer/link-group.vue
import { defineComponent as _defineComponent2 } from "vue";
import { toDisplayString as _toDisplayString2, createElementVNode as _createElementVNode2, renderList as _renderList, Fragment as _Fragment, openBlock as _openBlock2, createElementBlock as _createElementBlock2, createVNode as _createVNode } from "vue";

// ../packages/brand/dist/src/common/Button.vue
import { defineComponent as _defineComponent } from "vue";
import { toDisplayString as _toDisplayString, createElementVNode as _createElementVNode, renderSlot as _renderSlot, normalizeClass as _normalizeClass, openBlock as _openBlock, createElementBlock as _createElementBlock, createTextVNode as _createTextVNode } from "vue";
import { computed } from "vue";
var _hoisted_1 = ["href"];
var linkBaseClass = "flex transition-colors";
var __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "Button",
  props: {
    isDisabled: { type: Boolean, required: false },
    title: { type: String, required: false },
    as: { type: String, required: false },
    href: { type: String, required: false },
    variant: { type: String, required: false },
    type: { type: String, required: false },
    class: { type: String, required: false }
  },
  setup(__props) {
    const props = __props;
    const buttonBaseClass = `flex items-center justify-center
${props.isDisabled ? "cursor-not-allowed opacity-20" : "cursor-pointer"}
w-fit max-w-full min-w-12 min-h-12 rounded-full text-body-primary font-bold transition-colors`;
    const variantClass = computed(() => {
      switch (props.variant) {
        case "secondary":
          return `${buttonBaseClass} px-6 py-1 bg-primary-900 hover:bg-surface-tertiary`;
        case "tertiary":
          return `${buttonBaseClass} px-6 py-1 border border-primary-500 hover:border-primary-700`;
        case "icon":
          return `${buttonBaseClass} p-5 border border-primary-500 hover:border-primary-700`;
        case "ghost":
          return `${linkBaseClass} text-body-primary hover:text-primary-200 active:text-primary-200 font-bold px-6 py-2`;
        case "text":
          return `${linkBaseClass} text-body-secondary-lighter hover:text-primary-200 active:text-primary-200`;
        case "link":
          return `${linkBaseClass} text-hovered underline`;
        default:
          return `${buttonBaseClass} bg-primary-500 hover:bg-primary-700 active:bg-primary-900`;
      }
    });
    return (_ctx, _cache) => {
      return props.as === "link" ? (_openBlock(), _createElementBlock("a", {
        key: 0,
        href: props.href,
        class: _normalizeClass([variantClass.value, props.class ?? ""])
      }, [
        _createElementVNode(
          "span",
          null,
          _toDisplayString(__props.title),
          1
          /* TEXT */
        ),
        _renderSlot(_ctx.$slots, "default")
      ], 10, _hoisted_1)) : (_openBlock(), _createElementBlock(
        "button",
        {
          key: 1,
          class: _normalizeClass([variantClass.value, props.class ?? ""])
        },
        [
          _createTextVNode(
            _toDisplayString(__props.title) + " ",
            1
            /* TEXT */
          ),
          _renderSlot(_ctx.$slots, "default")
        ],
        2
        /* CLASS */
      ));
    };
  }
});
__sfc__.__file = "authored/common/Button.vue";
var Button_default = __sfc__;

// ../packages/brand/dist/src/footer/link-group.vue
var _hoisted_12 = { class: "space-y-4" };
var _hoisted_2 = { class: "text-body-secondary uppercase font-bold text-xs" };
var _hoisted_3 = { class: "space-y-3 xl:space-y-2 text-sm" };
var __sfc__2 = /* @__PURE__ */ _defineComponent2({
  __name: "link-group",
  props: {
    groupName: { type: String, required: true },
    items: { type: Array, required: true }
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return _openBlock2(), _createElementBlock2("div", _hoisted_12, [
        _createElementVNode2(
          "p",
          _hoisted_2,
          _toDisplayString2(__props.groupName),
          1
          /* TEXT */
        ),
        _createElementVNode2("div", _hoisted_3, [
          (_openBlock2(true), _createElementBlock2(
            _Fragment,
            null,
            _renderList(__props.items, (item, index) => {
              return _openBlock2(), _createElementBlock2("div", { key: index }, [
                _createVNode(Button_default, {
                  title: item.name,
                  as: "link",
                  href: item.href,
                  variant: "text"
                }, null, 8, ["title", "href"])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]);
    };
  }
});
__sfc__2.__file = "authored/footer/link-group.vue";
var link_group_default = __sfc__2;
export {
  link_group_default as default
};
