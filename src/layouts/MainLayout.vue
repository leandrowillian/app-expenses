<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="text-white bg-primary" height-hint="61.59">
      <q-toolbar class="q-py-sm q-px-md">
        <q-img
          src="~assets/icon.png"
          color="white"
          class="q-mr-sm"
          style="width: 40px; height: 100%"
        />

        <div
          class="GL__toolbar-link q-ml-xs q-gutter-md text-body2 text-weight-bold row items-center no-wrap"
        >
          <router-link class="header-links" to="/"> Dashboard </router-link>
          <router-link
            href="javascript:void(0)"
            class="header-links"
            to="/expenses"
          >
            Despesas
          </router-link>
        </div>

        <q-space />

        <div class="q-pl-sm q-gutter-sm row items-center no-wrap">
          <q-btn dense flat rounded no-wrap>
            <q-avatar rounded size="26px">
              <q-icon name="account_circle" color="white" size="22px" />
            </q-avatar>
            <q-icon name="arrow_drop_down" size="16px" />

            <q-menu auto-close>
              <q-list dense>
                <q-item class="GL__menu-link-signed-in">
                  <q-item-section>
                    <div>
                      <strong class="ellipsis">{{ name }}</strong>
                    </div>
                  </q-item-section>
                </q-item>
                <q-separator />

                <q-item
                  clickable
                  class="GL__menu-link"
                  @click="authStore.logout"
                >
                  <q-item-section>Sair</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useAuthStore } from "src/stores/auth";
import { storeToRefs } from "pinia";

defineOptions({
  name: "MainLayout",
});
const authStore = useAuthStore();
const { name } = storeToRefs(authStore);
</script>

<style>
.header-links {
  text-decoration: none;
  color: white;
  font-size: 16px;
}
.header-links:hover {
  text-decoration: underline;
  color: rgb(236, 236, 236);
}
</style>
