/* GENERATED from source_examples/homepage/technology-card.vue by tools/build-storybook.mjs — do not edit. */

// docs/source_examples/homepage/technology-card.vue
import { defineComponent as _defineComponent2 } from "vue";
import { toDisplayString as _toDisplayString2, createElementVNode as _createElementVNode2, normalizeClass as _normalizeClass2, createVNode as _createVNode, openBlock as _openBlock2, createElementBlock as _createElementBlock2 } from "vue";

// docs/source_examples/helpers/paths.ts
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

// docs/source_examples/common/Button.vue
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
w-fit max-w-full rounded-full text-body-primary font-bold transition-colors`;
    const variantClass = computed(() => {
      switch (props.variant) {
        case "secondary":
          return `${buttonBaseClass} h-11 px-6 py-1 bg-primary-900 hover:bg-surface-tertiary`;
        case "tertiary":
          return `${buttonBaseClass} h-11 px-6 py-1 border border-primary-500 hover:border-primary-700`;
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
__sfc__.__file = "source_examples/common/Button.vue";
var Button_default = __sfc__;

// docs/source_examples/homepage/technology-card.vue
var _hoisted_12 = { class: "card flex flex-col items-center justify-around" };
var _hoisted_2 = { class: "max-w-[8rem] text-center text-xl font-bold text-heading text-balance" };
var __sfc__2 = /* @__PURE__ */ _defineComponent2({
  __name: "technology-card",
  props: {
    active: { type: Boolean, required: true },
    name: { type: String, required: true },
    className: { type: String, required: false },
    index: { type: Number, required: false }
  },
  setup(__props) {
    const rotate = [
      "-rotate-4 left-2 top-10",
      "-rotate-1 left-1/4 top-20",
      "rotate-1 left-1/2 top-20",
      "rotate-4 right-2 top-10",
      "-rotate-2 right-2/3 top-3/5",
      "rotate-2 left-2/3 top-3/5"
    ];
    const translate = [
      "xl:-translate-y-1/3",
      "xl:-translate-y-1/3",
      "xl:-translate-y-1/3",
      "xl:-translate-y-1/3",
      "xl:-translate-y-1/2",
      "xl:-translate-y-1/2"
    ];
    const getTechnologyUrl = (name) => {
      switch (name) {
        case "AR & VR":
          return paths.arVr;
        case "Autodesk plugins":
          return paths.autodesk;
        case "Automation & AI":
          return paths.automation;
        case "Cloud & DevOps":
          return paths.devops;
        case "E-Commerce":
          return paths.ecommerce;
        case "HubSpot":
          return paths.hubspot;
        default:
          return "";
      }
    };
    return (_ctx, _cache) => {
      return _openBlock2(), _createElementBlock2(
        "div",
        {
          class: _normalizeClass2(`rounded-3xl card-wrapper cursor-pointer select-none absolute transform transition-transform duration-500
  ${rotate[__props.index]} ${__props.active ? `${translate[__props.index]}` : ""} ${__props.className || ""}`)
        },
        [
          _createElementVNode2("div", _hoisted_12, [
            _createElementVNode2(
              "h2",
              _hoisted_2,
              _toDisplayString2(__props.name),
              1
              /* TEXT */
            ),
            _createVNode(Button_default, {
              as: "link",
              href: getTechnologyUrl(__props.name),
              title: "Explore service",
              variant: "tertiary",
              class: _normalizeClass2(`${__props.active ? "block" : "hidden xl:block xl:opacity-0"}`)
            }, null, 8, ["href", "class"])
          ])
        ],
        2
        /* CLASS */
      );
    };
  }
});
__sfc__2.__scopeId = "data-v-26f4d928";
__sfc__2.__file = "source_examples/homepage/technology-card.vue";
var __css__ = "\n.card-wrapper[data-v-26f4d928] {\r\n  background:\r\n    linear-gradient(hsl(from var(--color-technology-gradient-25) h s l / 0.1),\r\n      hsl(from var(--color-technology-gradient-0) h s l / 0.1),\r\n      hsl(from var(--color-technology-gradient-50) h s l / 0.1)) border-box;\n}\n.card[data-v-26f4d928] {\r\n  width: 100%;\r\n  height: 100%;\r\n  border-radius: inherit;\r\n  position: relative;\r\n  background: transparent;\r\n  backdrop-filter: blur(14px);\n}\n.card[data-v-26f4d928]::before {\r\n  content: '';\r\n  position: absolute;\r\n  z-index: -1;\r\n  inset: 0;\r\n  border-radius: inherit;\r\n  border: 1px solid transparent;\r\n  outline: 1px solid transparent;\r\n  -webkit-backface-visibility: hidden;\r\n  transform: translate3d(0, 0, 0);\r\n  background: linear-gradient(hsl(from var(--color-brand-500) h s l / 0.35),\r\n      hsl(from var(--color-brand-400) h s l / 0.675),\r\n      var(--color-brand-500)) border-box;\r\n  mask: linear-gradient(black, black) border-box,\r\n    linear-gradient(black, black) padding-box;\r\n  mask-composite: subtract;\n}\r\n";
if (typeof document !== "undefined" && !document.getElementById("sfc-style-26f4d928")) {
  const el = document.createElement("style");
  el.id = "sfc-style-26f4d928";
  el.textContent = __css__;
  document.head.appendChild(el);
}
var technology_card_default = __sfc__2;
export {
  technology_card_default as default
};
