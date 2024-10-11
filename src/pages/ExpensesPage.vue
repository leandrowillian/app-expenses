<template>
  <q-page>
    <div class="q-pa-md q-gutter-sm">
      <q-breadcrumbs align="left">
        <q-breadcrumbs-el label="Home" to="/" />
        <q-breadcrumbs-el label="Despesas" />
      </q-breadcrumbs>
      <q-table
        title="Despesas"
        :rows="expensesTreated"
        :columns="columns"
        row-key="name"
        :loading="isLoading"
      >
        <template v-slot:top>
          <div class="text-h5">Despesas</div>
          <q-space />
          <q-btn round icon="add" color="primary" @click="createNewExpense" />
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              flat
              round
              color="default"
              icon="mode_edit"
              @click="editExpense(props.row)"
              :disabled="awaitingAction"
            />
            <q-btn
              flat
              round
              color="negative"
              icon="delete"
              @click="deleteExpense(props.row)"
              :disabled="awaitingAction"
            />
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- // DialogFormExpense -->
    <DialogFormExpense
      v-model="showDialogFormExpense"
      :expense="selectedExpense"
      :title="title"
      @expense-updated="updatedExpenseInTable"
      @expense-created="expenseCreated"
      @hide="selectedExpense = null"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import DialogFormExpense from "components/DialogFormExpense.vue";
import { api } from "boot/axios";
import { date, useQuasar } from "quasar";

const columns = [
  {
    name: "description",
    field: "description",
    label: "Descrição",
    align: "left",
    sortable: true,
  },
  {
    name: "date",
    field: "date_formated_DMY",
    label: "Data",
    align: "left",
    sortable: true,
  },
  {
    name: "user",
    label: "Usuário",
    align: "left",
    sortable: true,
    field: "user_name",
  },
  {
    name: "amount",
    field: "amount",
    label: "Valor",
    align: "left",
    sortable: true,
  },
  {
    name: "actions",
    field: "actions",
    label: "Ações",
    align: "center",
  },
];

const expenses = ref([]);
const expensesTreated = computed(() => {
  return expenses.value.map((expense) => ({
    ...expense,
    amount: formatToCurrencyBRL(expense.amount),
  }));
});
const isLoading = ref(true);
const awaitingAction = ref(false);

const { notify } = useQuasar();

onMounted(() => {
  fetchExpenses();
});

const showDialogFormExpense = ref(false);
const selectedExpense = ref(null);
const title = ref("");

function fetchExpenses() {
  api
    .get("expenses")
    .then((response) => {
      expenses.value = response.data.data;
    })
    .catch((error) => {
      notify({
        type: "negative",
        message: error?.response?.data?.message || "Erro ao buscar despesas",
      });
    })
    .finally(() => {
      isLoading.value = false;
    });
}

function editExpense(expense) {
  title.value = "Editar Despesa";
  selectedExpense.value = expense;
  showDialogFormExpense.value = true;
}

function updatedExpenseInTable(updatedExpense) {
  const index = expenses.value.findIndex((e) => e.id === updatedExpense.id);
  if (index !== -1) {
    expenses.value[index] = { ...updatedExpense };
  }
  selectedExpense.value = null; // Fechar o modal
  showDialogFormExpense.value = false;
}

function createNewExpense() {
  title.value = "Nova Despesa";
  selectedExpense.value = null;
  showDialogFormExpense.value = true;
}

function expenseCreated(newExpense) {
  expenses.value.push(newExpense);
  showDialogFormExpense.value = false;
}

function deleteExpense(expense) {
  isLoading.value = true;
  awaitingAction.value = true;
  api
    .delete(`expenses/${expense.id}`)
    .then((response) => {
      notify({
        type: "positive",
        message: "Despesa excluída com sucesso!",
      });
      const index = expenses.value.findIndex((e) => e.id === expense.id);
      if (index !== -1) {
        expenses.value.splice(index, 1);
      }
    })
    .catch((error) => {
      notify({
        type: "negative",
        message: error?.response?.data?.message || "Erro ao excluir despesa",
      });
    })
    .finally(() => {
      isLoading.value = false;
      awaitingAction.value = false;
    });
}

function formatToCurrencyBRL(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
</script>
