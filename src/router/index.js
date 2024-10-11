import { route } from "quasar/wrappers";
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";
import routes from "./routes";
import { useAuthStore } from "src/stores/auth";

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */
// Variavel para armazenar o roteador
let Router = null;

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === "history"
    ? createWebHistory
    : createWebHashHistory;

  Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // Guard Global
  Router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    // Verifica se a rota requer autenticação
    if (to.matched.some((record) => record.meta.requiresAuth)) {
      // Se o usuário não está logado ou não há token
      if (!authStore.user) {
        next({ path: "/login" });
      } else {
        // Verifica o campo 'exp' (expiração do token)
        const tokenExp = new Date(authStore.user.exp); // Converte para Date
        const now = new Date(); // Data e hora atuais

        // Se o token expirou
        if (tokenExp <= now) {
          authStore.logout(); // Opcional: Faz logout
          next({ path: "/login" }); // Redireciona para login
        } else {
          next(); // Permite acesso à rota
        }
      }
    } else {
      next(); // Se não precisa de autenticação, continua
    }
  });

  return Router;
});

export { Router };
