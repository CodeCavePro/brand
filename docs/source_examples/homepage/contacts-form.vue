<script setup lang="ts">
import GlowButton from "../common/GlowButton.vue";
import InputText from "../common/InputText.vue";
import Checkbox from "../common/Checkbox.vue";
import Radio from "../common/Radio.vue";
import TextField from "../common/TextField.vue";
import { onMounted, ref, watch } from "vue";
import SuccessIcon from "../../assets/icons/success-icon.vue";
import CloseIcon from "../../assets/icons/close-icon.vue";
import gsap from "gsap";
import { getCollection, getEntry } from 'astro:content';

import { hubspotSubmitForm, getHubspotutk, type HubspotFormData } from "../../lib/hubspot/hubspot.ts";

const props = defineProps<{
  contactUsForm: HubspotFormData
}>()

const emailField = props.contactUsForm.fieldGroups.flatMap(fg => fg.fields).filter(f => f.name === "email")[0];
const firstNameField = props.contactUsForm.fieldGroups.flatMap(fg => fg.fields).filter(f => f.name === "firstname")[0];
const lastNameField = props.contactUsForm.fieldGroups.flatMap(fg => fg.fields).filter(f => f.name === "lastname")[0];
const companyNameField = props.contactUsForm.fieldGroups.flatMap(fg => fg.fields).filter(f => f.name === "name")[0];
const linkedinCompanyField = props.contactUsForm.fieldGroups.flatMap(fg => fg.fields).filter(f => f.name === "linkedin_company_page")[0];
const servicesField = props.contactUsForm.fieldGroups.flatMap(fg => fg.fields).filter(f => f.name === "buying_intent")[0];
const descriptionField = props.contactUsForm.fieldGroups.flatMap(fg => fg.fields).filter(f => f.name === "description")[0];

const services = servicesField
  .options?.sort(o => o.displayOrder)
  .map(o => 
  {
    return {
      id: o.value, 
      label: o.label.replaceAll("&amp;", "&").replaceAll("&quot;", "\"")
    }
  });

const formData = ref({
  email: {
    value: '',
    error: '',
    hubspotLabel: 'email'
  },
  companyName: {
    value: '',
    error: '',
    hubspotLabel: 'name'
  },
  description: {
    value: '',
    error: '',
    hubspotLabel: 'description'
  },
  firstname: {
    value: '',
    error: '',
    hubspotLabel: 'firstname'
  },
  lastname: {
    value: '',
    error: '',
    hubspotLabel: 'lastname'
  },
  linkedinCompanyPage: {
    value: '',
    error: '',
    hubspotLabel: 'linkedin_company_page'
  },
  services: {
    value: '',
    error: '',
    hubspotLabel: 'buying_intent'
  },
})
const isAlertVisible = ref(false)

const showAlert = () => {
  if (isAlertVisible.value) return

  isAlertVisible.value = true
  setTimeout(() => {
    isAlertVisible.value = false
  }, 10000)
}

const validateForm = () => {
  let isValid = true;

  if (emailField.required && !formData.value.email.value) 
  {
    isValid = false;
    formData.value.email.error = "This field is required";
  }
  else {
    formData.value.email.error = "";
  }

  if (firstNameField.required && !formData.value.firstname.value) 
  {
    isValid = false;
    formData.value.firstname.error = "This field is required";
  }
  else {
    formData.value.firstname.error = "";
  }

  if (lastNameField.required && !formData.value.lastname.value) 
  {
    isValid = false;
    formData.value.lastname.error = "This field is required";
  }
  else {
    formData.value.lastname.error = "";
  }

  if (companyNameField.required && !formData.value.companyName.value) 
  {
    isValid = false;
    formData.value.companyName.error = "This field is required";
  }
  else {
    formData.value.companyName.error = "";
  }

  if (linkedinCompanyField.required && !formData.value.linkedinCompanyPage.value) 
  {
    isValid = false;
    formData.value.linkedinCompanyPage.error = "This field is required";
  }
  else {
    formData.value.linkedinCompanyPage.error = "";
  }

  if (servicesField.required && !formData.value.services.value) 
  {
    isValid = false;
    formData.value.services.error = "This field is required";
  }
  else {
    formData.value.services.error = "";
  }

  if (descriptionField.required && !formData.value.description.value) 
  {
    isValid = false;
    formData.value.description.error = "This field is required";
  }
  else {
    formData.value.description.error = "";
  }

  return isValid;
}

const resetForm = () => {
  formData.value.companyName.value = '';
  formData.value.description.value = '';
  formData.value.email.value = '';
  formData.value.firstname.value = '';
  formData.value.lastname.value = '';
  formData.value.linkedinCompanyPage.value = '';
  formData.value.services.value = '';
}

const submitContactsForm = async () => {
  //validate form
  // console.log(formData);
  if (!validateForm()){
    return;
  }
  
  const hutk = getHubspotutk();
  const hubspotForm = Object.entries(formData.value).map(kv => {return {hubspotLabel: kv[1].hubspotLabel, value: kv[1].value}});
  const hubspotFields = props.contactUsForm.fieldGroups.flatMap(fg => fg.fields);

  const body = {
    fields: hubspotFields.map(f => ({
      objectTypeId: f.objectTypeId,
      name: f.name,
      value: hubspotForm.find(hf => hf.hubspotLabel == f.name)?.value
    })),
    context: {
      hutk: hutk,
    }
  }
  try {
 
    const response = await hubspotSubmitForm
    .post(`/${import.meta.env.PUBLIC_HUBSPOT_CONTACTUS_FORM_ID}`, body);

    if (response.status === 200) resetForm();

    showAlert()
  }
  catch (error: any) {
    console.log("request err>>", error);
  }
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
  <form ref="" class="flex flex-col gap-14 relative">
    <div class="space-y-5">
      <fieldset class="space-y-2">
        <InputText
            id="email"
            v-model="formData.email.value"
            :isRequired=emailField.required
            :label=emailField.label
            type="email"
            :isError="!!formData.email.error"
            :errorMessage="formData.email.error"
            :placeholder="emailField.placeholder ?? ''"
            autocomplete="email"
        />
        <div class="flex flex-col xl:flex-row gap-2">
          <InputText
              id="firstname"
              v-model="formData.firstname.value"
              :isRequired=firstNameField.required
              :label=firstNameField.label
              type="text"
              :isError="!!formData.firstname.error"
              :errorMessage="formData.firstname.error"
              :placeholder="firstNameField.placeholder ?? ''"
              autocomplete="given-name"
          />
          <InputText
              id="lastname"
              v-model="formData.lastname.value"
              :isRequired=lastNameField.required
              :label=lastNameField.label
              type="text"
              :isError="!!formData.lastname.error"
              :errorMessage="formData.lastname.error"
              :placeholder="lastNameField.placeholder ?? ''"
              autocomplete="family-name"
          />
        </div>
         <div class="flex flex-col xl:flex-row gap-2">
          <InputText
              id="companyName"
              v-model="formData.companyName.value"
              :isRequired=companyNameField.required
              :label=companyNameField.label
              type="text"
              :isError="!!formData.companyName.error"
              :errorMessage="formData.companyName.error"
              :placeholder="companyNameField.placeholder ?? ''"
          />
          <InputText
              id="linkedinCompanyPage"
              v-model="formData.linkedinCompanyPage.value"
              :isRequired=linkedinCompanyField.required
              :label=linkedinCompanyField.label
              type="text"
              :isError="!!formData.linkedinCompanyPage.error"
              :errorMessage="formData.linkedinCompanyPage.error"
              :placeholder="linkedinCompanyField.placeholder ?? ''"
          />
        </div>
      </fieldset>
      <fieldset class="space-y-3">
        <legend class="pl-3 text-sm text-heading font-bold">{{ servicesField.label }}</legend>
        <div class="flex flex-wrap gap-2">
          <Radio
                v-for="item in services"
                :key="item.id"
                :id="item.id"
                :label="item.label"
                v-model="formData.services.value"
                name="services"
            />
        </div>
      </fieldset>
       <fieldset class="space-y-3">
          <TextField
              id="project"
              v-model="formData.description.value"
              :isRequired=descriptionField.required
              :label=descriptionField.label
              :placeholder="descriptionField.placeholder ?? ''"
          />
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
