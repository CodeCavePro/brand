/* GENERATED from source_examples/common/Radio.vue by tools/build-storybook.mjs — do not edit. */

// source_examples/common/Radio.vue
import { defineComponent as _defineComponent } from "vue";
import { createElementVNode as _createElementVNode, toDisplayString as _toDisplayString, normalizeClass as _normalizeClass, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue";
import { computed } from "vue";
var _hoisted_1 = ["for"];
var _hoisted_2 = ["id", "name", "value", "checked"];
var _hoisted_3 = { class: "text-xs whitespace-nowrap" };
var baseLabelClass = "w-fit flex items-center cursor-pointer text-body-primary transition-colors";
var __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "Radio",
  props: {
    id: { type: String, required: true },
    label: { type: String, required: true },
    name: { type: String, required: true },
    isChecked: { type: Boolean, required: false },
    modelValue: { type: String, required: false },
    variant: { type: String, required: false }
  },
  emits: ["update:modelValue"],
  setup(__props) {
    const props = __props;
    const labelClass = computed(() => {
      switch (props.variant) {
        case "secondary":
          return `${baseLabelClass} gap-3 p-3 pr-4 bg-surface-primary-transparent rounded-custom border-2 border-surface-quaternary group-hover:bg-surface-tertiary`;
        default:
          return `${baseLabelClass} gap-2 py-2 px-3 bg-surface-secondary rounded-lg`;
      }
    });
    return (_ctx, _cache) => {
      return _openBlock(), _createElementBlock("label", {
        for: __props.id,
        class: _normalizeClass([labelClass.value])
      }, [
        _createElementVNode("input", {
          type: "radio",
          id: __props.id,
          name: __props.name,
          value: __props.id,
          class: "bg-transparent border-[2px] border-surface-quaternary checked:border-action rounded-full hover:border-action",
          checked: __props.isChecked,
          onChange: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("update:modelValue", __props.id))
        }, null, 40, _hoisted_2),
        _createElementVNode(
          "span",
          _hoisted_3,
          _toDisplayString(__props.label),
          1
          /* TEXT */
        )
      ], 10, _hoisted_1);
    };
  }
});
__sfc__.__scopeId = "data-v-3e960a13";
__sfc__.__file = "source_examples/common/Radio.vue";
var __css__ = "\ninput[data-v-3e960a13] {\n  width: 17px;\n  height: 17px;\n  appearance: none;\n  -webkit-appearance: none;\n  display: grid;\n  place-content: center;\n}\ninput[data-v-3e960a13]::before {\n  content: '';\n  width: 7px;\n  height: 7px;\n  border-radius: 50%;\n  transform: scale(0);\n  transition: var(--duration-control) transform ease-in-out;\n  background: var(--color-action);\n}\ninput[data-v-3e960a13]:checked::before {\n  transform: scale(1);\n}\n";
if (typeof document !== "undefined" && !document.getElementById("sfc-style-3e960a13")) {
  const el = document.createElement("style");
  el.id = "sfc-style-3e960a13";
  el.textContent = __css__;
  document.head.appendChild(el);
}
var Radio_default = __sfc__;
export {
  Radio_default as default
};
