/* GENERATED from @codecavepro/brand/components/common/TextField.vue by tools/build-storybook.mjs — do not edit. */

// ../packages/brand/dist/src/components/common/TextField.vue
import { defineComponent as _defineComponent } from "vue";
import { toDisplayString as _toDisplayString, createElementVNode as _createElementVNode, normalizeClass as _normalizeClass, openBlock as _openBlock, createElementBlock as _createElementBlock, createCommentVNode as _createCommentVNode } from "vue";
import { ref } from "vue";
var _hoisted_1 = { class: "w-full relative" };
var _hoisted_2 = ["for"];
var _hoisted_3 = ["id", "placeholder", "value", "aria-invalid", "aria-describedby"];
var _hoisted_4 = ["id"];
var __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "TextField",
  props: {
    id: { type: String, required: true },
    label: { type: String, required: true },
    placeholder: { type: String, required: true },
    isRequired: { type: Boolean, required: false },
    isError: { type: Boolean, required: false },
    errorMessage: { type: String, required: false },
    modelValue: { type: String, required: false }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const textareaRef = ref(null);
    const autoResize = () => {
      if (textareaRef.value) {
        textareaRef.value.style.height = "auto";
        textareaRef.value.style.height = textareaRef.value.scrollHeight + "px";
      }
    };
    const onInput = (event) => {
      autoResize();
      emit("update:modelValue", event.target.value);
    };
    return (_ctx, _cache) => {
      return _openBlock(), _createElementBlock("div", _hoisted_1, [
        _createElementVNode(
          "div",
          {
            class: _normalizeClass(`focus-area flex flex-col min-h-[7.5rem] p-3 rounded-lg bg-surface-secondary hover:bg-surface-tertiary transition-colors text-heading 
      ${__props.isError ? "input-error" : ""}`)
          },
          [
            _createElementVNode("label", {
              for: __props.id,
              class: "font-bold text-sm select-none"
            }, _toDisplayString(__props.label), 9, _hoisted_2),
            _createElementVNode("textarea", {
              onInput,
              ref_key: "textareaRef",
              ref: textareaRef,
              id: __props.id,
              placeholder: __props.placeholder,
              value: __props.modelValue,
              "aria-invalid": __props.isError ? "true" : void 0,
              "aria-describedby": __props.isError ? `${__props.id}-error` : void 0,
              class: _normalizeClass(`w-full flex-grow resize-none overflow-hidden placeholder:pt-1.5 placeholder:text-xs placeholder:text-body-secondary outline-none 
        ${__props.isError ? "text-error focus:text-error" : "text-hovered focus:text-hovered"}`)
            }, null, 42, _hoisted_3)
          ],
          2
          /* CLASS */
        ),
        __props.isError ? (_openBlock(), _createElementBlock("span", {
          key: 0,
          id: `${__props.id}-error`,
          role: "alert",
          class: "text-error text-xs"
        }, _toDisplayString(__props.errorMessage), 9, _hoisted_4)) : _createCommentVNode("v-if", true)
      ]);
    };
  }
});
__sfc__.__scopeId = "data-v-1c11b6d6";
__sfc__.__file = "authored/common/TextField.vue";
var __css__ = "\n.focus-area[data-v-1c11b6d6]:focus-within {\n  box-shadow: 0 0 16px 0 hsl(from var(--color-brand-500) h s l / 0.5),\n    0 0 4px 0 hsl(from var(--color-brand-500) h s l / 0.8);\n}\n.input-error[data-v-1c11b6d6] {\n  box-shadow: 0 0 16px 0 hsl(from var(--color-error-200) h s l / 0.5),\n    0 0 4px 0 hsl(from var(--color-error-100) h s l / 0.6);\n}\n";
if (typeof document !== "undefined" && !document.getElementById("sfc-style-1c11b6d6")) {
  const el = document.createElement("style");
  el.id = "sfc-style-1c11b6d6";
  el.textContent = __css__;
  document.head.appendChild(el);
}
var TextField_default = __sfc__;
export {
  TextField_default as default
};
