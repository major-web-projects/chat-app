$(document).ready(() => {
  const isReply = selectedTab == "replies" ? true : false;

  $.get(
    `/api/posts/byuser/${userId}?replies=${isReply}`,
    (postsData, status, xhr) => {
      createHomePostsHtml(postsData, $(".postsContainer"));
    }
  );
});
