$(document).ready(() => {
  $.get("/api/posts", (postsData, status, xhr) => {
    createHomePostsHtml(postsData, $(".postsContainer"));
  });
});
