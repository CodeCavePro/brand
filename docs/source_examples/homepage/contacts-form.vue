<script setup lang="ts">
import GlowButton from "../common/GlowButton.vue";
import InputText from "../common/InputText.vue";
import Checkbox from "../common/Checkbox.vue";
import Radio from "../common/Radio.vue";
import TextField from "../common/TextField.vue";
import { ref, watch } from "vue";
import SuccessIcon from "../../assets/icons/success-icon.vue";
import CloseIcon from "../../assets/icons/close-icon.vue";
import gsap from "gsap";

const services = [
  {id: 'ar', label: 'AR & VR'},
  {id: 'cloud', label: 'Cloud & DevOps'},
  {id: 'ecommerce', label: 'E-commerce'},
  {id: 'hubspot', label: 'HubSpot'},
  {id: 'automation', label: 'Automation & AI'},
  {id: 'autocad', label: 'AutoCAD plugins'},
]

const budget = [
  {id: 'low', label: '$5,000 or less'},
  {id: 'medium', label: '$5,000-$30,000'},
  {id: 'large', label: 'More than $30,000'},
]
const isAlertVisible = ref(false)
const showAlert = () => {
  if (isAlertVisible.value) return

  isAlertVisible.value = true
  setTimeout(() => {
    isAlertVisible.value = false
  }, 10000)
}
const submitContactsForm = () => {
  //validate form
  //send form
  //show alert if success
  showAlert()
}
watch(isAlertVisible, () => {
  gsap.timeline()
      .from('.form-alert', {
        x: 120,
        duration: 0.5,
      })
})
</script>

<template>
  <form class="flex flex-col gap-14 relative">
    <div class="space-y-5">
      <fieldset class="space-y-2">
        <InputText
            id="email"
            isRequired
            label="E-mail"
            type="email"
            placeholder="The only necessary thing to get a free consultation."
            autocomplete="email"
        />
        <div class="flex flex-col xl:flex-row gap-2">
          <InputText
              id="name"
              label="Name"
              type="text"
              placeholder="How should we address you?"
              autocomplete="name"
          />
          <InputText
              id="companyName"
              label="Company name"
              type="text"
              placeholder="So we know your domain in advance."
          />
        </div>
      </fieldset>
      <fieldset class="space-y-3">
        <legend class="pl-3 text-sm text-heading font-bold">Services</legend>
        <div class="flex flex-wrap gap-2">
          <Checkbox
              v-for="service in services"
              :key="service.id"
              :id="service.id"
              :label="service.label"
              variant="secondary"
              size="small"
          />
        </div>
      </fieldset>
      <fieldset class="space-y-3">
        <legend class="pl-3 text-sm text-heading font-bold">Budget</legend>
        <div class="space-y-2">
          <div class="flex flex-wrap gap-2">
            <Radio
                v-for="item in budget"
                :key="item.id"
                :id="item.id"
                :label="item.label"
                name="budget"
                isChecked
            />
          </div>
          <TextField
              id="project"
              label="Describe project or an issue you want to discuss"
              placeholder="Even a few words could make our consultation more constructive."
          />
        </div>
      </fieldset>
      <div class="space-y-2">
        <Checkbox id="privacy" label="I agree with the privacy policy" />
        <Checkbox id="promotions" label="I agree to receive promotional materials" />
      </div>
    </div>
    <GlowButton
        @click="submitContactsForm"
        title="Leave consultation request"
        class="self-center lg:self-start"
    />
    <div
        v-show="isAlertVisible"
        class="border border-action group absolute bottom-[77px] md:fixed z-50 left-1/2 -translate-x-1/2 md:top-24 form-alert flex gap-2 md:gap-8 items-center justify-between w-full h-fit max-w-[556px] bg-surface-secondary p-4 md:px-6 md:py-2.5 rounded-3xl"
    >
      <div class="w-8 h-8">
        <component :is="SuccessIcon" class="w-8 h-8" />
      </div>
      <p class="text-sm md:text-lg font-bold text-heading md:max-w-sm">
        Sent! We will contact you within next 1-3 business days.
      </p>
      <button
          @click="isAlertVisible = false"
          class="group-hover:text-action text-heading transition-colors cursor-pointer"
      >
        <component :is="CloseIcon" />
      </button>
    </div>
  </form>
</template>

<style scoped>
.form-alert {
  box-shadow: 0 -34px 40px 0 #2814701A,
  0 -10px 24px 0 #2814701A,
  0 -6px 6px 0 #28147014;
}
</style>

<style scoped>
  /* GSAP tween targets: promote to compositor layers up-front so the
     first animation frame does not pay for layer creation */
  .form-alert {
    will-change: transform, opacity;
  }
</style>
