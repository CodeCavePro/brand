/* GENERATED from @codecavepro/brand/components/common/Checkbox.vue by tools/build-storybook.mjs — do not edit. */

// ../packages/brand/dist/src/common/Checkbox.vue
import { defineComponent as _defineComponent } from "vue";
import { normalizeClass as _normalizeClass, createElementVNode as _createElementVNode2, toDisplayString as _toDisplayString, openBlock as _openBlock2, createBlock as _createBlock, createCommentVNode as _createCommentVNode, createTextVNode as _createTextVNode, createElementBlock as _createElementBlock2 } from "vue";
import { computed } from "vue";

// ../packages/brand/dist/src/assets/icons/asterisk-icon.vue
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
__sfc__.__file = "components/assets/icons/asterisk-icon.vue";
var asterisk_icon_default = __sfc__;

// ../packages/brand/dist/src/common/Checkbox.vue
var _hoisted_12 = ["for"];
var _hoisted_2 = ["id", "autocomplete", "data-size", "checked"];
var _hoisted_3 = { class: "flex items-center" };
var labelBaseClass = "flex items-center w-fit text-body-primary cursor-pointer";
var inputBaseClass = "cursor-pointer transition-colors";
var __sfc__2 = /* @__PURE__ */ _defineComponent({
  __name: "Checkbox",
  props: {
    id: { type: String, required: true },
    label: { type: String, required: true },
    isRequired: { type: Boolean, required: false, default: false },
    isError: { type: Boolean, required: false, default: false },
    variant: { type: String, required: false, default: "primary" },
    size: { type: String, required: false, default: "medium" },
    modelValue: { type: Boolean, required: false }
  },
  emits: ["update:modelValue"],
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
    const borderClass = computed(() => {
      return props.isError ? "border-error checkbox-error" : "border-outline-primary-hover hover:border-action";
    });
    const inputVariantClass = computed(() => {
      switch (props.variant) {
        case "secondary":
          return `${inputBaseClass} ${checkboxSize.value} outline-2 outline-surface-quaternary checked:bg-action checked:outline-none hover:outline-action`;
        default:
          return `${inputBaseClass} ${checkboxSize.value} border-2 ${borderClass.value}`;
      }
    });
    return (_ctx, _cache) => {
      return _openBlock2(), _createElementBlock2("label", {
        for: __props.id,
        class: _normalizeClass(labelVariantClass.value)
      }, [
        _createElementVNode2("input", {
          id: __props.id,
          type: "checkbox",
          autocomplete: __props.id,
          class: _normalizeClass(inputVariantClass.value),
          "data-size": __props.size,
          checked: __props.modelValue,
          onChange: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("update:modelValue", $event.target.checked))
        }, null, 42, _hoisted_2),
        _createElementVNode2("span", _hoisted_3, [
          _createTextVNode(
            _toDisplayString(__props.label) + " ",
            1
            /* TEXT */
          ),
          __props.isRequired ? (_openBlock2(), _createBlock(asterisk_icon_default, {
            key: 0,
            class: "mx-1"
          })) : _createCommentVNode("v-if", true)
        ])
      ], 10, _hoisted_12);
    };
  }
});
__sfc__2.__scopeId = "data-v-b7ef7edb";
__sfc__2.__file = "components/common/Checkbox.vue";
var __css__ = `
input[data-v-b7ef7edb] {
  appearance: none;
  -webkit-appearance: none;
  display: grid;
  place-content: center;
  border-radius: var(--radius-control);
}

/* The corner cannot be size-independent. The small box is 16px, and 8px on a
   16px box is exactly half its side -- a circle, which reads as a radio button
   for what is a pick-any control. Keyed off data-size rather than a utility
   class so it holds without a Tailwind build, same reason both custom
   properties are declared in :root. */
input[data-size="small"][data-v-b7ef7edb] {
  border-radius: var(--radius-control-sm);
}
input[data-v-b7ef7edb]::before {
  content: '';
  transform: scale(0);
  transition: var(--duration-control) transform ease-in-out;
  background-image: url("../assets/images/checked-icon.svg");
  background-repeat: no-repeat;
  background-position: center center;
}
input[data-v-b7ef7edb]:checked::before {
  transform: scale(1);
  transform-origin: center center;
}
.checkbox-error[data-v-b7ef7edb] {
  box-shadow: 0 0 16px 0 hsl(from var(--color-error-200) h s l / 0.5),
    0 0 4px 0 hsl(from var(--color-error-100) h s l / 0.6);
}
`;
if (typeof document !== "undefined" && !document.getElementById("sfc-style-b7ef7edb")) {
  const el = document.createElement("style");
  el.id = "sfc-style-b7ef7edb";
  el.textContent = __css__;
  document.head.appendChild(el);
}
var Checkbox_default = __sfc__2;
export {
  Checkbox_default as default
};
