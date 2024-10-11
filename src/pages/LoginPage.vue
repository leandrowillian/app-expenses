<template>
  <q-layout>
    <q-page-container>
      <q-page padding class="bg-primary flex flex-center">
        <q-card class="q-dialog-plugin">
          <q-card-section align="center">
            <q-img
              alt="Logo"
              src="mainlogo.webp"
              style="max-width: 200px; width: 100%; height: auto"
            />
          </q-card-section>
          <q-card-section class="q-pa-md">
            <q-form ref="formLogin" greedy v-if="isLogin">
              <q-input
                filled
                v-model="email"
                label="Email"
                type="email"
                :rules="['email']"
              />
              <q-input
                filled
                v-model="password"
                label="Senha"
                :type="isPwd ? 'password' : 'text'"
                :rules="[
                  (val) => (val && val.length > 0) || 'Campo obrigatório',
                ]"
              >
                <template v-slot:append>
                  <q-icon
                    :name="isPwd ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="isPwd = !isPwd"
                  />
                </template>
              </q-input>
            </q-form>
            <q-form ref="formRegister" greedy v-else>
              <q-input
                filled
                v-model="name"
                label="Nome"
                type="text"
                :rules="[
                  (val) => (val && val.length > 0) || 'Campo obrigatório',
                ]"
              />
              <q-input
                filled
                v-model="email"
                label="Email"
                type="email"
                :rules="['email']"
              />
              <q-input
                filled
                v-model="password"
                label="Senha"
                :type="isPwd ? 'password' : 'text'"
                :rules="[
                  (val) => (val && val.length > 0) || 'Campo obrigatório',
                ]"
              >
                <template v-slot:append>
                  <q-icon
                    :name="isPwd ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="isPwd = !isPwd"
                  />
                </template>
              </q-input>
            </q-form>
          </q-card-section>
          <!-- buttons example -->
          <q-card-actions class="q-pa-md flex justify-between">
            <span class="text-primary cursor-pointer" @click="toggleForms">
              {{ !isLogin ? "Entrar" : "Registrar-se" }}
            </span>
            <q-btn
              color="accent"
              type="button"
              :disabled="awaitingResponse"
              @click="
                {
                  {
                    isLogin ? login() : register();
                  }
                }
              "
            >
              {{ isLogin ? "Entrar" : "Cadastrar" }}
            </q-btn>
          </q-card-actions>

          <!-- Loading -->
          <q-inner-loading
            :showing="visible"
            label-class="text-teal"
            label-style="font-size: 1.1em"
          />
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from "vue";
import { api } from "boot/axios";
import { useAuthStore } from "src/stores/auth";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";

const router = useRouter();

const authStore = useAuthStore();
const { notify } = useQuasar();

const name = ref("");
const email = ref("");
const password = ref("");

const formLogin = ref(null);
const formRegister = ref(null);

const visible = ref(false);
const isLogin = ref(true);
const isPwd = ref(true);

const awaitingResponse = ref(false);

function toggleForms() {
  isPwd.value = true;
  isLogin.value = !isLogin.value;
}

function login() {
  awaitingResponse.value = true;
  formLogin.value.validate().then((success) => {
    if (success) {
      api
        .post("/login", {
          email: email.value,
          password: password.value,
        })
        .then((response) => {
          const user = authStore.login(response.data.data);
          if (user) {
            notify({
              type: "positive",
              message: "Login efetuado com sucesso!",
            });
            // Redireciona para o dashboard
            router.push({ path: "/expenses" });
          }
        })
        .catch((error) => {
          notify({
            type: "negative",
            message: error.response.data.message,
          });
        })
        .finally(() => {
          awaitingResponse.value = false;
        });
    } else {
      awaitingResponse.value = false;
      return;
    }
  });
}

function register() {
  awaitingResponse.value = true;
  formRegister.value.validate().then((success) => {
    if (success) {
      api
        .post("/users", {
          name: name.value,
          email: email.value,
          password: password.value,
        })
        .then((response) => {
          notify({
            type: "positive",
            message: "Usuário registrado com sucesso!",
          });
          toggleForms();
        })
        .catch((error) => {
          const errors = error.response.data.errors;
          Object.values(errors).forEach((error) => {
            notify({
              type: "negative",
              message: error[0],
            });
          });
        })
        .finally(() => {
          awaitingResponse.value = false;
        });
    } else {
      awaitingResponse.value = false;
      return;
    }
  });
}
</script>
