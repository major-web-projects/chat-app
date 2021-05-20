$(document).ready(() => {
  $.get("/api/posts/" + postId, (results, status, xhr) => {
    console.log(results);
    createPostHtmlWithReplies(results, $(".postsContainer"));
  });
});
