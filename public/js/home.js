$(document).ready(() => {
  $.get("/api/posts", (postsData, status, xhr) => {
    createHomePostsHtml(postsData, $(".postsContainer"));
  });
});

function createHomePostsHtml(postsData, container) {
  container.html("");

  if (postsData.length === 0) {
    return container.append("<span>No results found</span>");
  }

  return postsData.forEach((post) => {
    let html = createPostHtml(post);
    container.append(html);
  });
}
