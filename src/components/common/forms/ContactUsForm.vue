<script setup lang="ts">
import GlowButton from "../GlowButton.vue";
import InputText from "../InputText.vue";
import Checkbox from "../Checkbox.vue";
import Radio from "../Radio.vue";
import TextField from "../TextField.vue";
import { computed, ref, watch } from "vue";
import SuccessIcon from "../../assets/icons/success-icon.vue";
import CloseIcon from "../../assets/icons/close-icon.vue";
import gsap from "gsap";
import type {
  ContactFormDefinition,
  ContactFormValues,
  CrmSubmitResult,
  ICrmFormClient,
} from "../../lib/crm/types";
import { isCorrectEmailFormat, isCorrectLinkedInFormat } from "@helpers/form-validator.ts";

/* This component knows nothing about HubSpot, or about any other CRM. It is
 * handed the labels to render and something that can accept a submission; who
 * that something talks to is the caller's business. See lib/crm/types.ts. */
const props = defineProps<{
  definition: ContactFormDefinition
  client: ICrmFormClient
}>()

const emit = defineEmits<{
  (e: 'submit', values: ContactFormValues): void
  (e: 'submitted', result: CrmSubmitResult): void
}>()

interface FormField<T = string> {
  value: T
  error: string
  label: string
  placeholder?: string
  required: boolean
  maxLength?: number
}

const createFormField = <T,>(name: keyof ContactFormDefinition, value: T): FormField<T> => {
  const spec = props.definition[name]

  return {
    value,
    error: '',
    label: spec.label,
    placeholder: spec.placeholder,
    required: spec.required,
    ...(spec.maxLength === undefined ? {} : { maxLength: spec.maxLength }),
  }
}

const formData = ref({
  email: createFormField('email', ''),
  firstName: createFormField('firstName', ''),
  lastName: createFormField('lastName', ''),
  companyName: createFormField('companyName', ''),
  linkedinCompanyPage: createFormField('linkedinCompanyPage', ''),
  services: createFormField('services', ''),
  description: createFormField('description', ''),
  privacyPolicy: {
    value: false,
    error: '',
    label: 'I agree with the privacy policy',
    required: true
  }
})

const services = computed(() => props.definition.services.options ?? [])

const validateForm = () => {
  resetErrorMessages();
  let isValid = validateRequiredFields();

  let description = formData.value.description;
  let email = formData.value.email;
  let linkedInPage = formData.value.linkedinCompanyPage;

  if (email.value !== '' && !isCorrectEmailFormat(email.value)) {
    email.error = 'Please enter valid email'
    isValid = false
  }
  if (linkedInPage.value !== '' && !isCorrectLinkedInFormat(linkedInPage.value)) {
    linkedInPage.error = 'Please enter valid LinkedIn page link'
    isValid = false
  }
  if (description.maxLength !== undefined && description.value.length > description.maxLength) {
    description.error = `You faced characters limits. Max length is ${description.maxLength}`
    isValid = false
  }

  return isValid
}

const resetErrorMessages = () => Object.values(formData.value).forEach(field => field.error = '');

const validateRequiredFields = () => {
  let isValid = true

  Object.values(formData.value).forEach(field => {
    const isEmpty = field.value === '' || field.value === false

    if (field.required && isEmpty) {
      field.error = 'This field is required'
      isValid = false
    } else {
      field.error = ''
    }
  })

  return isValid
}

const resetForm = () => {
  formData.value.email.value = '';
  formData.value.firstName.value = '';
  formData.value.lastName.value = '';
  formData.value.companyName.value = '';
  formData.value.linkedinCompanyPage.value = '';
  formData.value.description.value = '';
  formData.value.services.value = '';
  formData.value.privacyPolicy.value = false;
}

const currentValues = (): ContactFormValues => ({
  email: formData.value.email.value,
  firstName: formData.value.firstName.value,
  lastName: formData.value.lastName.value,
  companyName: formData.value.companyName.value,
  linkedinCompanyPage: formData.value.linkedinCompanyPage.value,
  services: formData.value.services.value,
  description: formData.value.description.value,
  privacyPolicyAccepted: formData.value.privacyPolicy.value,
})

const isSubmitting = ref(false)
const isFormSubmitted = ref(false)
const submitContactsForm = async () => {
  if (isSubmitting.value || !validateForm()) {
    return
  }

  const values = currentValues()
  emit('submit', values)

  isSubmitting.value = true
  try {
    const result = await props.client.submit(values)

    if (result.ok) {
      isFormSubmitted.value = true
      resetForm()
      showAlert('success')
    } else {
      showAlert('error')
    }

    emit('submitted', result)
  } finally {
    isSubmitting.value = false
  }
}

const alertKind = ref<'success' | 'error' | null>(null)
const isAlertVisible = computed(() => alertKind.value !== null)

const ALERT_TEXT = {
  success: 'Sent! We will contact you within next 1-3 business days.',
  error: 'We could not send your request. Please try again, or email us at hello@codecave.pro.',
} as const

const showAlert = (kind: 'success' | 'error') => {
  if (alertKind.value !== null) return

  alertKind.value = kind
  setTimeout(() => {
    alertKind.value = null
  }, 10000)
}

watch(isAlertVisible, () => {
  gsap.timeline()
    .from('.form-alert', {
      x: 120,
      duration: 0.5,
    })
})

const validateField = (field) => {
  if (isFormSubmitted.value) {
    field.error = ''
    return
  }

  if (field.required && !field.value) {
    field.error = 'This field is required'
    return
  }

  field.error = ''
}

const fields = [
  'email',
  'firstName',
  'companyName',
  'linkedinCompanyPage',
  'privacyPolicy'
]

fields.forEach((key) => {
  watch(
    () => formData.value[key].value,
    (value) => {
      if (isFormSubmitted.value && value) {
        isFormSubmitted.value = false
      }

      validateField(formData.value[key])
    }
  )
})

</script>

<template>
  <form class="flex flex-col gap-14 relative" novalidate>
    <div class="space-y-5">
      <fieldset class="space-y-2">
        <InputText id="email" v-model="formData.email.value" :isRequired=formData.email.required :label=formData.email.label type="email" :isError="!!formData.email.error" :errorMessage="formData.email.error" :placeholder="formData.email.placeholder ?? ''" autocomplete="email" />
        <div class="flex flex-col xl:flex-row gap-2">
          <InputText id="firstname" v-model="formData.firstName.value" :isRequired=formData.firstName.required :label=formData.firstName.label type="text" :isError="!!formData.firstName.error" :errorMessage="formData.firstName.error" :placeholder="formData.firstName.placeholder ?? ''" autocomplete="given-name" />
          <InputText id="lastname" v-model="formData.lastName.value" :isRequired=formData.lastName.required :label=formData.lastName.label type="text" :isError="!!formData.lastName.error" :errorMessage="formData.lastName.error" :placeholder="formData.lastName.placeholder ?? ''" autocomplete="family-name" />
        </div>
        <div class="flex flex-col xl:flex-row gap-2">
          <InputText id="companyName" v-model="formData.companyName.value" :isRequired=formData.companyName.required :label=formData.companyName.label type="text" :isError="!!formData.companyName.error" :errorMessage="formData.companyName.error" :placeholder="formData.companyName.placeholder ?? ''" />
          <InputText id="linkedinCompanyPage" v-model="formData.linkedinCompanyPage.value" :isRequired=formData.linkedinCompanyPage.required :label=formData.linkedinCompanyPage.label type="text" :isError="!!formData.linkedinCompanyPage.error" :errorMessage="formData.linkedinCompanyPage.error" :placeholder="formData.linkedinCompanyPage.placeholder ?? ''" />
        </div>
      </fieldset>
      <fieldset class="space-y-3">
        <legend class="pl-3 text-sm text-heading font-bold">{{ formData.services.label }}</legend>
        <div class="flex flex-wrap gap-2">
          <Radio v-for="item in services" :key="item.id" :id="item.id" :label="item.label" v-model="formData.services.value" name="services" />
        </div>
      </fieldset>
      <fieldset class="space-y-3">
        <TextField id="project" v-model="formData.description.value" :isRequired=formData.description.required :label=formData.description.label :isError="!!formData.description.error" :errorMessage="formData.description.error" :placeholder="formData.description.placeholder ?? ''" />
      </fieldset>
      <div class="space-y-2">
        <Checkbox id="privacy" v-model="formData.privacyPolicy.value" :label="formData.privacyPolicy.label" :isRequired="formData.privacyPolicy.required" :isError="!!formData.privacyPolicy.error" />
        <Checkbox id="promotions" label="I agree to receive promotional materials" />
      </div>
    </div>
    <GlowButton @click="submitContactsForm" title="Leave consultation request" class="self-center lg:self-start" />
  </form>
  <div v-show="isAlertVisible" class="border border-action group absolute bottom-19.25 md:fixed z-350 left-1/2 -translate-x-1/2 md:top-40 form-alert flex gap-2 md:gap-8 items-center justify-between w-full h-fit max-w-139 bg-surface-secondary p-4 md:px-6 md:py-2.5 rounded-3xl">
      <div v-if="alertKind === 'success'" class="w-8 h-8">
        <component :is="SuccessIcon" class="w-8 h-8" />
      </div>
      <p class="text-sm md:text-lg font-bold text-heading md:max-w-sm ">
        {{ alertKind ? ALERT_TEXT[alertKind] : '' }}
      </p>
      <button @click="alertKind = null" class="group-hover:text-action text-heading transition-colors cursor-pointer">
        <component :is="CloseIcon" />
      </button>
    </div>
</template>

<style scoped>
.form-alert {
  box-shadow: 0 -34px 40px 0 #2814701A,
    0 -10px 24px 0 #2814701A,
    0 -6px 6px 0 #28147014;
}
</style>
