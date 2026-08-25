/* GENERATED from @codecavepro/brand/components/common/GlowButton.vue by tools/build-storybook.mjs — do not edit. */

// ../packages/brand/dist/src/components/common/GlowButton.vue
import { defineComponent as _defineComponent } from "vue";
import { createElementVNode as _createElementVNode, createCommentVNode as _createCommentVNode, toDisplayString as _toDisplayString, normalizeClass as _normalizeClass, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue";
import { onMounted, ref } from "vue";
import { gsap } from "gsap";
var _hoisted_1 = ["href"];
var _hoisted_2 = { class: "relative z-[2] text-primary-800 font-bold select-none" };
var __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "GlowButton",
  props: {
    title: { type: String, required: true },
    class: { type: String, required: false },
    href: { type: String, required: false }
  },
  setup(__props) {
    const props = __props;
    const isTouchDevice = ref(false);
    const prefersReducedMotion = ref(false);
    const noTracking = () => isTouchDevice.value || prefersReducedMotion.value;
    const link = ref(null);
    const glow = ref(null);
    const edgeLeft = ref(null);
    const edgeRight = ref(null);
    let leaveTween = null;
    const handleMouseMove = (e) => {
      if (noTracking()) return;
      const rect = link.value.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const percentX = x / rect.width;
      gsap.to(glow.value, {
        left: x,
        top: y,
        duration: 0.5,
        ease: "power2.out"
      });
      const edgeZone = 0.1;
      let leftOpacity = 0;
      let rightOpacity = 0;
      if (percentX < edgeZone) {
        leftOpacity = 1 - percentX / edgeZone;
      } else if (percentX > 1 - edgeZone) {
        rightOpacity = (percentX - (1 - edgeZone)) / edgeZone;
      }
      edgeLeft.value.style.opacity = leftOpacity;
      edgeRight.value.style.opacity = rightOpacity;
    };
    const handleMouseEnter = () => {
      if (noTracking()) return;
      if (leaveTween) {
        leaveTween.kill();
        leaveTween = null;
      }
    };
    const handleMouseLeave = () => {
      if (noTracking()) return;
      edgeLeft.value.style.opacity = 1;
      edgeRight.value.style.opacity = 0;
      if (leaveTween) leaveTween.kill();
      leaveTween = gsap.to(glow.value, {
        left: "20%",
        top: "50%",
        duration: 1,
        delay: 1,
        ease: "power2.out"
      });
    };
    onMounted(() => {
      isTouchDevice.value = window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window || navigator.maxTouchPoints > 0;
      prefersReducedMotion.value = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    });
    return (_ctx, _cache) => {
      return _openBlock(), _createElementBlock(
        "div",
        {
          class: _normalizeClass(`relative inline-block ${props.class ?? ""}`)
        },
        [
          _createElementVNode(
            "div",
            {
              ref_key: "edgeLeft",
              ref: edgeLeft,
              class: "edge-glow -left-2"
            },
            null,
            512
            /* NEED_PATCH */
          ),
          _createCommentVNode(" `class` belongs to the WRAPPER only. It used to be interpolated here as\r\n         well, so anything positional double-applied: mx-auto centred twice, a\r\n         margin was paid twice, and a width cap constrained the wrapper and then\r\n         re-capped the anchor inside it. The anchor is w-full, so a cap on the\r\n         wrapper already reaches it. "),
          _createElementVNode("a", {
            ref_key: "link",
            ref: link,
            href: __props.href,
            onMousemove: handleMouseMove,
            onMouseenter: handleMouseEnter,
            onMouseleave: handleMouseLeave,
            class: "cursor-pointer flex items-center justify-center relative z-[1] overflow-hidden w-full h-12 px-6 py-1 rounded-full bg-glow-25"
          }, [
            _createElementVNode(
              "span",
              _hoisted_2,
              _toDisplayString(__props.title),
              1
              /* TEXT */
            ),
            _createElementVNode(
              "div",
              {
                ref_key: "glow",
                ref: glow,
                class: "glow"
              },
              null,
              512
              /* NEED_PATCH */
            )
          ], 40, _hoisted_1),
          _createElementVNode(
            "div",
            {
              ref_key: "edgeRight",
              ref: edgeRight,
              class: "edge-glow -right-2 opacity-0"
            },
            null,
            512
            /* NEED_PATCH */
          )
        ],
        2
        /* CLASS */
      );
    };
  }
});
__sfc__.__scopeId = "data-v-a48452dd";
__sfc__.__file = "authored/common/GlowButton.vue";
var __css__ = "\na[data-v-a48452dd] {\r\n  box-shadow: 0 0 64px 0 #7A58FFA8,\r\n    0 0 16px 0 #4F22FFA6,\r\n    0 0 4px 2px #5B34FA;\r\n  transition: transform 0.5s ease;\n}\na[data-v-a48452dd]:active {\r\n  transform: scale(0.98);\n}\n.edge-glow[data-v-a48452dd] {\r\n  position: absolute;\r\n  z-index: 0;\r\n  pointer-events: none;\r\n  top: 50%;\r\n  width: 100%;\r\n  height: 80%;\r\n  transform: translateY(-50%);\r\n  transition: opacity 0.2s ease;\r\n  background: radial-gradient(55.23% 55.23% at 50% 50%,\r\n      #FFFFFF 27.88%,\r\n      rgba(223, 212, 249, 0.762963) 51.92%,\r\n      rgba(153, 128, 255, 0) 100%);\r\n  filter: blur(12px);\n}\n.glow[data-v-a48452dd] {\r\n  position: absolute;\r\n  z-index: 1;\r\n  pointer-events: none;\r\n  top: 50%;\r\n  left: 20%;\r\n  transform: translateY(-50%) translateX(-50%);\r\n  width: 50%;\r\n  height: 200%;\r\n  background: radial-gradient(ellipse at left center,\r\n      #FFFFFF 27.88%,\r\n      rgba(223, 212, 249, 0.76) 51.92%,\r\n      rgba(153, 128, 255, 0) 100%);\r\n  filter: blur(12px);\n}\r\n";
if (typeof document !== "undefined" && !document.getElementById("sfc-style-a48452dd")) {
  const el = document.createElement("style");
  el.id = "sfc-style-a48452dd";
  el.textContent = __css__;
  document.head.appendChild(el);
}
var GlowButton_default = __sfc__;
export {
  GlowButton_default as default
};
