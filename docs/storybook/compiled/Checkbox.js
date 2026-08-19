/* GENERATED from source_examples/common/Checkbox.vue by tools/build-storybook.mjs — do not edit. */

// source_examples/common/Checkbox.vue
import { defineComponent as _defineComponent } from "vue";
import { normalizeClass as _normalizeClass, createElementVNode as _createElementVNode, toDisplayString as _toDisplayString, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue";
import { computed } from "vue";
var _hoisted_1 = ["for"];
var _hoisted_2 = ["id", "autocomplete"];
var labelBaseClass = "flex items-center w-fit text-body-primary cursor-pointer";
var inputBaseClass = "cursor-pointer transition-colors";
var __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "Checkbox",
  props: {
    id: { type: String, required: true },
    label: { type: String, required: true },
    variant: { type: String, required: false },
    size: { type: String, required: false }
  },
  setup(__props) {
    const props = __props;
    const checkboxSize = computed(() => {
      switch (props.size) {
        case "small":
          return "w-4 h-4 before:w-[0.5em] before:h-[0.5em]";
        default:
          return "w-6 h-6 before:w-[0.75em] before:h-[0.75em]";
      }
    });
    const labelSize = computed(() => {
      switch (props.size) {
        case "small":
          return "text-xs";
        default:
          return "text-sm";
      }
    });
    const labelVariantClass = computed(() => {
      switch (props.variant) {
        case "secondary":
          return `${labelBaseClass} ${labelSize.value} gap-2 py-2 px-3 bg-surface-secondary rounded-lg`;
        default:
          return `${labelBaseClass} ${labelSize.value} gap-3`;
      }
    });
    const inputVariantClass = computed(() => {
      switch (props.variant) {
        case "secondary":
          return `${inputBaseClass} ${checkboxSize.value} outline-2 outline-surface-quaternary checked:bg-action checked:outline-none hover:outline-action`;
        default:
          return `${inputBaseClass} ${checkboxSize.value} border-2 border-outline-primary-hover hover:border-action`;
      }
    });
    return (_ctx, _cache) => {
      return _openBlock(), _createElementBlock("label", {
        for: __props.id,
        class: _normalizeClass(labelVariantClass.value)
      }, [
        _createElementVNode("input", {
          id: __props.id,
          type: "checkbox",
          autocomplete: __props.id,
          class: _normalizeClass(inputVariantClass.value)
        }, null, 10, _hoisted_2),
        _createElementVNode(
          "span",
          null,
          _toDisplayString(__props.label),
          1
          /* TEXT */
        )
      ], 10, _hoisted_1);
    };
  }
});
__sfc__.__scopeId = "data-v-b7ef7edb";
__sfc__.__file = "source_examples/common/Checkbox.vue";
var __css__ = `
input[data-v-b7ef7edb] {\r
  appearance: none;\r
  -webkit-appearance: none;\r
  display: grid;\r
  place-content: center;\r
  border-radius: var(--radius-sm);
}
input[data-v-b7ef7edb]::before {\r
  content: '';\r
  transform: scale(0);\r
  transition: var(--default-transition-duration) transform ease-in-out;\r
  background-image: url("../../assets/images/checked-icon.svg");\r
  background-repeat: no-repeat;\r
  background-position: center center;
}
input[data-v-b7ef7edb]:hover::before,\r
input[data-v-b7ef7edb]:checked::before {\r
  transform: scale(1);\r
  transform-origin: center center;
}\r
`;
if (typeof document !== "undefined" && !document.getElementById("sfc-style-b7ef7edb")) {
  const el = document.createElement("style");
  el.id = "sfc-style-b7ef7edb";
  el.textContent = __css__;
  document.head.appendChild(el);
}
var Checkbox_default = __sfc__;
export {
  Checkbox_default as default
};
