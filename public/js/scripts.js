// disable and enable post button
$("#postTextarea, #replyTextarea").keyup((event) => {
  const textbox = $(event.target);
  const value = textbox.val().trim();

  const isModal = textbox.parents(".modal").length == 1;

  const submitButton = isModal
    ? $("#submitReplyButton")
    : $("#submitPostButton");

  if (submitButton.length == 0) return alert("No submit button found");

  if (value == "") {
    submitButton.prop("disabled", true);
    return;
  }

  submitButton.prop("disabled", false);
});

// submit post /api/posts
$("#submitPostButton").click((event) => {
  const submitButton = $(event.target);
  const textbox = $("#postTextarea");

  const data = {
    content: textbox.val().trim(),
  };

  $.post("/api/posts", data, (postData, status, xhr) => {
    let html = createPostHtml(postData);
    $(".postsContainer").prepend(html);
    textbox.val("");
    submitButton.prop("disabled", true);
  });
});

function createHomePostsHtml(postsData, container) {
  container.html("");

  if (!Array.isArray(postsData)) {
    postsData = [postsData];
  }

  if (postsData.length === 0) {
    return container.append("<span>No results found</span>");
  }

  return postsData.forEach((post) => {
    let html = createPostHtml(post);
    container.append(html);
  });
}

// createPostHtml
function createPostHtml(postData, largeFont = false) {
  if (!postData) {
    return null;
  }

  const largeFontClass = largeFont ? "largeFont" : "";
  const date = timeAgo(new Date(), new Date(postData.createdAt));
  const likeButtonActiveClass =
    postData.likes && postData.likes.includes(userLoggedIn._id) ? "active" : "";
  const repostButtonActiveClass =
    postData.repostUsers && postData.repostUsers.includes(userLoggedIn._id)
      ? "active"
      : "";

  const isRepost = postData.repostData !== undefined;
  const repostedBy = isRepost
    ? postData.postedBy && postData.postedBy.userName
    : null;
  postData = isRepost ? postData.repostData : postData;
  if (!postData) {
    return;
  }

  let repostText = "";
  if (isRepost) {
    repostText = `<i class="fas fa-share"></i> <span>Repost by <a href="/profile/${repostedBy}">@${repostedBy}</a></span>`;
  }

  let replyFlag = "";
  if (postData.replyTo && postData.replyTo._id) {
    let replyToUserName =
      postData.replyTo.postedBy && postData.replyTo.postedBy.userName;
    replyFlag = `<div class="replyFlag">
      Replying to <a href="/profile/${replyToUserName}">@${replyToUserName}</a>
    </div>`;
  }
  return `<div class="post ${largeFontClass}" data-id="${postData._id}">
      <div class="postActionContainer">
      ${repostText}
      </div>
      <div class="mainContentContainer">
        <div class="userImageContainer">
          <img src="${postData.postedBy && postData.postedBy.profilePic}" />
        </div>
        <div class="postContentContainer">
          <div class="header">
            <a href="/profile/${
              postData.postedBy && postData.postedBy.userName
            }" class="displayName">
              ${postData.postedBy && postData.postedBy.firstName} ${
    postData.postedBy && postData.postedBy.lastName
  }
            </a>
            <span class="username">@${
              postData.postedBy && postData.postedBy.userName
            }</span>
            <span class="date">${date}</span>
          </div>
          ${replyFlag}
          <div class="postBody">
            <span>${postData.content}</span>
          </div>
          <div class="postFooter">
            <div class="postButtonContainer">
              <button data-toggle="modal" data-target="#replyModal">
                <i class="far fa-comment"></i>
              </button>
            </div>
            <div class="postButtonContainer green">
              <button class="repost ${repostButtonActiveClass}">
                <i class="fas fa-share"></i>
                <span>${
                  (postData.repostUsers && postData.repostUsers.length) || ""
                }</span>
              </button>
            </div>
            <div class="postButtonContainer red">
              <button class="likeButton ${likeButtonActiveClass}">
                <i class="far fa-thumbs-up"></i>
                <span>${(postData.likes && postData.likes.length) || ""}</span>
              </button>
              
            </div>
          </div>
        </div>        
      </div>
    </div>`;
}

// timestamps
function timeAgo(current, previous) {
  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = current - previous;

  if (elapsed < msPerMinute) {
    if (elapsed / 1000 < 30) return "just now";
    return Math.round(elapsed / 1000) + " seconds ago";
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + " minutes ago";
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + " hours ago";
  } else if (elapsed < msPerMonth) {
    return Math.round(elapsed / msPerDay) + " days ago";
  } else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerMonth) + " months ago";
  } else {
    return Math.round(elapsed / msPerYear) + " years ago";
  }
}

// like post feature
$(document).on("click", ".likeButton", (event) => {
  const button = $(event.target);
  const postId = getPostIdFromElement(button);
  if (!postId) {
    return;
  }

  $.ajax({
    url: `/api/posts/${postId}/like`,
    type: "PUT",
    success: (postData) => {
      button.find("span").text((postData.likes && postData.likes.length) || "");

      if (postData.likes && postData.likes.includes(userLoggedIn._id)) {
        button.addClass("active");
      } else {
        button.removeClass("active");
      }
    },
  });
});

// get post id
function getPostIdFromElement(element) {
  const root = element.hasClass("post");
  const rootElement = root ? element : element.closest(".post");
  const postId = rootElement.data().id;

  if (!postId) {
    return;
  }

  return postId;
}

// REPOST post feature
$(document).on("click", ".repost", (event) => {
  const button = $(event.target);
  const postId = getPostIdFromElement(button);
  if (!postId) {
    return;
  }

  $.ajax({
    url: `/api/posts/${postId}/repost`,
    type: "POST",
    success: (postData) => {
      button
        .find("span")
        .text((postData.repostUsers && postData.repostUsers.length) || "");
      if (
        postData.repostUsers &&
        postData.repostUsers.includes(userLoggedIn._id)
      ) {
        button.addClass("active");
      } else {
        button.removeClass("active");
      }
    },
  });
});

// REPLY TO A POST
$("#replyModal").on("show.bs.modal", (event) => {
  const button = $(event.relatedTarget);
  const postId = getPostIdFromElement(button);
  console.log(postId);
  $("#submitReplyButton").data("id", postId);

  $.get(`/api/posts/${postId}`, (results, status, xhr) => {
    createHomePostsHtml(results.postData, $(".originalPostContainter"));
  });
});

$("#replyModal").on("hidden.bs.modal", () => {
  $(".originalPostContainter").html("");
  $("#replyTextarea").html("");
});

//submit post /api/posts
$("#submitReplyButton").click((event) => {
  const submitButton = $(event.target);
  const textbox = $("#replyTextarea");
  const postId = submitButton.data().id;
  console.log(postId);

  const data = {
    content: textbox.val().trim(),
    replyTo: postId,
  };

  $.post("/api/posts", data, (postData, status, xhr) => {
    location.reload();
  });
});

// View single post feature
$(document).on("click", ".post", (event) => {
  const element = $(event.target);
  const postId = getPostIdFromElement(element);
  if (postId && !element.is("button")) {
    return (window.location.href = `/posts/${postId}`);
  }
  return;
});

// postPage
function createPostHtmlWithReplies(results, container) {
  container.html("");

  if (results.replyTo && results.replyTo._id) {
    let html = createPostHtml(results.replyTo);
    container.append(html);
  }

  let mainPostHtml = createPostHtml(results.postData, true);
  container.append(mainPostHtml);

  return results.replies.forEach((post) => {
    let html = createPostHtml(post);
    container.append(html);
  });
}
