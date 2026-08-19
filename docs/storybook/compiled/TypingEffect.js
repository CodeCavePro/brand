/* GENERATED from source_examples/common/TypingEffect.vue by tools/build-storybook.mjs — do not edit. */

// docs/source_examples/common/TypingEffect.vue
import { defineComponent as _defineComponent } from "vue";
import { toDisplayString as _toDisplayString, createElementVNode as _createElementVNode, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue";
import { gsap } from "gsap";
import SplitText from "gsap/dist/SplitText";
import { nextTick, onMounted, watch } from "vue";
var _hoisted_1 = { class: "flex flex-col items-center leading-[130%] text-heading-sm lg:text-heading-lg font-bold" };
var _hoisted_2 = { class: "block text-heading" };
var _hoisted_3 = { class: "block text-action" };
var __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "TypingEffect",
  props: {
    text1: { type: String, required: true },
    text2: { type: String, required: true }
  },
  setup(__props) {
    const props = __props;
    const splitAnimation = () => {
      gsap.registerPlugin(SplitText);
      const split = SplitText.create(".split-text span", {
        type: "words, chars"
      });
      gsap.from(split.chars, {
        opacity: 0.5,
        duration: 0.1,
        stagger: 0.1
      });
    };
    onMounted(() => {
      document.fonts.ready.then(() => {
        splitAnimation();
      });
    });
    watch(
      () => [props.text1, props.text2],
      () => nextTick(splitAnimation)
    );
    return (_ctx, _cache) => {
      return _openBlock(), _createElementBlock("div", _hoisted_1, [
        (_openBlock(), _createElementBlock("h2", {
          key: __props.text1,
          class: "split-text"
        }, [
          _createElementVNode(
            "span",
            _hoisted_2,
            _toDisplayString(__props.text1),
            1
            /* TEXT */
          ),
          _createElementVNode(
            "span",
            _hoisted_3,
            _toDisplayString(__props.text2),
            1
            /* TEXT */
          )
        ]))
      ]);
    };
  }
});
__sfc__.__file = "source_examples/common/TypingEffect.vue";
var TypingEffect_default = __sfc__;
export {
  TypingEffect_default as default
};
