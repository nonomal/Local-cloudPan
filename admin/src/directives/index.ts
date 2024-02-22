export default {
  install(app: any) {
    app.directive('focus', {
      mounted(el, bindings, vnode, preVnode) {
        el.focus();
      },
    });
  },
};
