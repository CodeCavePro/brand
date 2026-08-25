/* GENERATED from @codecavepro/brand/components/common/Button.vue by tools/build-storybook.mjs — do not edit. */

// ../packages/brand/dist/src/components/common/Button.vue
import { defineComponent as _defineComponent } from "vue";
import { createCommentVNode as _createCommentVNode, toDisplayString as _toDisplayString, createElementVNode as _createElementVNode, renderSlot as _renderSlot, normalizeClass as _normalizeClass, openBlock as _openBlock, createElementBlock as _createElementBlock, createTextVNode as _createTextVNode, Fragment as _Fragment } from "vue";
import { computed } from "vue";
var _hoisted_1 = ["href", "aria-disabled"];
var _hoisted_2 = ["disabled"];
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
    const buttonBaseClass = computed(() => `flex items-center justify-center
${props.isDisabled ? "cursor-not-allowed opacity-20" : "cursor-pointer"}
w-fit max-w-full min-w-12 min-h-12 rounded-full text-body-primary font-bold transition-colors`);
    const variantClass = computed(() => {
      switch (props.variant) {
        case "secondary":
          return `${buttonBaseClass.value} px-6 py-1 bg-primary-900 hover:bg-surface-tertiary`;
        case "tertiary":
          return `${buttonBaseClass.value} px-6 py-1 border border-primary-500 hover:border-primary-700`;
        case "icon":
          return `${buttonBaseClass.value} p-5 border border-primary-500 hover:border-primary-700`;
        case "ghost":
          return `${linkBaseClass} text-body-primary hover:text-primary-200 active:text-primary-200 font-bold px-6 py-2`;
        case "text":
          return `${linkBaseClass} text-body-secondary-lighter hover:text-primary-200 active:text-primary-200`;
        case "link":
          return `${linkBaseClass} text-hovered underline`;
        default:
          return `${buttonBaseClass.value} bg-primary-500 hover:bg-primary-700 active:bg-primary-900`;
      }
    });
    return (_ctx, _cache) => {
      return _openBlock(), _createElementBlock(
        _Fragment,
        null,
        [
          _createCommentVNode(" A disabled anchor is a different mechanism from a disabled button: there\n       is no `disabled` attribute for <a>, and adding one styles nothing and\n       prevents nothing. Dropping href is what actually takes it out of the tab\n       order and stops activation; aria-disabled is what says so out loud. "),
          props.as === "link" ? (_openBlock(), _createElementBlock("a", {
            key: 0,
            href: props.isDisabled ? void 0 : props.href,
            "aria-disabled": props.isDisabled ? "true" : void 0,
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
          ], 10, _hoisted_1)) : (_openBlock(), _createElementBlock("button", {
            key: 1,
            disabled: props.isDisabled,
            class: _normalizeClass([variantClass.value, props.class ?? ""])
          }, [
            _createTextVNode(
              _toDisplayString(__props.title) + " ",
              1
              /* TEXT */
            ),
            _renderSlot(_ctx.$slots, "default")
          ], 10, _hoisted_2))
        ],
        2112
        /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
      );
    };
  }
});
__sfc__.__file = "authored/common/Button.vue";
var Button_default = __sfc__;
export {
  Button_default as default
};
