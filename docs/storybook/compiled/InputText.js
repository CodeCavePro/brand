/* GENERATED from source_examples/common/InputText.vue by tools/build-storybook.mjs — do not edit. */

// source_examples/common/InputText.vue
import { defineComponent as _defineComponent } from "vue";
import { toDisplayString as _toDisplayString, createElementVNode as _createElementVNode2, openBlock as _openBlock2, createBlock as _createBlock, createCommentVNode as _createCommentVNode, normalizeClass as _normalizeClass, createElementBlock as _createElementBlock2 } from "vue";

// source_examples/assets/icons/asterisk-icon.vue
import { createElementVNode as _createElementVNode, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue";
var _hoisted_1 = {
  width: "16",
  height: "17",
  viewBox: "0 0 16 17",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
};
function render(_ctx, _cache) {
  return _openBlock(), _createElementBlock("svg", _hoisted_1, [..._cache[0] || (_cache[0] = [
    _createElementVNode(
      "path",
      {
        d: "M8.00008 13.8337V8.50033M8.00008 8.50033V3.16699M8.00008 8.50033H13.3334M8.00008 8.50033H2.66675",
        stroke: "var(--color-primary-500)",
        "stroke-linecap": "round"
      },
      null,
      -1
      /* CACHED */
    ),
    _createElementVNode(
      "path",
      {
        opacity: "0.5",
        d: "M11.7714 4.72852L8.00024 8.49965M8.00024 8.49965L4.2289 12.271M8.00024 8.49965L4.22876 4.72863M8.00024 8.49965L11.7712 12.2711",
        stroke: "var(--color-primary-500)",
        "stroke-linecap": "round"
      },
      null,
      -1
      /* CACHED */
    )
  ])]);
}
var __sfc__ = { render };
__sfc__.__file = "source_examples/assets/icons/asterisk-icon.vue";
var asterisk_icon_default = __sfc__;

// source_examples/common/InputText.vue
var _hoisted_12 = { class: "w-full relative" };
var _hoisted_2 = ["for"];
var _hoisted_3 = ["id", "type", "autocomplete", "placeholder", "required", "value"];
var _hoisted_4 = {
  key: 0,
  class: "text-error text-xs"
};
var __sfc__2 = /* @__PURE__ */ _defineComponent({
  __name: "InputText",
  props: {
    id: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, required: true },
    autocomplete: { type: String, required: false },
    placeholder: { type: String, required: true },
    isRequired: { type: Boolean, required: false },
    isError: { type: Boolean, required: false },
    errorMessage: { type: String, required: false },
    modelValue: { type: String, required: false }
  },
  emits: ["update:modelValue"],
  setup(__props) {
    return (_ctx, _cache) => {
      return _openBlock2(), _createElementBlock2("div", _hoisted_12, [
        _createElementVNode2("label", {
          for: __props.id,
          class: "absolute flex items-center gap-0.5 pl-3 pt-3 font-bold text-heading text-sm"
        }, [
          _createElementVNode2(
            "span",
            null,
            _toDisplayString(__props.label),
            1
            /* TEXT */
          ),
          __props.isRequired ? (_openBlock2(), _createBlock(asterisk_icon_default, { key: 0 })) : _createCommentVNode("v-if", true)
        ], 8, _hoisted_2),
        _createElementVNode2("input", {
          id: __props.id,
          type: __props.type,
          autocomplete: __props.autocomplete,
          placeholder: __props.placeholder,
          required: __props.isRequired,
          value: __props.modelValue,
          onInput: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("update:modelValue", $event.target.value)),
          class: _normalizeClass(`
        w-full p-3 pt-7 bg-surface-secondary rounded-lg placeholder:text-xs placeholder:text-body-secondary
        focus:outline-none transition-colors
        hover:bg-surface-tertiary
        ${__props.isError ? "text-error input-error focus:text-error" : "text-hovered focus:text-hovered"}
       `)
        }, null, 42, _hoisted_3),
        __props.isError ? (_openBlock2(), _createElementBlock2(
          "span",
          _hoisted_4,
          _toDisplayString(__props.errorMessage),
          1
          /* TEXT */
        )) : _createCommentVNode("v-if", true)
      ]);
    };
  }
});
__sfc__2.__scopeId = "data-v-01d686cd";
__sfc__2.__file = "source_examples/common/InputText.vue";
var __css__ = "\ninput[data-v-01d686cd]:-webkit-autofill,\ninput[data-v-01d686cd]:-webkit-autofill:hover,\ninput[data-v-01d686cd]:-webkit-autofill:focus,\ninput[data-v-01d686cd]:-webkit-autofill:active {\n  -webkit-box-shadow: 0 0 0 1000px var(--color-surface-tertiary) inset !important;\n  -webkit-text-fill-color: var(--color-heading) !important;\n  -webkit-background-clip: text !important;\n}\ninput[data-v-01d686cd]:focus {\n  box-shadow: 0 0 16px 0 hsl(from var(--color-brand-500) h s l / 0.5),\n    0 0 4px 0 hsl(from var(--color-brand-500) h s l / 0.6);\n}\ninput.input-error[data-v-01d686cd]:focus,\n.input-error[data-v-01d686cd] {\n  box-shadow: 0 0 16px 0 hsl(from var(--color-error-200) h s l / 0.5),\n    0 0 4px 0 hsl(from var(--color-error-100) h s l / 0.6);\n}\n";
if (typeof document !== "undefined" && !document.getElementById("sfc-style-01d686cd")) {
  const el = document.createElement("style");
  el.id = "sfc-style-01d686cd";
  el.textContent = __css__;
  document.head.appendChild(el);
}
var InputText_default = __sfc__2;
export {
  InputText_default as default
};
