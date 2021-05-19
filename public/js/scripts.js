// disable and enable post button
$("#postTextarea").keyup((event) => {
  const textbox = $(event.target);
  const value = textbox.val().trim();

  const submitButton = $("#submitPostButton");

  if (submitButton.length == 0) return alert("No submit button found");

  if (value == "") {
    submitButton.prop("disabled", true);
    return;
  }

  submitButton.prop("disabled", false);
});

// submit post /api/post
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

// time ago

function createPostHtml(postData) {
  const date = timeAgo(new Date(), new Date(postData.createdAt));
  return `<div class="post">
      <div class="mainContentContainer">
        <div class="userImageContainer">
          <img src="${postData.postedBy.profilePic}" />
        </div>
        <div class="postContentContainer">
          <div class="header">
            <a href="/profile/${postData.postedBy.userName}" class="displayName">
              ${postData.postedBy.firstName} ${postData.postedBy.lastName}
            </a>
            <span class="username">@${postData.postedBy.userName}</span>
            <span class="date">${date}</span>
          </div>
          <div class="postBody">
            <span>${postData.content}</span>
          </div>
          <div class="postFooter">
            <div class="postButtonContainer">
              <button>
                <i class="far fa-comment"></i>
              </button>
            </div>
            <div class="postButtonContainer">
              <button>
                <i class="fas fa-share"></i>
              </button>
            </div>
            <div class="postButtonContainer">
              <button>
                <i class="far fa-thumbs-up"></i>
              </button>
            </div>
          </div>
        </div>        
      </div>
    </div>`;
}

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
