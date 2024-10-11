<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" v-model="isVisible">
    <q-card class="q-dialog-plugin">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">{{ title }}</div>
      </q-card-section>
      <div class="q-pa-md">
        <q-form ref="formExpense" greedy @submit="handleSubmit">
          <q-input
            v-model="form.description"
            label="Descrição"
            :rules="[
              (val) => (val && val.length > 0) || 'Campo obrigatório',
              (val) => val.length <= 191 || 'Máximo de 191 caracteres',
            ]"
          />
          <q-input
            v-model="form.date"
            label="Data"
            type="date"
            :rules="[
              (val) => (val && val.length > 0) || 'Campo obrigatório',
              (val) =>
                val <= new Date().toISOString().substr(0, 10) ||
                'A data não pode ser superior a data atual',
            ]"
          />
          <q-input
            v-model="form.amount"
            label="Valor"
            type="text"
            prefix="R$ "
            mask="###.###.###.###,##"
            reverse-fill-mask
            :rules="[
              (val) => (val && val.length > 0) || 'Campo obrigatório',
              (val) =>
                isAmountValid(val) || 'O valor deve ser maior que R$ 0,00',
            ]"
          />
        </q-form>
      </div>
      <!-- buttons example -->
      <q-card-actions class="q-pa-md" align="right">
        <q-btn
          class="bg-blue-grey-1"
          label="Cancelar"
          @click="onDialogCancel"
        />
        <q-btn color="accent" label="Salvar" @click="handleSubmit" />
      </q-card-actions>

      <!-- Loading -->
      <q-inner-loading
        :showing="visible"
        label-class="text-teal"
        label-style="font-size: 1.1em"
      />
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { useDialogPluginComponent, useQuasar } from "quasar";
import { api } from "boot/axios";

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  expense: {
    type: Object,
    default: null,
  },
});
const emit = defineEmits(["expense-created", "expense-updated"]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const { notify } = useQuasar();

const formExpense = ref(null);

const form = reactive({
  description: props.expense?.description,
  date: props.expense?.date,
  amount: props.expense?.amount,
});

const isVisible = ref(true);
const visible = ref(false);

watch(
  () => props.expense,
  (val) => {
    if (val) {
      form.description = val.description;
      form.date = val.date;
      form.amount = val.amount;
    } else {
      form.description = null;
      form.date = null;
      form.amount = null;
    }
  }
);

function handleSubmit() {
  visible.value = true;
  formExpense.value.validate().then((success) => {
    if (success) {
      const formObj = {
        description: form.description,
        date: form.date,
        amount: getAmountNumber(form.amount),
      };

      const method = props.expense ? "put" : "post";
      if (method === "put") {
        updateExpense(props.expense.id, formObj);
      } else {
        storeExpense(formObj);
      }
    } else {
      visible.value = false;
    }
  });
}

function updateExpense(id, formObj) {
  api
    .put(`/expenses/${id}`, formObj)
    .then((response) => {
      notify({
        type: "positive",
        message: "Despesa atualizada com sucesso!",
      });
      clearInputs();
      emit("expense-updated", response.data.data);
      handleSubmitSuccess();
    })
    .catch((error) => {
      notify({
        type: "negative",
        message: error?.response?.data?.message || "Erro ao atualizar despesa",
      });
    });
}

function storeExpense(formObj) {
  api
    .post("/expenses", formObj)
    .then((response) => {
      notify({
        type: "positive",
        message: "Despesa criada com sucesso!",
      });
      clearInputs();
      emit("expense-created", response.data.data);
      handleSubmitSuccess();
    })
    .catch((error) => {
      notify({
        type: "negative",
        message: error?.response?.data?.message || "Erro ao criar despesa",
      });
    });
}

function handleSubmitSuccess() {
  onDialogOK();
  clearInputs();
  visible.value = false;
}

function isAmountValid(val) {
  const amount = getAmountNumber(val);
  return amount > 0;
}

function getAmountNumber(val) {
  return parseFloat(val.replace(/[^\d,]/g, "").replace(",", "."));
}

function clearInputs() {
  form.description = null;
  form.date = null;
  form.amount = null;
}
</script>
