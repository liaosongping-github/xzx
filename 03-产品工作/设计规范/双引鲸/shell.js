/**
 * 双引鲸原型壳层脚本：一级菜单展开/收起二级。
 * 全页原型在 shell.css 之后引入本文件。
 */
(function () {
  document.addEventListener("click", function (e) {
    if (e.target.closest(".dyj-menu-sub")) return;
    var group = e.target.closest(".dyj-menu-group");
    if (!group) return;
    var open = group.classList.toggle("is-open");
    var chev = group.querySelector(":scope > .dyj-menu-item .chevron");
    if (chev) chev.textContent = open ? "▾" : "▸";
  });
})();
